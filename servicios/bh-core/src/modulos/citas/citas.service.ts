import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EstadoCita, EstadoUsuario, MetodoPago, Prisma } from '@prisma/client';

import { CancelarCitaDto } from './dto/cancelar-cita.dto';
import { ConsultarDisponibilidadDto } from './dto/consultar-disponibilidad.dto';
import { CrearCitaDto } from './dto/crear-cita.dto';
import { FiltroCitasDto } from './dto/filtro-citas.dto';
import { PrismaService } from '../../basedatos/prisma.service';
import { JwtPayload } from '../autenticacion/interfaces/jwt-payload.interface';
import { CorreosService } from '../correos/correos.service';

/**
 * Servicio encargado de gestionar el agendamiento y ciclo de vida de citas.
 *
 * @class CitasService
 */
@Injectable()
export class CitasService {
  private readonly horariosAtencion = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly correosService: CorreosService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Lista citas aplicando filtros dinamicos, paginacion y alcance por rol.
   *
   * @param filtros Filtros de busqueda, paginacion y rango de fechas.
   * @param usuario Usuario autenticado usado para aplicar alcance por rol.
   * @returns Resultado paginado con citas formateadas.
   */
  async listarCitas(filtros: FiltroCitasDto, usuario: JwtPayload) {
    const page = filtros.page ?? 0;
    const size = filtros.size ?? 20;

    this.validarRangoFechas(filtros.fechaDesde, filtros.fechaHasta);

    const where = this.construirFiltrosListado(filtros, usuario);

    const [citas, totalElements] = await Promise.all([
      this.prisma.cita.findMany({
        where,
        include: this.incluirRelacionesCita(),
        orderBy: [
          {
            fecha: 'desc',
          },
          {
            hora: 'desc',
          },
        ],
        skip: page * size,
        take: size,
      }),
      this.prisma.cita.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalElements / size);

    return {
      page,
      size,
      totalElements,
      totalPages,
      first: page === 0,
      last: totalPages === 0 || page >= totalPages - 1,
      content: citas.map((cita) => this.formatearCita(cita)),
    };
  }

  /**
   * Obtiene una cita por ID respetando el alcance del rol autenticado.
   *
   * @param id Identificador UUID de la cita.
   * @param usuario Usuario autenticado que solicita la informacion.
   * @returns Cita formateada con relaciones principales.
   */
  async obtenerCitaPorId(id: string, usuario: JwtPayload) {
    const cita = await this.prisma.cita.findUnique({
      where: {
        id,
      },
      include: this.incluirRelacionesCita(),
    });

    if (!cita) {
      throw new NotFoundException({
        codigo: 'CITA_NO_ENCONTRADA',
        mensaje: 'La cita solicitada no existe.',
      });
    }

    this.validarAccesoCita(cita, usuario);

    return this.formatearCita(cita);
  }

  /**
   * Consulta horarios disponibles de un veterinario en una fecha.
   *
   * @param query Datos de consulta con veterinario y fecha.
   * @returns Fecha, veterinario y lista de horarios libres.
   */
  async consultarDisponibilidad(query: ConsultarDisponibilidadDto) {
    const fecha = this.construirFechaCita(query.fecha);

    const veterinario = await this.prisma.usuario.findUnique({
      where: {
        id: query.veterinarioId,
      },
      include: {
        rol: true,
      },
    });

    if (
      !veterinario ||
      veterinario.rol.nombre !== 'VETERINARIO' ||
      veterinario.estado !== EstadoUsuario.ACTIVO
    ) {
      throw new NotFoundException({
        codigo: 'VETERINARIO_NO_DISPONIBLE',
        mensaje: 'El veterinario seleccionado no existe o no esta activo.',
      });
    }

    const citasOcupadas = await this.prisma.cita.findMany({
      where: {
        veterinarioId: query.veterinarioId,
        fecha,
        estado: EstadoCita.CONFIRMADA,
      },
      select: {
        hora: true,
      },
    });

    const horasOcupadas = new Set(citasOcupadas.map((cita) => cita.hora));

    return {
      fecha: query.fecha,
      veterinarioId: query.veterinarioId,
      horariosDisponibles: this.horariosAtencion.filter(
        (hora) => !horasOcupadas.has(hora),
      ),
    };
  }

  /**
   * Cancela una cita confirmada registrando el motivo de cancelacion.
   *
   * @param id Identificador UUID de la cita.
   * @param cancelarCitaDto Datos con el motivo de cancelacion.
   * @param usuario Usuario autenticado que ejecuta la accion.
   * @returns Cita formateada con estado actualizado.
   */
  async cancelarCita(
    id: string,
    cancelarCitaDto: CancelarCitaDto,
    usuario: JwtPayload,
  ) {
    const cita = await this.prisma.cita.findUnique({
      where: {
        id,
      },
      include: this.incluirRelacionesCita(),
    });

    if (!cita) {
      throw new NotFoundException({
        codigo: 'CITA_NO_ENCONTRADA',
        mensaje: 'La cita solicitada no existe.',
      });
    }

    this.validarAccesoCita(cita, usuario);
    this.validarCitaCancelable(cita);

    const citaCancelada = await this.prisma.cita.update({
      where: {
        id,
      },
      data: {
        estado: EstadoCita.CANCELADA,
        motivoCancelacion: cancelarCitaDto.motivo,
      },
      include: this.incluirRelacionesCita(),
    });

    return this.formatearCita(citaCancelada);
  }

  /**
   * Finaliza una cita despues de validar que exista historial medico.
   *
   * @param id Identificador UUID de la cita.
   * @param usuario Veterinario autenticado que finaliza la cita.
   * @returns Cita formateada con estado finalizado.
   */
  async finalizarCita(id: string, usuario: JwtPayload) {
    const cita = await this.prisma.cita.findUnique({
      where: {
        id,
      },
      include: this.incluirRelacionesCita(),
    });

    if (!cita) {
      throw new NotFoundException({
        codigo: 'CITA_NO_ENCONTRADA',
        mensaje: 'La cita solicitada no existe.',
      });
    }

    this.validarAccesoCita(cita, usuario);
    this.validarCitaFinalizable(cita);

    const historial = await this.prisma.historialMedico.findFirst({
      where: {
        mascotaId: cita.mascota.id,
        veterinarioId: usuario.sub,
        creadoEn: {
          gte: this.obtenerInicioDia(cita.fecha),
          lt: this.obtenerFinDia(cita.fecha),
        },
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });

    if (!historial) {
      throw new BadRequestException({
        codigo: 'HISTORIAL_MEDICO_REQUERIDO',
        mensaje:
          'Debe registrar el historial medico de la atencion antes de finalizar la cita.',
      });
    }

    const citaFinalizada = await this.prisma.cita.update({
      where: {
        id,
      },
      data: {
        estado: EstadoCita.FINALIZADA,
      },
      include: this.incluirRelacionesCita(),
    });

    return this.formatearCita(citaFinalizada);
  }

  /**
   * Agenda una cita con pago obligatorio.
   *
   * @param crearCitaDto Datos necesarios para crear la cita y registrar el pago.
   * @param usuario Usuario autenticado que agenda la cita.
   * @returns Cita creada con relaciones, servicios y pago.
   */
  async crearCita(crearCitaDto: CrearCitaDto, usuario: JwtPayload) {
    this.validarPagoObligatorio(crearCitaDto);
    this.validarServiciosSinDuplicados(crearCitaDto.servicioIds);

    const pago = crearCitaDto.pago;

    if (!pago) {
      throw new UnprocessableEntityException({
        codigo: 'PAGO_OBLIGATORIO',
        mensaje: 'El pago es obligatorio para agendar la cita.',
      });
    }

    const fechaCita = this.construirFechaCita(crearCitaDto.fecha);

    const [mascota, veterinario, servicios, citaOcupada] = await Promise.all([
      this.prisma.mascota.findUnique({
        where: {
          id: crearCitaDto.mascotaId,
        },
        include: {
          cliente: true,
        },
      }),
      this.prisma.usuario.findUnique({
        where: {
          id: crearCitaDto.veterinarioId,
        },
        include: {
          rol: true,
        },
      }),
      this.prisma.servicio.findMany({
        where: {
          id: {
            in: crearCitaDto.servicioIds,
          },
          activo: true,
        },
      }),
      this.prisma.cita.findFirst({
        where: {
          veterinarioId: crearCitaDto.veterinarioId,
          fecha: fechaCita,
          hora: crearCitaDto.hora,
          estado: EstadoCita.CONFIRMADA,
        },
      }),
    ]);

    if (!mascota) {
      throw new NotFoundException({
        codigo: 'MASCOTA_NO_ENCONTRADA',
        mensaje: 'La mascota seleccionada no existe.',
      });
    }

    if (
      usuario.rol === 'CLIENTE' &&
      mascota.cliente.usuarioId !== usuario.sub
    ) {
      throw new ForbiddenException({
        codigo: 'MASCOTA_NO_PERTENECE_AL_CLIENTE',
        mensaje: 'La mascota seleccionada no pertenece al cliente autenticado.',
      });
    }

    if (
      !veterinario ||
      veterinario.rol.nombre !== 'VETERINARIO' ||
      veterinario.estado !== EstadoUsuario.ACTIVO
    ) {
      throw new NotFoundException({
        codigo: 'VETERINARIO_NO_DISPONIBLE',
        mensaje: 'El veterinario seleccionado no existe o no esta activo.',
      });
    }

    if (servicios.length !== crearCitaDto.servicioIds.length) {
      throw new BadRequestException({
        codigo: 'SERVICIOS_INVALIDOS',
        mensaje: 'Uno o mas servicios no existen o no estan activos.',
      });
    }

    if (citaOcupada) {
      throw new ConflictException({
        codigo: 'HORARIO_OCUPADO',
        mensaje: 'El veterinario ya tiene una cita agendada en ese horario.',
      });
    }

    const montoTotal = this.calcularMontoTotal(servicios);

    const cita = await this.prisma.$transaction(async (tx) => {
      const citaExistente = await tx.cita.findFirst({
        where: {
          veterinarioId: crearCitaDto.veterinarioId,
          fecha: fechaCita,
          hora: crearCitaDto.hora,
          estado: EstadoCita.CONFIRMADA,
        },
      });

      if (citaExistente) {
        throw new ConflictException({
          codigo: 'HORARIO_OCUPADO',
          mensaje: 'El veterinario ya tiene una cita agendada en ese horario.',
        });
      }

      return tx.cita.create({
        data: {
          fecha: fechaCita,
          hora: crearCitaDto.hora,
          estado: EstadoCita.CONFIRMADA,
          montoTotal,
          mascotaId: mascota.id,
          veterinarioId: veterinario.id,
          servicios: {
            create: servicios.map((servicio) => ({
              servicioId: servicio.id,
              precioAplicado: servicio.precio,
            })),
          },
          pago: {
            create: {
              metodo: pago.metodo,
              referencia: pago.referencia,
              monto: montoTotal,
            },
          },
        },
        include: this.incluirRelacionesCita(),
      });
    });

    await this.enviarCorreoConfirmacion(cita);

    return this.formatearCita(cita);
  }

  /**
   * Valida que la cita tenga pago y que la referencia exista cuando aplica.
   *
   * @param crearCitaDto Datos de la cita a validar.
   * @returns No retorna valor; lanza excepcion si el pago es invalido.
   */
  private validarPagoObligatorio(crearCitaDto: CrearCitaDto) {
    if (!crearCitaDto.pago) {
      throw new UnprocessableEntityException({
        codigo: 'PAGO_OBLIGATORIO',
        mensaje: 'El pago es obligatorio para agendar la cita.',
      });
    }

    const requiereReferencia =
      crearCitaDto.pago.metodo === MetodoPago.TARJETA ||
      crearCitaDto.pago.metodo === MetodoPago.TRANSFERENCIA;

    if (requiereReferencia && !crearCitaDto.pago.referencia?.trim()) {
      throw new UnprocessableEntityException({
        codigo: 'PAGO_INCOMPLETO',
        mensaje:
          'La referencia del pago es obligatoria para tarjeta o transferencia.',
      });
    }
  }

  /**
   * Evita que la misma cita incluya servicios repetidos.
   *
   * @param servicioIds Identificadores de servicios seleccionados.
   * @returns No retorna valor; lanza excepcion si hay duplicados.
   */
  private validarServiciosSinDuplicados(servicioIds: string[]) {
    const serviciosUnicos = new Set(servicioIds);

    if (serviciosUnicos.size !== servicioIds.length) {
      throw new BadRequestException({
        codigo: 'SERVICIOS_DUPLICADOS',
        mensaje: 'No se puede seleccionar el mismo servicio mas de una vez.',
      });
    }
  }

  /**
   * Convierte una fecha YYYY-MM-DD a Date en inicio de dia UTC.
   *
   * @param fecha Fecha en formato YYYY-MM-DD.
   * @returns Objeto Date ubicado al inicio del dia UTC.
   */
  private construirFechaCita(fecha: string): Date {
    return new Date(`${fecha}T00:00:00.000Z`);
  }

  /**
   * Obtiene el inicio del dia UTC para buscar registros relacionados.
   *
   * @param fecha Fecha base.
   * @returns Inicio del dia UTC correspondiente.
   */
  private obtenerInicioDia(fecha: Date): Date {
    return new Date(`${fecha.toISOString().slice(0, 10)}T00:00:00.000Z`);
  }

  /**
   * Obtiene el limite superior del dia UTC para consultas por rango.
   *
   * @param fecha Fecha base.
   * @returns Inicio del dia siguiente en UTC.
   */
  private obtenerFinDia(fecha: Date): Date {
    const finDia = this.obtenerInicioDia(fecha);
    finDia.setUTCDate(finDia.getUTCDate() + 1);
    return finDia;
  }

  /**
   * Valida que el rango de fechas del filtro tenga orden cronologico.
   *
   * @param fechaDesde Fecha inicial opcional.
   * @param fechaHasta Fecha final opcional.
   * @returns No retorna valor; lanza excepcion si el rango es invalido.
   */
  private validarRangoFechas(fechaDesde?: string, fechaHasta?: string) {
    if (!fechaDesde || !fechaHasta) {
      return;
    }

    const fechaInicio = this.construirFechaCita(fechaDesde);
    const fechaFin = this.construirFechaCita(fechaHasta);

    if (fechaInicio > fechaFin) {
      throw new BadRequestException({
        codigo: 'RANGO_FECHAS_INVALIDO',
        mensaje: 'La fecha desde no puede ser mayor que la fecha hasta.',
      });
    }
  }

  /**
   * Construye el filtro Prisma para listar citas segun filtros y rol.
   *
   * @param filtros Filtros enviados por query params.
   * @param usuario Usuario autenticado para aplicar alcance por rol.
   * @returns Objeto where compatible con Prisma.
   */
  private construirFiltrosListado(
    filtros: FiltroCitasDto,
    usuario: JwtPayload,
  ): Prisma.CitaWhereInput {
    const where: Prisma.CitaWhereInput = {
      ...(filtros.veterinarioId && {
        veterinarioId: filtros.veterinarioId,
      }),
      ...(filtros.mascotaId && {
        mascotaId: filtros.mascotaId,
      }),
      ...(filtros.estado && {
        estado: filtros.estado,
      }),
      ...this.construirFiltroFechas(filtros.fechaDesde, filtros.fechaHasta),
    };

    this.aplicarAlcancePorRol(where, usuario);

    return where;
  }

  /**
   * Construye el filtro Prisma para limitar citas por fecha desde/hasta.
   *
   * @param fechaDesde Fecha inicial opcional.
   * @param fechaHasta Fecha final opcional.
   * @returns Fragmento de filtro Prisma para fechas.
   */
  private construirFiltroFechas(
    fechaDesde?: string,
    fechaHasta?: string,
  ): Prisma.CitaWhereInput {
    if (!fechaDesde && !fechaHasta) {
      return {};
    }

    return {
      fecha: {
        ...(fechaDesde && {
          gte: this.construirFechaCita(fechaDesde),
        }),
        ...(fechaHasta && {
          lte: this.construirFechaCita(fechaHasta),
        }),
      },
    };
  }

  /**
   * Ajusta el filtro de listado segun el alcance permitido para cada rol.
   *
   * @param where Filtro Prisma que sera modificado.
   * @param usuario Usuario autenticado.
   * @returns No retorna valor; modifica el filtro recibido.
   */
  private aplicarAlcancePorRol(
    where: Prisma.CitaWhereInput,
    usuario: JwtPayload,
  ) {
    if (usuario.rol === 'CLIENTE') {
      where.mascota = {
        cliente: {
          usuarioId: usuario.sub,
        },
      };

      return;
    }

    if (usuario.rol === 'VETERINARIO') {
      where.veterinarioId = usuario.sub;
    }
  }

  /**
   * Valida que el usuario autenticado tenga permiso para ver o modificar la cita.
   *
   * @param cita Cita cargada con relaciones.
   * @param usuario Usuario autenticado.
   * @returns No retorna valor; lanza excepcion si no tiene acceso.
   */
  private validarAccesoCita(
    cita: Prisma.CitaGetPayload<{
      include: ReturnType<CitasService['incluirRelacionesCita']>;
    }>,
    usuario: JwtPayload,
  ) {
    if (
      usuario.rol === 'CLIENTE' &&
      cita.mascota.cliente.usuarioId !== usuario.sub
    ) {
      throw new ForbiddenException({
        codigo: 'CITA_NO_PERTENECE_AL_CLIENTE',
        mensaje: 'La cita solicitada no pertenece al cliente autenticado.',
      });
    }

    if (usuario.rol === 'VETERINARIO' && cita.veterinarioId !== usuario.sub) {
      throw new ForbiddenException({
        codigo: 'CITA_NO_ASIGNADA_AL_VETERINARIO',
        mensaje:
          'La cita solicitada no esta asignada al veterinario autenticado.',
      });
    }
  }

  /**
   * Verifica que una cita pueda cancelarse segun su estado actual.
   *
   * @param cita Cita cargada con relaciones.
   * @returns No retorna valor; lanza excepcion si no es cancelable.
   */
  private validarCitaCancelable(
    cita: Prisma.CitaGetPayload<{
      include: ReturnType<CitasService['incluirRelacionesCita']>;
    }>,
  ) {
    if (cita.estado === EstadoCita.FINALIZADA) {
      throw new BadRequestException({
        codigo: 'CITA_YA_ATENDIDA',
        mensaje: 'La cita ya fue atendida y no puede cancelarse.',
      });
    }

    if (cita.estado === EstadoCita.CANCELADA) {
      throw new BadRequestException({
        codigo: 'CITA_YA_CANCELADA',
        mensaje: 'La cita ya se encuentra cancelada.',
      });
    }
  }

  /**
   * Verifica que una cita pueda finalizarse segun su estado actual.
   *
   * @param cita Cita cargada con relaciones.
   * @returns No retorna valor; lanza excepcion si no es finalizable.
   */
  private validarCitaFinalizable(
    cita: Prisma.CitaGetPayload<{
      include: ReturnType<CitasService['incluirRelacionesCita']>;
    }>,
  ) {
    if (cita.estado === EstadoCita.FINALIZADA) {
      throw new BadRequestException({
        codigo: 'CITA_YA_FINALIZADA',
        mensaje: 'La cita ya se encuentra finalizada.',
      });
    }

    if (cita.estado === EstadoCita.CANCELADA) {
      throw new BadRequestException({
        codigo: 'CITA_CANCELADA',
        mensaje: 'La cita cancelada no puede finalizarse.',
      });
    }
  }

  /**
   * Calcula el total de la cita sumando los precios de los servicios.
   *
   * @param servicios Servicios activos seleccionados.
   * @returns Total calculado como Decimal de Prisma.
   */
  private calcularMontoTotal(
    servicios: Array<{
      precio: Prisma.Decimal;
    }>,
  ): Prisma.Decimal {
    return servicios.reduce(
      (total, servicio) => total.plus(servicio.precio),
      new Prisma.Decimal(0),
    );
  }

  /**
   * Define las relaciones de Prisma necesarias para devolver una cita completa.
   *
   * @returns Configuracion include para consultas de cita.
   */
  private incluirRelacionesCita() {
    return {
      mascota: {
        include: {
          cliente: true,
        },
      },
      veterinario: {
        include: {
          rol: true,
        },
      },
      servicios: {
        include: {
          servicio: true,
        },
      },
      pago: true,
    } satisfies Prisma.CitaInclude;
  }

  /**
   * Envia correo de confirmacion al cliente despues de agendar una cita.
   *
   * @param cita Cita creada con relaciones necesarias para el correo.
   * @returns Promesa que finaliza cuando el correo fue enviado.
   */
  private async enviarCorreoConfirmacion(
    cita: Prisma.CitaGetPayload<{
      include: ReturnType<CitasService['incluirRelacionesCita']>;
    }>,
  ) {
    const direccionSede =
      this.configService.get<string>('CLINIC_ADDRESS') ??
      'Direccion de la sede principal';

    await this.correosService.enviarConfirmacionCita(
      cita.mascota.cliente.email,
      {
        nombreCliente: `${cita.mascota.cliente.nombre} ${cita.mascota.cliente.apellido}`,
        nombreMascota: cita.mascota.nombre,
        fecha: cita.fecha.toISOString().slice(0, 10),
        hora: cita.hora,
        nombreVeterinario: cita.veterinario.nombreCompleto,
        direccion: direccionSede,
      },
    );
  }

  /**
   * Normaliza la cita para responder datos de mascota, cliente, veterinario y pago.
   *
   * @param cita Cita cargada desde Prisma con relaciones.
   * @returns Objeto de respuesta usado por los endpoints de citas.
   */
  private formatearCita(
    cita: Prisma.CitaGetPayload<{
      include: ReturnType<CitasService['incluirRelacionesCita']>;
    }>,
  ) {
    return {
      id: cita.id,
      mascota: {
        id: cita.mascota.id,
        nombre: cita.mascota.nombre,
        especie: cita.mascota.especie,
        cliente: {
          id: cita.mascota.cliente.id,
          nombre: cita.mascota.cliente.nombre,
          apellido: cita.mascota.cliente.apellido,
          email: cita.mascota.cliente.email,
        },
      },
      veterinario: {
        id: cita.veterinario.id,
        nombreCompleto: cita.veterinario.nombreCompleto,
        correo: cita.veterinario.correo,
      },
      fecha: cita.fecha.toISOString().slice(0, 10),
      hora: cita.hora,
      servicios: cita.servicios.map((citaServicio) => ({
        id: citaServicio.servicio.id,
        nombre: citaServicio.servicio.nombre,
        precio: citaServicio.precioAplicado.toNumber(),
      })),
      montoTotal: cita.montoTotal.toNumber(),
      pago: cita.pago
        ? {
            id: cita.pago.id,
            metodo: cita.pago.metodo,
            referencia: cita.pago.referencia,
            monto: cita.pago.monto.toNumber(),
            fechaPago: cita.pago.fechaPago,
          }
        : null,
      estado: cita.estado,
      motivoCancelacion: cita.motivoCancelacion,
      creadoEn: cita.creadoEn,
    };
  }
}

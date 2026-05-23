import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EstadoCita, EstadoUsuario, Prisma } from '@prisma/client';

import { CrearCitaDto } from './dto/crear-cita.dto';
import { FiltroCitasDto } from './dto/filtro-citas.dto';
import { PrismaService } from '../../basedatos/prisma.service';
import { JwtPayload } from '../autenticacion/interfaces/jwt-payload.interface';
import { CorreosService } from '../correos/correos.service';

/**
 * Servicio encargado de gestionar el agendamiento y ciclo de vida de citas.
 */
@Injectable()
export class CitasService {
  constructor(
      private readonly prisma: PrismaService,
      private readonly correosService: CorreosService,
      private readonly configService: ConfigService,
  ) {}

  /**
   * Lista citas aplicando filtros dinamicos, paginacion y alcance por rol.
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
   * Consulta horarios disponibles para un veterinario en una fecha.
   * Regla simple por defecto: franjas horarias por hora entre 08:00 y 17:00.
   */
  async consultarDisponibilidad(
      query: { veterinarioId: string; fecha: string },
      usuario: JwtPayload,
  ) {
    const fechaCita = this.construirFechaCita(query.fecha);

    const citas = await this.prisma.cita.findMany({
      where: {
        veterinarioId: query.veterinarioId,
        fecha: fechaCita,
        estado: EstadoCita.CONFIRMADA,
      },
      select: {
        hora: true,
      },
    });

    const ocupadas = new Set(citas.map((c) => c.hora));

    const horarios: string[] = [];
    const apertura = 8;
    const cierre = 17;

    for (let h = apertura; h <= cierre; h++) {
      const hora = `${h.toString().padStart(2, '0')}:00`;
      if (!ocupadas.has(hora)) {
        horarios.push(hora);
      }
    }

    return {
      fecha: query.fecha,
      veterinarioId: query.veterinarioId,
      horariosDisponibles: horarios,
    };
  }

  /**
   * Obtiene una cita por su ID aplicando reglas de acceso por rol.
   */
  async obtenerCita(citaId: string, usuario: JwtPayload) {
    const where: Prisma.CitaWhereInput = { id: citaId };

    this.aplicarAlcancePorRol(where, usuario);

    const cita = await this.prisma.cita.findFirst({
      where,
      include: this.incluirRelacionesCita(),
    });

    if (!cita) {
      throw new NotFoundException({
        codigo: 'CITA_NO_ENCONTRADA',
        mensaje: 'La cita solicitada no existe o no tienes permiso para verla.',
      });
    }

    return this.formatearCita(cita);
  }

  /**
   * Marca una cita como finalizada.
   */
  async finalizarCita(citaId: string, usuario: JwtPayload) {
    const cita = await this.prisma.cita.findFirst({
      where: {
        id: citaId,
        veterinarioId: usuario.sub,
      },
      include: this.incluirRelacionesCita(),
    });

    if (!cita) {
      throw new NotFoundException({
        codigo: 'CITA_NO_ENCONTRADA',
        mensaje: 'La cita no existe o no pertenece al veterinario autenticado.',
      });
    }

    if (cita.estado !== EstadoCita.CONFIRMADA) {
      throw new BadRequestException({
        codigo: 'CITA_NO_FINALIZABLE',
        mensaje:
            'Solo las citas confirmadas pueden marcarse como finalizadas.',
      });
    }

    const citaActualizada = await this.prisma.cita.update({
      where: { id: cita.id },
      data: {
        estado: EstadoCita.FINALIZADA,
      },
      include: this.incluirRelacionesCita(),
    });

    return this.formatearCita(citaActualizada);
  }

  /**
   * Cancela una cita y almacena el motivo de cancelación.
   */
  async cancelarCita(
      citaId: string,
      motivoRequest: { motivo: string },
      usuario: JwtPayload,
  ) {
    const cita = await this.prisma.cita.findUnique({
      where: { id: citaId },
      include: this.incluirRelacionesCita(),
    });

    if (!cita) {
      throw new NotFoundException({
        codigo: 'CITA_NO_ENCONTRADA',
        mensaje: 'La cita solicitada no existe.',
      });
    }

    if (
        cita.estado === EstadoCita.FINALIZADA ||
        cita.estado === EstadoCita.CANCELADA
    ) {
      throw new BadRequestException({
        codigo: 'CITA_NO_CANCELABLE',
        mensaje: 'La cita ya fue atendida o no puede cancelarse.',
      });
    }

    const citaActualizada = await this.prisma.cita.update({
      where: { id: cita.id },
      data: {
        estado: EstadoCita.CANCELADA,
        motivoCancelacion: motivoRequest.motivo,
      },
      include: this.incluirRelacionesCita(),
    });

    return this.formatearCita(citaActualizada);
  }

  /**
   * Agenda una cita con pago obligatorio.
   */
  async crearCita(crearCitaDto: CrearCitaDto, usuario: JwtPayload) {
    this.validarPagoObligatorio(crearCitaDto);
    this.validarServiciosSinDuplicados(crearCitaDto.servicioIds);

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

    if (usuario.rol === 'CLIENTE' && mascota.clienteId !== usuario.sub) {
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
              metodo: crearCitaDto.pago.metodo,
              referencia: crearCitaDto.pago.referencia,
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
   * Obtiene las citas en un rango de fechas para generar el reporte PDF.
   * Solo accesible por el administrador.
   */
  async obtenerCitasParaReporte(fechaDesde: string, fechaHasta: string) {
    this.validarRangoFechas(fechaDesde, fechaHasta);

    const citas = await this.prisma.cita.findMany({
      where: {
        fecha: {
          gte: this.construirFechaCita(fechaDesde),
          lte: this.construirFechaCita(fechaHasta),
        },
      },
      include: this.incluirRelacionesCita(),
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });

    return citas.map((cita) => ({
      id: cita.id,
      fecha: cita.fecha.toISOString().slice(0, 10),
      hora: cita.hora,
      estado: cita.estado,
      cliente: cita.mascota.cliente.nombreCompleto,
      mascota: cita.mascota.nombre,
      veterinario: cita.veterinario.nombreCompleto,
    }));
  }

  private validarPagoObligatorio(crearCitaDto: CrearCitaDto) {
    if (!crearCitaDto.pago) {
      throw new UnprocessableEntityException({
        codigo: 'PAGO_OBLIGATORIO',
        mensaje: 'El pago es obligatorio para agendar la cita.',
      });
    }
  }

  private validarServiciosSinDuplicados(servicioIds: string[]) {
    const serviciosUnicos = new Set(servicioIds);

    if (serviciosUnicos.size !== servicioIds.length) {
      throw new BadRequestException({
        codigo: 'SERVICIOS_DUPLICADOS',
        mensaje: 'No se puede seleccionar el mismo servicio mas de una vez.',
      });
    }
  }

  private construirFechaCita(fecha: string): Date {
    return new Date(`${fecha}T00:00:00.000Z`);
  }

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

  private aplicarAlcancePorRol(
      where: Prisma.CitaWhereInput,
      usuario: JwtPayload,
  ) {
    if (usuario.rol === 'CLIENTE') {
      where.mascota = {
        clienteId: usuario.sub,
      };

      return;
    }

    if (usuario.rol === 'VETERINARIO') {
      where.veterinarioId = usuario.sub;
    }
  }

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

  private async enviarCorreoConfirmacion(
      cita: Prisma.CitaGetPayload<{
        include: ReturnType<CitasService['incluirRelacionesCita']>;
      }>,
  ) {
    const direccionSede =
        this.configService.get<string>('CLINIC_ADDRESS') ??
        'Direccion de la sede principal';

    await this.correosService.enviarConfirmacionCita(
        cita.mascota.cliente.correo,
        {
          nombreCliente: cita.mascota.cliente.nombreCompleto,
          nombreMascota: cita.mascota.nombre,
          fecha: cita.fecha.toISOString().slice(0, 10),
          hora: cita.hora,
          nombreVeterinario: cita.veterinario.nombreCompleto,
          direccion: direccionSede,
        },
    );
  }

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
          nombreCompleto: cita.mascota.cliente.nombreCompleto,
          correo: cita.mascota.cliente.correo,
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
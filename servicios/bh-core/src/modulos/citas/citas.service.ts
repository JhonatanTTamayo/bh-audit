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
   * Obtiene una cita por ID respetando el alcance del rol autenticado.
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
   * Agenda una cita con pago obligatorio.
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

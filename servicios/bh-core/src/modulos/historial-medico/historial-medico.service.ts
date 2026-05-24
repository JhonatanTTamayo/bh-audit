import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../basedatos/prisma.service';
import { InventarioService } from '../inventario/inventario.service';
import { JwtPayload } from '../autenticacion/interfaces/jwt-payload.interface';
import { CrearHistorialMedicoDto } from './dto/crear-historial-medico.dto';
import { FiltroHistorialMedicoDto } from './dto/filtro-historial-medico.dto';

/**
 * Servicio encargado de gestionar el historial médico de las mascotas.
 */
@Injectable()
export class HistorialMedicoService {

  constructor(
    private inventarioService: InventarioService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Prescribe un medicamento descontando stock del inventario.
   */
  async prescribirMedicamento(
    productoId: string,
    cantidad: number,
  ) {
    await this.inventarioService.descontarStock(productoId, cantidad);

    return {
      mensaje: 'Medicamento prescrito correctamente',
    };
  }

  /**
   * Registra el resultado de una consulta en el historial médico de la mascota.
   * Solo puede ser ejecutado por el veterinario autenticado.
   * El peso de la mascota se actualiza automáticamente.
   */
  async crearRegistro(
    mascotaId: string,
    dto: CrearHistorialMedicoDto,
    usuario: JwtPayload,
  ) {
    const mascota = await this.prisma.mascota.findUnique({
      where: { id: mascotaId },
    });

    if (!mascota) {
      throw new NotFoundException({
        codigo: 'MASCOTA_NO_ENCONTRADA',
        mensaje: 'La mascota indicada no existe.',
      });
    }

    if (dto.medicamentos?.length) {
      for (const med of dto.medicamentos) {
        const producto = await this.inventarioService.obtenerPorId(med.productoId);

        if (producto.stock < med.cantidad) {
          throw new BadRequestException({
            codigo: 'STOCK_INSUFICIENTE',
            mensaje: `Stock insuficiente para el producto ${producto.nombre}.`,
          });
        }
      }
    }

    const registro = await this.prisma.$transaction(async (tx) => {
      const nuevoRegistro = await tx.historialMedico.create({
        data: {
          motivoConsulta: dto.motivoConsulta,
          diagnostico: dto.diagnostico,
          tratamiento: dto.tratamiento,
          pesoMascota: dto.pesoMascota,
          fechaProximaVisita: dto.fechaProximaVisita
            ? new Date(dto.fechaProximaVisita)
            : null,
          estado: 'ABIERTO',
          mascotaId,
          veterinarioId: usuario.sub,
          medicamentos: dto.medicamentos?.length
            ? {
                create: dto.medicamentos.map((m) => ({
                  productoId: m.productoId,
                  cantidad: m.cantidad,
                })),
              }
            : undefined,
        },
        include: this.incluirRelaciones(),
      });

      await tx.mascota.update({
        where: { id: mascotaId },
        data: { peso: dto.pesoMascota },
      });

      return nuevoRegistro;
    });

    for (const med of dto.medicamentos ?? []) {
      await this.inventarioService.descontarStock(med.productoId, med.cantidad);
    }

    await this.notificarAuditoria(usuario, registro.id, mascotaId, 'CREACION_HISTORIAL_MEDICO');

    return this.formatearRegistro(registro);
  }

  /**
   * Lista el historial médico completo de una mascota ordenado cronológicamente.
   * Accesible por veterinario, recepcionista, admin y el cliente dueño.
   */
  async listarHistorial(
    mascotaId: string,
    filtros: FiltroHistorialMedicoDto,
    usuario: JwtPayload,
  ) {
    const page = filtros.page ?? 0;
    const size = filtros.size ?? 20;

    const mascota = await this.prisma.mascota.findUnique({
      where: { id: mascotaId },
    });

    if (!mascota) {
      throw new NotFoundException({
        codigo: 'MASCOTA_NO_ENCONTRADA',
        mensaje: 'La mascota indicada no existe.',
      });
    }

    if (usuario.rol === 'CLIENTE' && mascota.clienteId !== usuario.sub) {
      throw new ForbiddenException({
        codigo: 'MASCOTA_NO_PERTENECE_AL_CLIENTE',
        mensaje: 'No tienes permiso para ver el historial de esta mascota.',
      });
    }

    const [registros, totalElements] = await Promise.all([
      this.prisma.historialMedico.findMany({
        where: { mascotaId },
        include: this.incluirRelaciones(),
        orderBy: { creadoEn: 'desc' },
        skip: page * size,
        take: size,
      }),
      this.prisma.historialMedico.count({
        where: { mascotaId },
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
      content: registros.map((r) => this.formatearRegistro(r)),
    };
  }

  /**
   * Notifica al servicio de auditoría bh-audit de forma silenciosa.
   * Si falla, no interrumpe el flujo principal.
   */
  private async notificarAuditoria(
    usuario: JwtPayload,
    entidadId: string,
    mascotaId: string,
    tipoAccion: string,
  ) {
    const bhAuditUrl = this.configService.get<string>('BH_AUDIT_URL');
    const internalKey = this.configService.get<string>('BH_AUDIT_INTERNAL_KEY');

    if (!bhAuditUrl || !internalKey) return;

    try {
      await fetch(`${bhAuditUrl}/audit/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': internalKey,
        },
        body: JSON.stringify({
          usuarioId: usuario.sub,
          nombreUsuario: usuario.correo,
          rol: usuario.rol,
          tipoAccion,
          descripcion: `Historial médico ${tipoAccion === 'CREACION_HISTORIAL_MEDICO' ? 'creado' : 'editado'} para mascota ${mascotaId}`,
          fechaHora: new Date().toISOString(),
          metadata: { entidadId, mascotaId },
        }),
      });
    } catch {
      // Fallo silencioso: bh-audit no debe interrumpir la operación principal
    }
  }

  private incluirRelaciones() {
    return {
      veterinario: true,
      mascota: true,
      medicamentos: {
        include: {
          producto: true,
        },
      },
    };
  }

  private formatearRegistro(registro: any) {
    return {
      id: registro.id,
      mascota: {
        id: registro.mascota.id,
        nombre: registro.mascota.nombre,
        especie: registro.mascota.especie,
      },
      veterinario: {
        id: registro.veterinario.id,
        nombreCompleto: registro.veterinario.nombreCompleto,
        correo: registro.veterinario.correo,
      },
      motivoConsulta: registro.motivoConsulta,
      diagnostico: registro.diagnostico,
      tratamiento: registro.tratamiento,
      medicamentos: registro.medicamentos.map((m: any) => ({
        id: m.id,
        producto: {
          id: m.producto.id,
          nombre: m.producto.nombre,
          tipo: m.producto.tipo,
        },
        cantidad: m.cantidad,
      })),
      pesoMascota: Number(registro.pesoMascota),
      fechaProximaVisita: registro.fechaProximaVisita
        ? registro.fechaProximaVisita.toISOString().slice(0, 10)
        : null,
      estado: registro.estado,
      creadoEn: registro.creadoEn,
    };
  }
}
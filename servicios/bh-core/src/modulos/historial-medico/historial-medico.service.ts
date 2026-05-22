import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EstadoCita, Prisma } from '@prisma/client';
 
import { PrismaService } from '../../basedatos/prisma.service';
import { JwtPayload } from '../autenticacion/interfaces/jwt-payload.interface';
import { CrearHistorialMedicoDto } from './dto/crear-historial-medico.dto';
 
/**
 * Servicio encargado de gestionar el historial médico de las mascotas.
 */
@Injectable()
export class HistorialMedicoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}
 
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
 
    const cita = await this.prisma.cita.findUnique({
      where: { id: dto.citaId },
    });
 
    if (!cita) {
      throw new NotFoundException({
        codigo: 'CITA_NO_ENCONTRADA',
        mensaje: 'La cita indicada no existe.',
      });
    }
 
    if (cita.mascotaId !== mascotaId) {
      throw new ForbiddenException({
        codigo: 'CITA_NO_PERTENECE_A_MASCOTA',
        mensaje: 'La cita indicada no corresponde a esta mascota.',
      });
    }
 
    if (cita.veterinarioId !== usuario.sub) {
      throw new ForbiddenException({
        codigo: 'CITA_NO_ASIGNADA',
        mensaje: 'Solo el veterinario asignado a la cita puede registrar el historial.',
      });
    }
 
    if (cita.estado !== EstadoCita.FINALIZADA) {
      throw new ForbiddenException({
        codigo: 'CITA_NO_FINALIZADA',
        mensaje: 'La cita debe estar finalizada para registrar el historial médico.',
      });
    }
 
    const citaYaRegistrada = await this.prisma.historialMedico.findUnique({
      where: { citaId: dto.citaId },
    });
 
    if (citaYaRegistrada) {
      throw new ForbiddenException({
        codigo: 'HISTORIAL_YA_REGISTRADO',
        mensaje: 'Ya existe un registro médico para esta cita.',
      });
    }
 
    const ahora = new Date();
    const editableHasta = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
 
    const registro = await this.prisma.$transaction(async (tx) => {
      const nuevoRegistro = await tx.historialMedico.create({
        data: {
          motivoVisita: dto.motivoVisita,
          diagnostico: dto.diagnostico,
          tratamiento: dto.tratamiento,
          peso: dto.peso,
          fechaProximaVisita: dto.fechaProximaVisita
            ? new Date(`${dto.fechaProximaVisita}T00:00:00.000Z`)
            : null,
          editableHasta,
          mascotaId,
          citaId: dto.citaId,
          veterinarioId: usuario.sub,
          medicamentos: dto.medicamentosPrescritos?.length
            ? {
                create: dto.medicamentosPrescritos.map((m) => ({
                  productoId: m.productoId,
                  dosis: m.dosis,
                  duracion: m.duracion,
                })),
              }
            : undefined,
        },
        include: this.incluirRelaciones(),
      });
 
      await tx.mascota.update({
        where: { id: mascotaId },
        data: { peso: dto.peso },
      });
 
      return nuevoRegistro;
    });
 
    await this.notificarAuditoria(usuario, registro.id, mascotaId, 'CREACION_HISTORIAL_MEDICO');
 
    return this.formatearRegistro(registro);
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
          descripcion: `Registro médico ${tipoAccion === 'CREACION_HISTORIAL_MEDICO' ? 'creado' : 'editado'} para mascota ${mascotaId}`,
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
      medicamentos: true,
    } satisfies Prisma.HistorialMedicoInclude;
  }
 
  private formatearRegistro(
    registro: Prisma.HistorialMedicoGetPayload<{
      include: ReturnType<HistorialMedicoService['incluirRelaciones']>;
    }>,
  ) {
    return {
      id: registro.id,
      mascotaId: registro.mascotaId,
      citaId: registro.citaId,
      veterinario: {
        id: registro.veterinario.id,
        nombreCompleto: registro.veterinario.nombreCompleto,
        correo: registro.veterinario.correo,
      },
      motivoVisita: registro.motivoVisita,
      diagnostico: registro.diagnostico,
      tratamiento: registro.tratamiento,
      medicamentosPrescritos: registro.medicamentos.map((m) => ({
        id: m.id,
        productoId: m.productoId,
        dosis: m.dosis,
        duracion: m.duracion,
      })),
      peso: registro.peso.toNumber(),
      fechaProximaVisita: registro.fechaProximaVisita
        ? registro.fechaProximaVisita.toISOString().slice(0, 10)
        : null,
      editableHasta: registro.editableHasta,
      creadoEn: registro.creadoEn,
    };
  }
}
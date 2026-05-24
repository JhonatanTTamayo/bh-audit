import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../basedatos/prisma.service';
import { JwtPayload } from '../autenticacion/interfaces/jwt-payload.interface';
import { CrearVacunaDto } from './dto/crear-vacuna.dto';

/**
 * Servicio encargado de gestionar las vacunas de las mascotas.
 */
@Injectable()
export class VacunasService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registra una vacuna aplicada dentro del historial médico de la mascota.
   * Solo puede ser ejecutado por el veterinario autenticado.
   */
  async registrarVacuna(
    mascotaId: string,
    dto: CrearVacunaDto,
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

    const vacuna = await this.prisma.vacuna.create({
      data: {
        nombre: dto.nombre,
        fechaAplicacion: new Date(dto.fechaAplicacion),
        fechaProximaDosis: new Date(dto.fechaProximaDosis),
        observaciones: dto.observaciones ?? null,
        productoId: dto.productoId ?? null,
        mascotaId,
        veterinarioId: usuario.sub,
      },
      include: {
        veterinario: true,
      },
    });

    await this.notificarAuditoria(usuario, vacuna.id, mascotaId);

    return this.formatearVacuna(vacuna);
  }

  private async notificarAuditoria(
    usuario: JwtPayload,
    entidadId: string,
    mascotaId: string,
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
          tipoAccion: 'REGISTRO_VACUNA',
          descripcion: `Vacuna registrada para mascota ${mascotaId}`,
          fechaHora: new Date().toISOString(),
          metadata: { entidadId, mascotaId },
        }),
      });
    } catch {
      // Fallo silencioso
    }
  }

  private formatearVacuna(vacuna: any) {
    return {
      id: vacuna.id,
      nombre: vacuna.nombre,
      fechaAplicacion: vacuna.fechaAplicacion.toISOString().slice(0, 10),
      fechaProximaDosis: vacuna.fechaProximaDosis.toISOString().slice(0, 10),
      observaciones: vacuna.observaciones,
      productoId: vacuna.productoId,
      mascotaId: vacuna.mascotaId,
      veterinario: {
        id: vacuna.veterinario.id,
        nombreCompleto: vacuna.veterinario.nombreCompleto,
        correo: vacuna.veterinario.correo,
      },
      creadoEn: vacuna.creadoEn,
    };
  }
}
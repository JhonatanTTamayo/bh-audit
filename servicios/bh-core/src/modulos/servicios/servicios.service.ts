import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../basedatos/prisma.service';
import { JwtPayload } from '../autenticacion/interfaces/jwt-payload.interface';

/**
 * Servicio encargado de gestionar el catalogo de servicios de la clinica.
 */
@Injectable()
export class ServiciosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista los servicios del catalogo.
   *
   * - ADMIN: ve todos los servicios, incluyendo los desactivados.
   * - Cualquier otro rol autenticado: solo ve los servicios activos.
   */
  async listarServicios(usuario: JwtPayload) {
    const soloActivos = usuario.rol !== 'ADMIN';

    const servicios = await this.prisma.servicio.findMany({
      where: soloActivos ? { activo: true } : undefined,
      orderBy: { nombre: 'asc' },
    });

    return servicios.map((servicio) => this.formatearServicio(servicio));
  }
o
  private formatearServicio(servicio: {
    id: string;
    nombre: string;
    descripcion: string | null;
    precio: { toNumber: () => number };
    activo: boolean;
    creadoEn: Date;
    actualizadoEn: Date;
  }) {
    return {
      id: servicio.id,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: servicio.precio.toNumber(),
      activo: servicio.activo,
      creadoEn: servicio.creadoEn,
      actualizadoEn: servicio.actualizadoEn,
    };
  }
}

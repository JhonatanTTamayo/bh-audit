import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../basedatos/prisma.service';

/**
 * Servicio encargado de exponer el catálogo de servicios de la clínica.
 */
@Injectable()
export class CatalogoService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Retorna los servicios activos disponibles para cualquier usuario autenticado.
     */
    async obtenerServiciosActivos() {
        const servicios = await this.prisma.servicio.findMany({
            where: { activo: true },
            orderBy: { nombre: 'asc' },
        });

        return servicios.map((s) => ({
            id: s.id,
            nombre: s.nombre,
            descripcion: s.descripcion,
            precio: s.precio.toNumber(),
        }));
    }

    /**
     * Retorna todos los servicios (activos e inactivos).
     * Exclusivo para administradores.
     */
    async obtenerTodosLosServicios() {
        const servicios = await this.prisma.servicio.findMany({
            orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
        });

        return servicios.map((s) => ({
            id: s.id,
            nombre: s.nombre,
            descripcion: s.descripcion,
            precio: s.precio.toNumber(),
            activo: s.activo,
        }));
    }
}
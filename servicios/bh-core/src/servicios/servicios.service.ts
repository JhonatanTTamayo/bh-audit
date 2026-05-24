import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { PrismaService } from '../basedatos/prisma.service';
import { CrearServicioDto } from './dto/crear-servicio.dto';
import { EditarServicioDto } from './dto/editar-servicio.dto';

/**
 * Servicio encargado de gestionar los servicios de la clínica.
 * Exclusivo para administradores.
 */
@Injectable()
export class ServiciosService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Crea un nuevo servicio.
     */
    async crear(dto: CrearServicioDto) {
        const existe = await this.prisma.servicio.findFirst({
            where: { nombre: dto.nombre },
        });

        if (existe) {
            throw new ConflictException('Ya existe un servicio con ese nombre.');
        }

        const servicio = await this.prisma.servicio.create({
            data: {
                nombre: dto.nombre,
                descripcion: dto.descripcion,
                precio: dto.precio,
            },
        });

        return this.formatear(servicio);
    }

    /**
     * Edita un servicio existente.
     */
    async editar(id: string, dto: EditarServicioDto) {
        const servicio = await this.prisma.servicio.findUnique({ where: { id } });

        if (!servicio) {
            throw new NotFoundException('El servicio no existe.');
        }

        const actualizado = await this.prisma.servicio.update({
            where: { id },
            data: {
                ...(dto.nombre && { nombre: dto.nombre }),
                ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
                ...(dto.precio !== undefined && { precio: dto.precio }),
            },
        });

        return this.formatear(actualizado);
    }

    /**
     * Desactiva un servicio (no lo elimina).
     */
    async desactivar(id: string) {
        const servicio = await this.prisma.servicio.findUnique({ where: { id } });

        if (!servicio) {
            throw new NotFoundException('El servicio no existe.');
        }

        if (!servicio.activo) {
            throw new ConflictException('El servicio ya está desactivado.');
        }

        const actualizado = await this.prisma.servicio.update({
            where: { id },
            data: { activo: false },
        });

        return this.formatear(actualizado);
    }

    /**
     * Formatea un servicio para la respuesta.
     */
    private formatear(servicio: {
        id: string;
        nombre: string;
        descripcion: string | null;
        precio: { toNumber: () => number };
        activo: boolean;
    }) {
        return {
            id: servicio.id,
            nombre: servicio.nombre,
            descripcion: servicio.descripcion,
            precio: servicio.precio.toNumber(),
            activo: servicio.activo,
        };
    }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../basedatos/prisma.service';

@Injectable()
export class CitasService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Obtiene todas las citas dentro de un rango de fechas con sus relaciones
     * (cliente, mascota, veterinario) para generar el reporte PDF.
     *
     * SCRUM-XX — Reporte de citas por período
     */
    async obtenerCitasParaReporte(fechaInicio: Date, fechaFin: Date) {
        if (fechaInicio > fechaFin) {
            throw new BadRequestException(
                'La fecha de inicio no puede ser mayor a la fecha de fin.',
            );
        }

        // Ajustamos fechaFin para que incluya todo el día (23:59:59)
        const finDelDia = new Date(fechaFin);
        finDelDia.setHours(23, 59, 59, 999);

        return this.prisma.cita.findMany({
            where: {
                fechaHora: {
                    gte: fechaInicio,
                    lte: finDelDia,
                },
            },
            include: {
                cliente: {
                    select: {
                        nombre: true,
                        apellido: true,
                        documento: true,
                    },
                },
                mascota: {
                    select: {
                        nombre: true,
                        especie: true,
                        raza: true,
                    },
                },
                veterinario: {
                    select: {
                        nombreCompleto: true,
                    },
                },
            },
            orderBy: { fechaHora: 'asc' },
        });
    }
}
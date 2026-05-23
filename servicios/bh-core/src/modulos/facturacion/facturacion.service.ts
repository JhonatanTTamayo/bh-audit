import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../basedatos/prisma.service';
import { CrearFacturaDto } from './dto/crear-factura.dto';
import { AnularFacturaDto } from './dto/anular-factura.dto';
import { EstadoFactura } from './interfaces/factura.interface';

@Injectable()
export class FacturacionService {
    constructor(private readonly prisma: PrismaService) {}

    // =================================================================
    // SCRUM 50: Generación de factura
    // =================================================================
    async crearFactura(dto: CrearFacturaDto) {
        // Accedemos directamente a la propiedad prisma.
        // Si tienes problemas de tipos, asegúrate de que PrismaService extienda PrismaClient
        const atencion = await this.prisma.atencion.findUnique({
            where: { id: dto.atencionId },
            include: {
                servicios: true,
                medicamentos: true
            }
        });

        if (!atencion) {
            throw new NotFoundException(`La atención con ID ${dto.atencionId} no existe.`);
        }

        const facturaExistente = await this.prisma.factura.findUnique({
            where: { atencionId: dto.atencionId }
        });

        if (facturaExistente) {
            throw new BadRequestException('Ya existe una factura generada para esta atención.');
        }

        let totalServicios = 0;
        if (atencion.servicios) {
            totalServicios = atencion.servicios.reduce((sum, s: any) => sum + (s.precio || 0), 0);
        }

        let totalMedicamentos = 0;
        if (atencion.medicamentos) {
            totalMedicamentos = atencion.medicamentos.reduce((sum, m: any) => sum + ((m.precio || 0) * (m.cantidad || 1)), 0);
        }

        const totalFinal = (totalServicios + totalMedicamentos) - (dto.descuento || 0);

        if (totalFinal < 0) {
            throw new BadRequestException('El descuento no puede ser mayor al total.');
        }

        return await this.prisma.factura.create({
            data: {
                atencionId: dto.atencionId,
                totalFacturado: totalFinal,
                descuento: dto.descuento || 0,
                estado: EstadoFactura.EMITIDA
            }
        });
    }

    // =================================================================
    // SCRUM 52: Anulación de factura
    // =================================================================
    async anularFactura(id: string, dto: AnularFacturaDto) {
        const factura = await this.prisma.factura.findUnique({ where: { id } });

        if (!factura) {
            throw new NotFoundException(`La factura con ID ${id} no fue encontrada.`);
        }

        if (factura.estado === EstadoFactura.ANULADA) {
            throw new BadRequestException('Esta factura ya está anulada.');
        }

        return await this.prisma.factura.update({
            where: { id },
            data: {
                estado: EstadoFactura.ANULADA,
                motivoAnulacion: dto.motivoAnulacion
            }
        });
    }

    // =================================================================
    // SCRUM 54: Reporte
    // =================================================================
    async obtenerDatosReportePeriodo(fechaInicio: Date, fechaFin: Date) {
        if (fechaInicio > fechaFin) {
            throw new BadRequestException('Fechas inválidas.');
        }

        return await this.prisma.factura.findMany({
            where: {
                creadoEn: { gte: fechaInicio, lte: fechaFin }
            },
            orderBy: { creadoEn: 'asc' }
        });
    }
}
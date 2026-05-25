import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../basedatos/prisma.service';
import { AuditService, TipoAccionAudit } from '../audit/audit.service';
import { CrearFacturaDto } from './dto/crear-factura.dto';
import { AnularFacturaDto } from './dto/anular-factura.dto';
import { EstadoFactura } from './interfaces/factura.interface';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class FacturacionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditService: AuditService,
    ) {}

    /**
     * Crea una factura para una atencion, calcula totales y registra auditoria.
     *
     * @param dto Datos para crear factura.
     * @returns Factura creada.
     */
    async crearFactura(dto: CrearFacturaDto) {
        const atencion = await this.prisma.atencion.findUnique({
            where: { id: dto.atencionId },
            include: { servicios: true, medicamentos: true },
        });

        if (!atencion) {
            throw new NotFoundException(`La atención con ID ${dto.atencionId} no existe.`);
        }

        const facturaExistente = await this.prisma.factura.findUnique({
            where: { atencionId: dto.atencionId },
        });

        if (facturaExistente) {
            throw new BadRequestException('Ya existe una factura para esta atención.');
        }

        const totalServicios = atencion.servicios.reduce(
            (sum, s: any) => sum + Number(s.precio ?? 0), 0
        );

        const totalMedicamentos = atencion.medicamentos.reduce(
            (sum, m: any) => sum + (Number(m.precio ?? 0) * Number(m.cantidad ?? 1)), 0
        );

        const totalFinal = totalServicios + totalMedicamentos - Number(dto.descuento ?? 0);

        if (totalFinal < 0) {
            throw new BadRequestException('El descuento no puede ser mayor al total.');
        }

const factura = await this.prisma.factura.create({
    data: {
        atencionId:     dto.atencionId,
        totalFacturado: totalFinal,
        descuento:      dto.descuento ?? 0,
        estado:         EstadoFactura.EMITIDA,
    } as any,
});

        await this.auditService.registrarEvento({
            tipoAccion:    TipoAccionAudit.CREACION_FACTURA,
            nombreUsuario: 'sistema',
            rolUsuario:    'RECEPCIONISTA',
            detalle:       `Factura creada para atención ${dto.atencionId}`,
            entidadId:     factura.id,
            entidadTipo:   'Factura',
        });

        return factura;
    }

    /**
     * Obtiene una factura por ID o lanza error si no existe.
     *
     * @param id Identificador de la factura.
     * @returns Factura encontrada.
     */
    async obtenerFacturaPorId(id: string) {
        const factura = await this.prisma.factura.findUnique({ where: { id } });

        if (!factura) {
            throw new NotFoundException(`Factura con ID ${id} no encontrada.`);
        }

        return factura;
    }

/**
 * Lista todas las facturas ordenadas desde la mas reciente.
 *
 * @returns Lista de facturas.
 */
async listarFacturas() {
    return this.prisma.factura.findMany({
        orderBy: { creadoEn: 'desc' },
    });
}
    /**
     * Anula una factura existente y registra el motivo en auditoria.
     *
     * @param id Identificador de la factura.
     * @param dto Datos con el motivo de anulacion.
     * @returns Factura anulada.
     */
    async anularFactura(id: string, dto: AnularFacturaDto) {
        const factura = await this.prisma.factura.findUnique({ where: { id } });

        if (!factura) {
            throw new NotFoundException(`Factura con ID ${id} no encontrada.`);
        }

        if (factura.estado === EstadoFactura.ANULADA) {
            throw new BadRequestException('Esta factura ya está anulada.');
        }

        const facturaAnulada = await this.prisma.factura.update({
            where: { id },
            data: {
                estado:          EstadoFactura.ANULADA,
                motivoAnulacion: dto.motivoAnulacion,
            },
        });

        await this.auditService.registrarEvento({
            tipoAccion:    TipoAccionAudit.ANULACION_FACTURA,
            nombreUsuario: 'sistema',
            rolUsuario:    'RECEPCIONISTA',
            detalle:       `Factura anulada. Motivo: ${dto.motivoAnulacion}`,
            entidadId:     id,
            entidadTipo:   'Factura',
        });

        return facturaAnulada;
    }

    /**
     * Obtiene facturas dentro de un periodo para generar reportes.
     *
     * @param fechaInicio Fecha inicial del periodo.
     * @param fechaFin Fecha final del periodo.
     * @returns Facturas encontradas en el rango.
     */
    async obtenerDatosReportePeriodo(fechaInicio: Date, fechaFin: Date) {
        if (fechaInicio > fechaFin) {
            throw new BadRequestException('La fecha de inicio no puede ser mayor a la fecha fin.');
        }

        return this.prisma.factura.findMany({
            where: {
                creadoEn: { gte: fechaInicio, lte: fechaFin },
            },
            orderBy: { creadoEn: 'asc' },
        });
    }
}

import { Controller, Post, Body, Patch, Param, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FacturacionService } from './facturacion.service';
import { CrearFacturaDto } from './dto/crear-factura.dto';
import { AnularFacturaDto } from './dto/anular-factura.dto';
import { Response } from 'express';
import { PdfFacturacionHelper } from './pdf-facturacion.helper';

@ApiTags('Facturacion')
@Controller('facturacion')
export class FacturacionController {

    constructor(private readonly facturacionService: FacturacionService) {}

    @Post()
    @ApiOperation({ summary: 'Crear una nueva factura' })
    async crear(@Body() crearFacturaDto: CrearFacturaDto) {
        return await this.facturacionService.crearFactura(crearFacturaDto);
    }

    @Patch(':id/anular')
    @ApiOperation({ summary: 'Anular una factura existente' })
    async anular(@Param('id') id: string, @Body() anularFacturaDto: AnularFacturaDto) {
        return await this.facturacionService.anularFactura(id, anularFacturaDto);
    }

    @Get(':id/pdf')
    @ApiOperation({ summary: 'Descargar factura en PDF' })
    async descargarPdf(@Param('id') id: string, @Res() res: Response) {
        const facturaSimulada = { id, atencionId: 'atencion-123', totalFacturado: 150000, descuento: 1000, estado: 'EMITIDA' };

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=factura-${id}.pdf`);

        PdfFacturacionHelper.generarFacturaPdf(res, facturaSimulada);
    }

    @Get('reporte/pdf')
    @ApiOperation({ summary: 'Descargar reporte de facturas por periodo' })
    async descargarReportePeriodo(
        @Query('inicio') inicio: string,
        @Query('fin') fin: string,
        @Res() res: Response
    ) {
        const fechaInicio = new Date(inicio);
        const fechaFin = new Date(fin);

        const facturas = await this.facturacionService.obtenerDatosReportePeriodo(fechaInicio, fechaFin);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte-${inicio}-a-${fin}.pdf`);

        PdfFacturacionHelper.generarReportePeriodoPdf(res, facturas, inicio, fin);
    }
}
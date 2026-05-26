import { Controller, Post, Get, Patch, Body, Param, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { FacturacionService } from './facturacion.service';
import { CrearFacturaDto } from './dto/crear-factura.dto';
import { AnularFacturaDto } from './dto/anular-factura.dto';
import { PdfFacturaHelper, PdfReporteHelper } from './helpers/pdf-facturacion.helper';

/**
 * Controlador encargado de exponer endpoints de facturacion.
 *
 * @class FacturacionController
 */
@ApiTags('Facturacion')
@Controller('facturacion')
export class FacturacionController {
    constructor(private readonly facturacionService: FacturacionService) {}

    /**
     * Crea una factura para una atencion finalizada.
     *
     * @param dto Datos de la atencion y descuento opcional.
     * @returns Factura creada.
     */
    // SCRUM-50
    @Post()
    @ApiOperation({ summary: 'Crear una nueva factura al finalizar atención' })
    async crear(@Body() dto: CrearFacturaDto) {
        return this.facturacionService.crearFactura(dto);
    }

    // SCRUM-54 — va ANTES de :id/pdf para que NestJS no confunda 'reporte' con un id
    /**
     * Descarga un reporte PDF de facturacion por periodo.
     *
     * @param inicio Fecha inicial del reporte.
     * @param fin Fecha final del reporte.
     * @param res Respuesta HTTP usada para enviar el PDF.
     * @returns Promesa que finaliza cuando el PDF se escribe en la respuesta.
     */
    @Get('reporte/pdf')
    @ApiOperation({ summary: 'Descargar reporte de facturación por periodo en PDF' })
    async descargarReportePeriodo(
        @Query('inicio') inicio: string,
        @Query('fin') fin: string,
        @Res() res: Response,
    ) {
        const fechaInicio = new Date(inicio);
        const fechaFin = new Date(fin);

        const facturas = await this.facturacionService.obtenerDatosReportePeriodo(fechaInicio, fechaFin);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte-${inicio}-a-${fin}.pdf`);

        PdfReporteHelper.generarReportePeriodoPdf(res, facturas, inicio, fin);
    }

    /**
     * Descarga el PDF de una factura por ID.
     *
     * @param id Identificador de la factura.
     * @param res Respuesta HTTP usada para enviar el PDF.
     * @returns Promesa que finaliza cuando el PDF se escribe en la respuesta.
     */
    // SCRUM-51
    @Get(':id/pdf')
    @ApiOperation({ summary: 'Descargar factura en PDF con encabezado oficial B&H' })
    async descargarPdf(@Param('id') id: string, @Res() res: Response) {
        const factura = await this.facturacionService.obtenerFacturaPorId(id);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=factura-${id}.pdf`);

        PdfFacturaHelper.generarFacturaPdf(res, factura);
    }

    /**
     * Anula una factura registrando el motivo de anulacion.
     *
     * @param id Identificador de la factura.
     * @param dto Datos con el motivo de anulacion.
     * @returns Factura anulada.
     */
    // SCRUM-52
    @Patch(':id/anular')
    @ApiOperation({ summary: 'Anular una factura registrando el motivo' })
    async anular(@Param('id') id: string, @Body() dto: AnularFacturaDto) {
        return this.facturacionService.anularFactura(id, dto);
    }
/**
 * Lista todas las facturas registradas.
 *
 * @returns Arreglo de facturas ordenadas por fecha de creacion.
 */
// GET /facturas
@Get()
@ApiOperation({ summary: 'Listar todas las facturas' })
async listar() {
    return this.facturacionService.listarFacturas();
}

/**
 * Obtiene una factura por ID.
 *
 * @param id Identificador de la factura.
 * @returns Factura encontrada.
 */
// GET /facturas/:id
@Get(':id')
@ApiOperation({ summary: 'Obtener factura por ID' })
async obtenerPorId(@Param('id') id: string) {
    return this.facturacionService.obtenerFacturaPorId(id);
}
}

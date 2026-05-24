import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { CitasService } from './citas.service';
import { PdfReporteCitasHelper } from './helpers/pdf-reporte-citas.helper';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Roles } from '../autenticacion/decoradores/roles.decorador';

@ApiTags('Citas')
@Controller('citas')
export class CitasController {
    constructor(private readonly citasService: CitasService) {}

    /**
     * GET /citas/reporte/pdf?inicio=YYYY-MM-DD&fin=YYYY-MM-DD
     *
     * Solo el ADMINISTRADOR puede acceder.
     * Devuelve un archivo PDF con todas las citas del período indicado,
     * incluyendo cliente, mascota, veterinario y estado final.
     *
     * SCRUM-XX — Reporte de citas por período
     */
    @Get('reporte/pdf')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMINISTRADOR')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Generar reporte PDF de citas por período (solo ADMINISTRADOR)',
        description:
            'Devuelve un PDF con listado de citas en el rango de fechas indicado. ' +
            'Incluye: cliente, mascota, veterinario asignado y estado final de la cita.',
    })
    @ApiQuery({
        name: 'inicio',
        required: true,
        description: 'Fecha de inicio del período (YYYY-MM-DD)',
        example: '2026-01-01',
    })
    @ApiQuery({
        name: 'fin',
        required: true,
        description: 'Fecha de fin del período (YYYY-MM-DD)',
        example: '2026-12-31',
    })
    async descargarReporteCitasPdf(
        @Query('inicio') inicio: string,
        @Query('fin') fin: string,
        @Res() res: Response,
    ) {
        const fechaInicio = new Date(inicio);
        const fechaFin = new Date(fin);

        const citas = await this.citasService.obtenerCitasParaReporte(
            fechaInicio,
            fechaFin,
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=reporte-citas-${inicio}-a-${fin}.pdf`,
        );

        PdfReporteCitasHelper.generarReporteCitasPdf(res, citas, inicio, fin);
    }
}
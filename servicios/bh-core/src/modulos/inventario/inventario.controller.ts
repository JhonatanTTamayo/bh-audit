import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { Roles } from '../autenticacion/decoradores/roles.decorador';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { InventarioService } from './inventario.service';
import { PdfInventarioHelper } from './pdf-inventario.helper';

/**
 * Controlador encargado de exponer endpoints del inventario.
 */
@Controller('inventario')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  /**
   * Genera y descarga el reporte de inventario actual en PDF.
   * Incluye alertas visuales de stock bajo y productos proximos a vencer.
   *
   * Ruta:
   * GET /api/inventario/reporte/pdf
   */
  @Get('reporte/pdf')
  async descargarReportePdf(@Res() res: Response) {
    const productos = await this.inventarioService.obtenerProductosParaReporte();
    const fechaGeneracion = new Date();
    const nombreArchivo = `inventario-${fechaGeneracion.toISOString().slice(0, 10)}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);

    PdfInventarioHelper.generarReporteInventarioPdf(res, productos, fechaGeneracion);
  }
}

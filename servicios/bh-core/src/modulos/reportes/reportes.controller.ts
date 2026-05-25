import {
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';

import { Response } from 'express';

import {
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { ReportesService } from './reportes.service';

import { FiltroTrazabilidadDto } from './dto/filtro-trazabilidad.dto';

import { PdfTrazabilidadHelper } from './helpers/pdf-trazabilidad.helper';

@ApiTags('Reportes')

@Controller('reportes')
export class ReportesController {

  constructor(
    private readonly reportesService: ReportesService,
  ) {}

  @Get('trazabilidad/pdf')

  @ApiOperation({
    summary: 'Generar reporte PDF de trazabilidad',
  })

  @ApiQuery({
    name: 'fechaFin',
    required: true,
  })

  @ApiQuery({
    name: 'fechaInicio',
    required: true,
  })

  @ApiQuery({
    name: 'usuario',
    required: false,
  })

  @ApiQuery({
    name: 'tipoAccion',
    required: false,
  })

  async descargarReporte(
    @Query()
    filtros: FiltroTrazabilidadDto,

    @Res()
    res: Response,
  ) {

    const acciones =
      await this.reportesService.obtenerReporteTrazabilidad(
        filtros,
      );

    res.setHeader(
      'Content-Type',
      'application/pdf',
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=reporte-trazabilidad.pdf',
    );

    PdfTrazabilidadHelper.generarReporteTrazabilidadPdf(
      res,
      acciones,
      filtros.fechaInicio,
      filtros.fechaFin,
    );
  }
}
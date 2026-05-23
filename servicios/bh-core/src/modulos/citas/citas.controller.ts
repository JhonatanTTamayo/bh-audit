import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  ParseUUIDPipe,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { Roles } from '../autenticacion/decoradores/roles.decorador';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { RequestConUsuario } from '../autenticacion/interfaces/request-con-usuario.interface';
import { CitasService } from './citas.service';
import { CrearCitaDto } from './dto/crear-cita.dto';
import { FiltroCitasDto } from './dto/filtro-citas.dto';
import { MotivoRequestDto } from './dto/motivo-request.dto';
import { DisponibilidadQueryDto } from './dto/disponibilidad.dto';
import { ReporteCitasDto } from './dto/reporte-citas.dto';
import { PdfCitasHelper } from './pdf-citas.helper';

/**
 * Controlador encargado de exponer endpoints relacionados con citas.
 */
@Controller('citas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  /**
   * Lista citas aplicando filtros, paginacion y reglas de acceso por rol.
   *
   * Ruta:
   * GET /api/citas
   */
  @Get()
  @Roles('CLIENTE', 'VETERINARIO', 'RECEPCIONISTA', 'ADMIN')
  listarCitas(
      @Query() filtros: FiltroCitasDto,
      @Req() request: RequestConUsuario,
  ) {
    return this.citasService.listarCitas(filtros, request.usuario);
  }

  /**
   * Genera y descarga el reporte de citas por periodo en PDF.
   *
   * Ruta:
   * GET /api/citas/reporte/pdf
   */
  @Get('reporte/pdf')
  @Roles('ADMIN')
  async descargarReportePdf(
      @Query() filtros: ReporteCitasDto,
      @Res() res: Response,
  ) {
    const citas = await this.citasService.obtenerCitasParaReporte(
        filtros.fechaDesde,
        filtros.fechaHasta,
    );

    const fechaGeneracion = new Date();
    const nombreArchivo = `reporte-citas-${filtros.fechaDesde}-a-${filtros.fechaHasta}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);

    PdfCitasHelper.generarReporteCitasPdf(
        res,
        citas,
        filtros.fechaDesde,
        filtros.fechaHasta,
        fechaGeneracion,
    );
  }

  /**
   * Obtiene una cita por su ID.
   *
   * Ruta:
   * GET /api/citas/:citaId
   */
  @Get(':citaId')
  @Roles('CLIENTE', 'VETERINARIO', 'RECEPCIONISTA', 'ADMIN')
  obtenerCita(
      @Param('citaId', new ParseUUIDPipe()) citaId: string,
      @Req() request: RequestConUsuario,
  ) {
    return this.citasService.obtenerCita(citaId, request.usuario);
  }

  /**
   * Marca una cita como finalizada.
   *
   * Ruta:
   * PATCH /api/citas/:citaId/finalizar
   */
  @Patch(':citaId/finalizar')
  @Roles('VETERINARIO')
  finalizarCita(
      @Param('citaId', new ParseUUIDPipe()) citaId: string,
      @Req() request: RequestConUsuario,
  ) {
    return this.citasService.finalizarCita(citaId, request.usuario);
  }

  /**
   * Cancela una cita y registra el motivo.
   *
   * Ruta:
   * PATCH /api/citas/:citaId/cancelar
   */
  @Patch(':citaId/cancelar')
  @Roles('RECEPCIONISTA', 'ADMIN')
  cancelarCita(
      @Param('citaId', new ParseUUIDPipe()) citaId: string,
      @Body() motivo: MotivoRequestDto,
      @Req() request: RequestConUsuario,
  ) {
    return this.citasService.cancelarCita(citaId, motivo, request.usuario);
  }

  /**
   * Consulta disponibilidad de un veterinario en una fecha.
   *
   * Ruta:
   * GET /api/citas/disponibilidad
   */
  @Get('disponibilidad')
  @Roles('RECEPCIONISTA', 'CLIENTE')
  disponibilidad(
      @Query() query: DisponibilidadQueryDto,
      @Req() request: RequestConUsuario,
  ) {
    return this.citasService.consultarDisponibilidad(query, request.usuario);
  }

  /**
   * Agenda una cita confirmada con pago obligatorio.
   *
   * Ruta:
   * POST /api/citas
   */
  @Post()
  @Roles('RECEPCIONISTA', 'CLIENTE')
  crearCita(
      @Body() crearCitaDto: CrearCitaDto,
      @Req() request: RequestConUsuario,
  ) {
    return this.citasService.crearCita(crearCitaDto, request.usuario);
  }
}
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../autenticacion/decoradores/roles.decorador';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { RequestConUsuario } from '../autenticacion/interfaces/request-con-usuario.interface';
import { HistorialMedicoService } from './historial-medico.service';
import { PrescribirMedicamentoDto } from './dto/prescribir-medicamento.dto';
import { CrearHistorialMedicoDto } from './dto/crear-historial-medico.dto';
import { ActualizarHistorialMedicoDto } from './dto/actualizar-historial-medico.dto';
import { FiltroHistorialMedicoDto } from './dto/filtro-historial-medico.dto';

/**
 * Controlador encargado de exponer endpoints del historial médico de mascotas.
 */
@Controller('mascotas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HistorialMedicoController {

  constructor(
    private historialMedicoService: HistorialMedicoService,
  ) {}

  /**
   * Prescribe un medicamento descontando stock del inventario.
   *
   * Ruta:
   * POST /api/mascotas/historial-medico/prescribir
   */
  @Post('historial-medico/prescribir')
  @Roles('VETERINARIO')
  prescribir(
    @Body() dto: PrescribirMedicamentoDto,
  ) {
    return this.historialMedicoService.prescribirMedicamento(
      dto.productoId,
      dto.cantidad,
    );
  }

  /**
   * Registra el resultado de una consulta en el historial médico de la mascota.
   *
   * Ruta:
   * POST /api/mascotas/:mascotaId/historial
   */
  @Post(':mascotaId/historial')
  @Roles('VETERINARIO')
  crearRegistro(
    @Param('mascotaId', ParseUUIDPipe) mascotaId: string,
    @Body() crearHistorialMedicoDto: CrearHistorialMedicoDto,
    @Req() request: RequestConUsuario,
  ) {
    return this.historialMedicoService.crearRegistro(
      mascotaId,
      crearHistorialMedicoDto,
      request.usuario,
    );
  }

  /**
   * Lista el historial médico completo de una mascota ordenado cronológicamente.
   *
   * Ruta:
   * GET /api/mascotas/:mascotaId/historial
   */
  @Get(':mascotaId/historial')
  @Roles('VETERINARIO', 'RECEPCIONISTA', 'ADMIN', 'CLIENTE')
  listarHistorial(
    @Param('mascotaId', ParseUUIDPipe) mascotaId: string,
    @Query() filtros: FiltroHistorialMedicoDto,
    @Req() request: RequestConUsuario,
  ) {
    return this.historialMedicoService.listarHistorial(
      mascotaId,
      filtros,
      request.usuario,
    );
  }

  /**
   * Corrige un registro médico únicamente durante las primeras 24 horas.
   *
   * Ruta:
   * PUT /api/mascotas/historial/:registroId
   */
  @Put('historial/:registroId')
  @Roles('VETERINARIO')
  actualizarRegistro(
    @Param('registroId', ParseUUIDPipe) registroId: string,
    @Body() actualizarHistorialMedicoDto: ActualizarHistorialMedicoDto,
    @Req() request: RequestConUsuario,
  ) {
    return this.historialMedicoService.actualizarRegistro(
      registroId,
      actualizarHistorialMedicoDto,
      request.usuario,
    );
  }
}
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
/**
 * @class HistorialMedicoController
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
   *
   * @param dto Datos del producto y cantidad prescrita.
   * @returns Mensaje de prescripcion correcta.
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
   *
   * @param mascotaId Identificador UUID de la mascota.
   * @param crearHistorialMedicoDto Datos clinicos del registro.
   * @param request Peticion autenticada con el veterinario.
   * @returns Registro medico creado.
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
   *
   * @param mascotaId Identificador UUID de la mascota.
   * @param filtros Parametros opcionales de paginacion.
   * @param request Peticion autenticada con el usuario solicitante.
   * @returns Historial medico paginado de la mascota.
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
   *
   * @param registroId Identificador UUID del registro medico.
   * @param actualizarHistorialMedicoDto Datos corregidos del registro.
   * @param request Peticion autenticada con el veterinario.
   * @returns Registro medico actualizado.
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

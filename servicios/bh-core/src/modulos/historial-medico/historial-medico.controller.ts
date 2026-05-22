import {
  Body,
  Controller,
  Post,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../autenticacion/decoradores/roles.decorador';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { RequestConUsuario } from '../autenticacion/interfaces/request-con-usuario.interface';
import { HistorialMedicoService } from './historial-medico.service';
import { CrearHistorialMedicoDto } from './dto/crear-historial-medico.dto';

/**
 * Controlador encargado de exponer endpoints del historial médico de mascotas.
 */
@Controller('mascotas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HistorialMedicoController {
  constructor(private readonly historialMedicoService: HistorialMedicoService) {}

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
}
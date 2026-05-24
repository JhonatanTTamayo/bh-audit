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
import { VacunasService } from './vacunas.service';
import { CrearVacunaDto } from './dto/crear-vacuna.dto';
 
/**
 * Controlador encargado de exponer endpoints de vacunas de mascotas.
 */
@Controller('mascotas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VacunasController {
 
  constructor(private readonly vacunasService: VacunasService) {}
 
  /**
   * Registra una vacuna aplicada dentro del historial médico de la mascota.
   *
   * Ruta:
   * POST /api/mascotas/:mascotaId/vacunas
   */
  @Post(':mascotaId/vacunas')
  @Roles('VETERINARIO')
  registrarVacuna(
    @Param('mascotaId', ParseUUIDPipe) mascotaId: string,
    @Body() crearVacunaDto: CrearVacunaDto,
    @Req() request: RequestConUsuario,
  ) {
    return this.vacunasService.registrarVacuna(
      mascotaId,
      crearVacunaDto,
      request.usuario,
    );
  }
}
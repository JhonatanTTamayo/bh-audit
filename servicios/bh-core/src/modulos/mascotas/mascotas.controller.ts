import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CrearMascotaDto } from './dto/crear-mascota.dto';
import { MascotasService } from './mascotas.service';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Roles } from '../autenticacion/decoradores/roles.decorador';

@Controller('mascotas')
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService,) {}

  /**
  * Endpoint para registrar una mascota asociada a un cliente.
  * 
  * POST: bh-core/v1/clientes/:cliente/mascotas
  */

  @Post('/clientes/:clienteId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECEPCIONISTA')
  crearMascota(
    @Param('clienteId') clienteId: string,
    @Body() dto: CrearMascotaDto,
  ) {
    return this.mascotasService.crearMascota(
      clienteId,
      dto,
    );
  }
}
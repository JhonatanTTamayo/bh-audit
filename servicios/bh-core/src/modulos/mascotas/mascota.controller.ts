import {Body,Controller,Param,Post,UseGuards} from '@nestjs/common';


import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Roles } from '../autenticacion/decoradores/roles.decorador';
import { CrearMascotaDto } from './dto/crear-mascota.dto';
import { MascotasService } from './mascota.service';

/**
 * Controlador encargado de registrar mascotas asociadas a clientes.
 *
 * @class MascotasController
 */
@Controller('clientes')
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService,) {}

  /**
   * Registra una mascota asociada a un cliente existente.
   *
   * Ruta:
   * POST /bh-core/v1/clientes/:clienteId/mascotas
   *
   * @param clienteId Identificador del cliente propietario.
   * @param dto Datos de la mascota a registrar.
   * @returns Mascota creada.
   */

  @Post(':clienteId/mascotas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECEPCIONISTA')
  crearMascota(@Param('clienteId') clienteId: string,@Body() dto: CrearMascotaDto,) {
    return this.mascotasService.crearMascota(clienteId,dto);
  }
}

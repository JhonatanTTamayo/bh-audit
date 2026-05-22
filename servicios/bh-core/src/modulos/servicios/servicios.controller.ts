import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { Roles } from '../autenticacion/decoradores/roles.decorador';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { RequestConUsuario } from '../autenticacion/interfaces/request-con-usuario.interface';
import { ServiciosService } from './servicios.service';

/**
 * Controlador encargado de exponer endpoints del catalogo de servicios.
 */
@Controller('servicios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  /**
   * Lista los servicios del catalogo.
   *
   * - ADMIN: recibe todos los servicios, incluyendo los desactivados.
   * - Otros roles: reciben solo los servicios activos.
   *
   * Ruta:
   * GET /api/servicios
   */
  @Get()
  @Roles('CLIENTE', 'VETERINARIO', 'RECEPCIONISTA', 'ADMIN')
  listarServicios(@Req() request: RequestConUsuario) {
    return this.serviciosService.listarServicios(request.usuario);
  }
}

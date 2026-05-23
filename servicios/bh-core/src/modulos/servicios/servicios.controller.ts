import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../autenticacion/decoradores/roles.decorador';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { RequestConUsuario } from '../autenticacion/interfaces/request-con-usuario.interface';
import { CrearServicioDto } from './dto/crear-servicio.dto';
import { EditarServicioDto } from './dto/editar-servicio.dto';
import { ServiciosService } from './servicios.service';

/**
 * Controlador encargado de exponer endpoints del catálogo de servicios.
 *
 * Aplica guardas de autenticación y roles para proteger las rutas.
 * Permite listar, crear, editar y desactivar servicios.
 */
@Controller('servicios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  /**
   * Lista los servicios del catálogo.
   *
   * - ADMIN: recibe todos los servicios, incluyendo los desactivados.
   * - Otros roles: reciben solo los servicios activos.
   *
   * Ruta:
   * GET /api/servicios
   *
   * @param request Objeto de la petición con información del usuario autenticado.
   * @returns Lista de servicios según el rol del usuario.
   */
  @Get()
  @Roles('CLIENTE', 'VETERINARIO', 'RECEPCIONISTA', 'ADMIN')
  listarServicios(@Req() request: RequestConUsuario) {
    return this.serviciosService.listarServicios(request.usuario);
  }

  /**
   * Crea un nuevo servicio en el catálogo.
   *
   * Ruta:
   * POST /api/servicios
   *
   * @param crearServicioDto DTO con los datos del nuevo servicio.
   * @returns El servicio creado.
   */
  @Post()
  @Roles('ADMIN')
  crearServicio(@Body() crearServicioDto: CrearServicioDto) {
    return this.serviciosService.crearServicio(crearServicioDto);
  }

  /**
   * Edita el nombre, descripción o precio de un servicio.
   *
   * Ruta:
   * PATCH /api/servicios/:servicioId
   *
   * @param servicioId Identificador único del servicio (UUID).
   * @param editarServicioDto DTO con los campos a modificar.
   * @returns El servicio actualizado.
   */
  @Patch(':servicioId')
  @Roles('ADMIN')
  editarServicio(
      @Param('servicioId', new ParseUUIDPipe()) servicioId: string,
      @Body() editarServicioDto: EditarServicioDto,
  ) {
    return this.serviciosService.editarServicio(servicioId, editarServicioDto);
  }

  /**
   * Desactiva un servicio del catálogo.
   * No lo elimina — sigue visible en citas e historial previo.
   *
   * Ruta:
   * PATCH /api/servicios/:servicioId/desactivar
   *
   * @param servicioId Identificador único del servicio (UUID).
   * @returns El servicio desactivado.
   */
  @Patch(':servicioId/desactivar')
  @Roles('ADMIN')
  desactivarServicio(
      @Param('servicioId', new ParseUUIDPipe()) servicioId: string,
  ) {
    return this.serviciosService.desactivarServicio(servicioId);
  }
}

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
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../autenticacion/decoradores/roles.decorador';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { RequestConUsuario } from '../autenticacion/interfaces/request-con-usuario.interface';
import { CitasService } from './citas.service';
import { CrearCitaDto } from './dto/crear-cita.dto';
import { FiltroCitasDto } from './dto/filtro-citas.dto';

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

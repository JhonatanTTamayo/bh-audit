import {
  Body,
  Controller,
  Get,
  Post,
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

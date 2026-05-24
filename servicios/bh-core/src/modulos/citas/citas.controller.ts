import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

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
@ApiTags('Citas')
@ApiBearerAuth()
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  /**
   * Lista citas aplicando filtros, paginacion y reglas de acceso por rol.
   *
   * Ruta:
   * GET /bh-core/v1/citas
   */
  @Get()
  @Roles('CLIENTE', 'VETERINARIO', 'RECEPCIONISTA', 'ADMIN')
  @ApiOperation({
    summary: 'Listar citas',
    description:
      'cliente ve solo sus propias citas; veterinario ve solo las citas asignadas a el; recepcionista y administrador ven todas las citas.',
  })
  @ApiQuery({ name: 'veterinarioId', required: false, type: String })
  @ApiQuery({ name: 'mascotaId', required: false, type: String })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: ['CONFIRMADA', 'FINALIZADA', 'CANCELADA'],
  })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  @ApiOkResponse({ description: 'Lista paginada de citas.' })
  @ApiUnauthorizedResponse({ description: 'No autenticado.' })
  @ApiForbiddenResponse({ description: 'Acceso denegado.' })
  @ApiBadRequestResponse({ description: 'Solicitud invalida.' })
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
   * POST /bh-core/v1/citas
   */
  @Post()
  @Roles('CLIENTE', 'RECEPCIONISTA')
  @ApiOperation({
    summary: 'Agendar nueva cita',
    description:
      'Agenda una cita y registra el pago de los servicios seleccionados. El pago es obligatorio; sin el la cita no se confirma. Valida que no exista cruce de horario para el veterinario asignado y envia correo automatico al cliente.',
  })
  @ApiBody({ type: CrearCitaDto })
  @ApiCreatedResponse({ description: 'Cita confirmada y pago registrado.' })
  @ApiBadRequestResponse({ description: 'Solicitud invalida.' })
  @ApiUnauthorizedResponse({ description: 'No autenticado.' })
  @ApiForbiddenResponse({ description: 'Acceso denegado.' })
  @ApiConflictResponse({
    description: 'El veterinario ya tiene una cita en ese horario.',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Pago rechazado o informacion de pago incompleta.',
  })
  crearCita(
    @Body() crearCitaDto: CrearCitaDto,
    @Req() request: RequestConUsuario,
  ) {
    return this.citasService.crearCita(crearCitaDto, request.usuario);
  }
}

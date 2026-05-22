import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../autenticacion/decoradores/roles.decorador';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { UsuariosService } from './usuarios.service';
import { FiltroUsuariosDto } from './dto/filtro-usuarios.dto';
import { CreateAdminDto } from './dto/crear-admin.dto';
import { RechazarCuentaDto } from './dto/rechazar-cuenta.dto';

/**
 * Controlador encargado de exponer endpoints administrativos
 * relacionados con la gestión de usuarios.
 */
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

    /**
     * Lista las cuentas de recepcionistas y veterinarios pendientes de aprobación.
     *
     * Ruta:
     * GET /api/usuarios/pendientes-aprobacion
     */
    @Get('pendientes-aprobacion')
    listarCuentasPendientesAprobacion() {
        return this.usuariosService.listarCuentasPendientesAprobacion();
    }

    /**
     * Aprueba una cuenta pendiente de aprobación.
     *
     * Ruta:
     * PATCH /api/usuarios/:usuarioId/aprobar
     */
    @Patch(':usuarioId/aprobar')
    aprobarCuenta(@Param('usuarioId', ParseUUIDPipe) usuarioId: string) {
        return this.usuariosService.aprobarCuenta(usuarioId);
    }

    /**
     * Rechaza una cuenta pendiente de aprobación.
     *
     * Ruta:
     * PATCH /api/usuarios/:usuarioId/rechazar
     */
    @Patch(':usuarioId/rechazar')
    rechazarCuenta(@Param('usuarioId', ParseUUIDPipe)usuarioId:string,
    @Body()rechazarCuentaDto:RechazarCuentaDto){
        return this.usuariosService.rechazarCuenta(usuarioId,rechazarCuentaDto);
    }

    /**
     * Suspende una cuenta de usuario existente.
     *
     * Ruta:
     * PATCH /api/usuarios/:usuarioId/suspender
     */
    @Patch(':usuarioId/suspender')
    suspenderCuenta(@Param('usuarioId', ParseUUIDPipe) usuarioId: string) {
    return this.usuariosService.suspenderCuenta(usuarioId);
    }   

    /**
     * Lista los usuarios registrados aplicando filtros opcionales por rol y estado.
     *
     * Ruta:
     * GET /api/usuarios
     */
    @Get()
    listarUsuarios(@Query() filtros: FiltroUsuariosDto) {
    return this.usuariosService.listarUsuarios(filtros);
    }

    /**
     * Permite a un administrador autenticado crear
     * una nueva cuenta de administrador.
     *
     * Ruta:
     * POST /api/usuarios/administradores
     */
    @Post('administradores')
    crearAdministrador(
    @Body() createAdminDto: CreateAdminDto,) {
        return this.usuariosService.crearAdministrador(createAdminDto,);
    }


}
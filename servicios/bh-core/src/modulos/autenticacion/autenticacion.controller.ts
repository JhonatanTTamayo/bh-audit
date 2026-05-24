import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AutenticacionService } from './autenticacion.service';
import { Roles } from './decoradores/roles.decorador';
import { LoginDto } from './dto/login-usuario.dto';
import { RegistroUsuarioDto } from './dto/registro-usuario.dto';
import { VerificarCorreoDto } from './dto/verificar-correo.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RequestConUsuario } from './interfaces/request-con-usuario.interface';

/**
 * Controlador encargado de exponer los endpoints de autenticación.
 */
@Controller('auth')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  /**
   * Registra un usuario y envía un código de verificación al correo.
   *
   * Ruta:
   * POST /bh-core/v1/auth/registro
   */
  @Post('registro')
  async registrar(@Body() registroDto: RegistroUsuarioDto) {
    return this.autenticacionService.registrar(registroDto);
  }

  /**
   * Verifica el correo electrónico de un usuario mediante código.
   *
   * Ruta:
   * POST /bh-core/v1/auth/verificar-correoo
   */
  @Post('verificar-correo')
  async verificarCorreo(@Body() verificarCorreoDto: VerificarCorreoDto) {
    return this.autenticacionService.verificarCorreo(verificarCorreoDto);
  }

  /**
   * Inicia sesión y genera un token JWT para el usuario autenticado.
   *
   * Ruta:
   * POST /bh-core/v1/auth/login
   */
  @Post('login')
  async iniciarSesion(@Body() loginDto: LoginDto) {
    return this.autenticacionService.iniciarSesion(loginDto);
  }

  /**
   * Obtiene la información del usuario autenticado a partir del token JWT.
   *
   * Ruta:
   * GET /bh-core/v1/autenticacion/perfil
   */
  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  obtenerPerfil(@Req() request: RequestConUsuario) {
    return {
      usuario: request.usuario,
    };
  }

  /**
   * Valida el acceso exclusivo para usuarios con rol ADMIN.
   *
   * Ruta:
   * GET /bh-core/v1/autenticacion/admin
   */
  @Get('admin')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  validarAccesoAdministrador(@Req() request: RequestConUsuario) {
    return {
      mensaje: 'Acceso permitido para administrador.',
      usuario: request.usuario,
    };
  }
}
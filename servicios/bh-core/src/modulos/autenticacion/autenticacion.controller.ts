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
/**
 * @class AutenticacionController
 */
@Controller('auth')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  /**
   * Registra un usuario y envía un código de verificación al correo.
   *
   * Ruta:
   * POST /bh-core/v1/auth/registro
   *
   * @param registroDto Datos necesarios para crear la cuenta.
   * @returns Usuario creado y mensaje de verificacion.
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
   *
   * @param verificarCorreoDto Correo y codigo de verificacion.
   * @returns Usuario actualizado con correo verificado.
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
   *
   * @param loginDto Credenciales del usuario.
   * @returns Token JWT y datos basicos del usuario.
   */
  @Post('login')
  async iniciarSesion(@Body() loginDto: LoginDto) {
    return this.autenticacionService.iniciarSesion(loginDto);
  }

  /**
   * Valida el acceso exclusivo para usuarios con rol ADMIN.
   *
   * Ruta:
   * GET /bh-core/v1/autenticacion/admin
   *
   * @param request Peticion autenticada con los datos del usuario.
   * @returns Mensaje de acceso y datos del usuario autenticado.
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

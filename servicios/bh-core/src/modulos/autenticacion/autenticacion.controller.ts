import { Body, Controller, Post } from '@nestjs/common';

import { AutenticacionService } from './autenticacion.service';
import { RegistroUsuarioDto } from './dto/registro-usuario.dto';
import { VerificarCorreoDto } from './dto/verificar-correo.dto';

/**
 * Controlador encargado de exponer los endpoints de autenticación.
 */
@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  /**
   * Registra un usuario y envía un código de verificación al correo.
   *
   * Ruta:
   * POST /api/autenticacion/registrar
   */
  @Post('registrar')
  async registrar(@Body() registroDto: RegistroUsuarioDto) {
    return this.autenticacionService.registrar(registroDto);
  }

  @Post('verificar-correo')
  async verificarCorreo(@Body() verificarCorreoDto: VerificarCorreoDto) {
    return this.autenticacionService.verificarCorreo(verificarCorreoDto);
  }
}
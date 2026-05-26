import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { RequestConUsuario } from '../interfaces/request-con-usuario.interface';

/**
 * Guard encargado de validar el token JWT enviado en el header Authorization.
 *
 * @class JwtAuthGuard
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Valida el token JWT y agrega el payload al request.
   *
   * @param context Contexto de ejecucion de NestJS.
   * @returns `true` cuando el token es valido.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestConUsuario>();
    const token = this.extraerTokenDesdeHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        codigo: 'NO_AUTENTICADO',
        mensaje: 'Se requiere autenticación para acceder a este recurso.',
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'clave_local_temporal',
      });

      request.usuario = payload;

      return true;
    } catch {
      throw new UnauthorizedException({
        codigo: 'TOKEN_INVALIDO',
        mensaje: 'El token de autenticación es inválido o ha expirado.',
      });
    }
  }

  /**
   * Extrae el token JWT desde el header Authorization.
   *
   * @param request Request HTTP con headers de autenticacion.
   * @returns Token JWT o undefined si no existe.
   */
  private extraerTokenDesdeHeader(
    request: RequestConUsuario,
  ): string | undefined {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return undefined;
    }

    const [tipo, token] = authorization.split(' ');

    if (tipo !== 'Bearer') {
      return undefined;
    }

    return token;
  }
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decoradores/roles.decorador';
import { RequestConUsuario } from '../interfaces/request-con-usuario.interface';

/**
 * Guard encargado de validar si el usuario autenticado tiene un rol permitido.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPermitidos = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rolesPermitidos || rolesPermitidos.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestConUsuario>();
    const usuario = request.usuario;

    if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
      throw new ForbiddenException({
        codigo: 'ACCESO_DENEGADO',
        mensaje: 'Tu rol no tiene permiso para realizar esta operación.',
      });
    }

    return true;
  }
}
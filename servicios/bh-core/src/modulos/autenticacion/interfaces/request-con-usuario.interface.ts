import { Request } from 'express';

import { JwtPayload } from './jwt-payload.interface';

/**
 * Extiende el request HTTP para incluir los datos del usuario autenticado.
 */
export interface RequestConUsuario extends Request {
  usuario: JwtPayload;
}
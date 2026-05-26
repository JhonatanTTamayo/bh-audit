import { Request } from 'express';

import { JwtPayload } from './jwt-payload.interface';

/**
 * Extiende el request HTTP para incluir los datos del usuario autenticado.
 */
/**
 * @interface RequestConUsuario
 */
export interface RequestConUsuario extends Request {
  usuario: JwtPayload;
}

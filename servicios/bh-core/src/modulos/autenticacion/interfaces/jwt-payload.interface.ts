/**
 * Representa la información almacenada dentro del token JWT.
 */
export interface JwtPayload {
  sub: string;
  correo: string;
  rol: string;
}
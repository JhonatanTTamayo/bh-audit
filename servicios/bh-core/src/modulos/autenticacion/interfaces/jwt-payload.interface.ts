/**
 * Representa la información almacenada dentro del token JWT.
 */
/**
 * @interface JwtPayload
 */
export interface JwtPayload {
  sub: string;
  correo: string;
  rol: string;
}

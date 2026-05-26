import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO usado para recibir credenciales de inicio de sesion.
 *
 * @class LoginDto
 */
export class LoginDto {
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  correo!: string;

  @IsString({ message: 'La contraseña debe ser texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  contrasena!: string;
}

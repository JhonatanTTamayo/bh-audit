import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  correo!: string;

  @IsString({ message: 'La contraseña debe ser texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  contrasena!: string;
}
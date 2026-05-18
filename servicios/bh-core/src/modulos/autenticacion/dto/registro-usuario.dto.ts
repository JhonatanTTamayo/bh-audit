import { IsEmail, IsNotEmpty, IsOptional,IsString, IsUUID, MinLength } from 'class-validator';

/**
 * DTO utilizado para recibir los datos de registro de un usuario.
 */
export class RegistroUsuarioDto {
  @IsString({ message: 'El nombre completo debe ser texto.' })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio.' })
  nombreCompleto!: string;

  @IsEmail({}, { message: 'El correo debe tener un formato válido.' })
  correo!: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto.' })
  telefono?: string;

  @IsString({ message: 'La contraseña debe ser texto.' })
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres.' })
  contrasena!: string;

  @IsUUID('4', { message: 'El rol debe ser un UUID válido.' })
  rolId!: string;
}
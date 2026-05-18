import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * DTO utilizado para verificar el correo electrónico
 * mediante un código de verificación.
 */
export class VerificarCorreoDto {
  @IsEmail()
  @IsNotEmpty()
  correo!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  codigo!: string;
}
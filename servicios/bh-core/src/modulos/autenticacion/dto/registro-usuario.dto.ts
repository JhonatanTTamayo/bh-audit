import { IsEmail, IsNotEmpty, IsOptional,IsString, IsUUID, MinLength } from 'class-validator';

/**
 * DTO utilizado para recibir y validar los datos
 * necesarios en el registro de un usuario.
 *
 * Este objeto representa el cuerpo de la petición
 * enviada al endpoint POST /api/autenticacion/registrar.
 */
/**
 * @class RegistroUsuarioDto
 */
export class RegistroUsuarioDto {

  /**
   * Nombre completo del usuario a registrar.
   */
  @IsString({ message: 'El nombre completo debe ser texto.' })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio.' })
  nombreCompleto!: string;

  /**
   * Correo electrónico del usuario a registrar.
   * Debe ser único y tener un formato válido.
   */

  @IsEmail({}, { message: 'El correo debe tener un formato válido.' })
  correo!: string;

  /**
   * Número de teléfono del usuario a registrar.
   * Es un campo opcional, pero si se proporciona, debe ser texto.
   */
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto.' })
  telefono?: string;

  /**
   * Contraseña del usuario a registrar.
   * Debe tener un mínimo de 6 caracteres.
   */
  @IsString({ message: 'La contraseña debe ser texto.' })
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres.' })
  contrasena!: string;

  /**
   * ID del rol que se asignará al usuario.
   * Debe ser un UUID válido.
   * h
   */
  @IsUUID('4', { message: 'El rol debe ser un UUID válido.' })
  rolId!: string;
}

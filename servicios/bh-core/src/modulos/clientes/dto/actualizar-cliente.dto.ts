import {IsEmail,IsOptional,IsString,} from 'class-validator';

/**
 * DTO usado para actualizar datos parciales de un cliente.
 *
 * @class ActualizarClienteDto
 */
export class ActualizarClienteDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  documento?: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}

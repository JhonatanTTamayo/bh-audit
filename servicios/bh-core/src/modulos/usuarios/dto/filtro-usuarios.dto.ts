import { EstadoUsuario } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * DTO para recibir filtros opcionales al listar usuarios.
 */
export class FiltroUsuariosDto {
  @IsOptional()
  @IsString({ message: 'El rol debe ser texto.' })
  rol?: string;

  @IsOptional()
  @IsEnum(EstadoUsuario, {
    message: 'El estado debe ser un valor válido de EstadoUsuario.',
  })
  estado?: EstadoUsuario;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'La página debe ser un número entero.' })
  @Min(0, { message: 'La página no puede ser menor que 0.' })
  page?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'El tamaño debe ser un número entero.' })
  @Min(1, { message: 'El tamaño debe ser mínimo 1.' })
  size?: number;
}
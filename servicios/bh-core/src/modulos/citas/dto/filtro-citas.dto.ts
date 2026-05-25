import { EstadoCita } from '@prisma/client';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

/**
 * DTO para recibir filtros opcionales al listar citas.
 *
 * @class FiltroCitasDto
 */
export class FiltroCitasDto {
  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Filtrar por veterinario.',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El veterinario debe ser un UUID valido.' })
  veterinarioId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Filtrar por mascota.',
  })
  @IsOptional()
  @IsUUID('4', { message: 'La mascota debe ser un UUID valido.' })
  mascotaId?: string;

  @ApiPropertyOptional({
    enum: EstadoCita,
  })
  @IsOptional()
  @IsEnum(EstadoCita, {
    message: 'El estado debe ser un valor valido de EstadoCita.',
  })
  estado?: EstadoCita;

  @ApiPropertyOptional({
    format: 'date',
    description: 'Fecha de inicio del rango (YYYY-MM-DD).',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha desde debe tener formato de fecha valido.' },
  )
  fechaDesde?: string;

  @ApiPropertyOptional({
    format: 'date',
    description: 'Fecha de fin del rango (YYYY-MM-DD).',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha hasta debe tener formato de fecha valido.' },
  )
  fechaHasta?: string;

  @ApiPropertyOptional({
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'La pagina debe ser un numero entero.' })
  @Min(0, { message: 'La pagina no puede ser menor que 0.' })
  page?: number;

  @ApiPropertyOptional({
    minimum: 1,
    default: 20,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'El tamano debe ser un numero entero.' })
  @Min(1, { message: 'El tamano debe ser minimo 1.' })
  size?: number;
}

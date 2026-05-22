import { EstadoCita } from '@prisma/client';
import { Transform } from 'class-transformer';
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
 */
export class FiltroCitasDto {
  @IsOptional()
  @IsUUID('4', { message: 'El veterinario debe ser un UUID valido.' })
  veterinarioId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'La mascota debe ser un UUID valido.' })
  mascotaId?: string;

  @IsOptional()
  @IsEnum(EstadoCita, {
    message: 'El estado debe ser un valor valido de EstadoCita.',
  })
  estado?: EstadoCita;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha desde debe tener formato de fecha valido.' },
  )
  fechaDesde?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha hasta debe tener formato de fecha valido.' },
  )
  fechaHasta?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'La pagina debe ser un numero entero.' })
  @Min(0, { message: 'La pagina no puede ser menor que 0.' })
  page?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'El tamano debe ser un numero entero.' })
  @Min(1, { message: 'El tamano debe ser minimo 1.' })
  size?: number;
}

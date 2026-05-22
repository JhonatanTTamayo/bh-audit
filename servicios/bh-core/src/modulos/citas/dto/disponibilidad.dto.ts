import { IsUUID, IsDateString } from 'class-validator';

/**
 * DTO para consultar disponibilidad de un veterinario en una fecha.
 */
export class DisponibilidadQueryDto {
  @IsUUID('4', { message: 'El veterinario debe ser un UUID valido.' })
  veterinarioId!: string;

  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD.' })
  fecha!: string;
}

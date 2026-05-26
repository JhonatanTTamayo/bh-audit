import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

/**
 * DTO para consultar horarios disponibles de un veterinario en una fecha.
 *
 * @class ConsultarDisponibilidadDto
 */
export class ConsultarDisponibilidadDto {
  @ApiProperty({
    format: 'uuid',
    description: 'ID del veterinario.',
  })
  @IsUUID('4', { message: 'El veterinario debe ser un UUID valido.' })
  veterinarioId!: string;

  @ApiProperty({
    format: 'date',
    example: '2026-06-15',
    description: 'Fecha a consultar (YYYY-MM-DD).',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato valido.' })
  fecha!: string;
}

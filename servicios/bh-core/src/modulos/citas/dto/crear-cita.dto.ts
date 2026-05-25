import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { PagoCitaDto } from './pago-cita.dto';

/**
 * DTO para recibir y validar los datos necesarios al agendar una cita.
 *
 * @class CrearCitaDto
 */
export class CrearCitaDto {
  @ApiProperty({
    format: 'uuid',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID('4', { message: 'La mascota debe ser un UUID valido.' })
  mascotaId!: string;

  @ApiProperty({
    format: 'uuid',
    example: '7cb94e91-1234-4321-b3fc-9d853f11bcd2',
  })
  @IsUUID('4', { message: 'El veterinario debe ser un UUID valido.' })
  veterinarioId!: string;

  @ApiProperty({
    format: 'date',
    example: '2025-08-15',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato de fecha valido.' })
  fecha!: string;

  @ApiProperty({
    example: '10:00',
    pattern: '^([01]\\d|2[0-3]):[0-5]\\d$',
  })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'La hora debe tener formato HH:mm.',
  })
  hora!: string;

  @ApiProperty({
    type: [String],
    format: 'uuid',
    example: [
      'aab5c123-0000-0000-0000-000000000001',
      'aab5c123-0000-0000-0000-000000000002',
    ],
  })
  @IsArray({ message: 'Los servicios deben enviarse como un arreglo.' })
  @ArrayMinSize(1, { message: 'Debe seleccionarse al menos un servicio.' })
  @IsUUID('4', {
    each: true,
    message: 'Cada servicio debe ser un UUID valido.',
  })
  servicioIds!: string[];

  @ApiProperty({
    type: PagoCitaDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PagoCitaDto)
  pago?: PagoCitaDto;
}

import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsDefined,
  IsNotEmpty,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';

import { PagoCitaDto } from './pago-cita.dto';

/**
 * DTO para recibir y validar los datos necesarios al agendar una cita.
 */
export class CrearCitaDto {
  @IsUUID('4', { message: 'La mascota debe ser un UUID valido.' })
  mascotaId!: string;

  @IsUUID('4', { message: 'El veterinario debe ser un UUID valido.' })
  veterinarioId!: string;

  @IsDateString({}, { message: 'La fecha debe tener formato de fecha valido.' })
  fecha!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'La hora debe tener formato HH:mm.',
  })
  hora!: string;

  @IsArray({ message: 'Los servicios deben enviarse como un arreglo.' })
  @ArrayMinSize(1, { message: 'Debe seleccionarse al menos un servicio.' })
  @IsUUID('4', {
    each: true,
    message: 'Cada servicio debe ser un UUID valido.',
  })
  servicioIds!: string[];

  @IsDefined({ message: 'El pago es obligatorio para agendar la cita.' })
  @IsNotEmpty({ message: 'El pago es obligatorio para agendar la cita.' })
  @ValidateNested()
  @Type(() => PagoCitaDto)
  pago!: PagoCitaDto;
}

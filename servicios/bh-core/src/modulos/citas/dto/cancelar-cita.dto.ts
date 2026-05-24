import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * DTO para recibir el motivo de cancelacion de una cita.
 */
export class CancelarCitaDto {
  @ApiProperty({
    example: 'El cliente no puede asistir a la cita programada.',
    maxLength: 500,
  })
  @IsString({ message: 'El motivo debe ser texto.' })
  @IsNotEmpty({ message: 'El motivo de cancelacion es obligatorio.' })
  @MaxLength(500, {
    message: 'El motivo de cancelacion no puede superar 500 caracteres.',
  })
  motivo!: string;
}

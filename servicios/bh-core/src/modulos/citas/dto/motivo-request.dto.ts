import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * DTO para recibir el motivo de cancelación de una cita.
 */
export class MotivoRequestDto {
  @IsString({ message: 'El motivo debe ser texto.' })
  @IsNotEmpty({ message: 'El motivo es obligatorio.' })
  @MinLength(5, { message: 'El motivo debe tener al menos 5 caracteres.' })
  @MaxLength(500, { message: 'El motivo no puede exceder 500 caracteres.' })
  motivo!: string;
}

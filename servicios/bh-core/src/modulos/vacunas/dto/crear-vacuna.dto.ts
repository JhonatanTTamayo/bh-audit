import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

/**
 * DTO para registrar una vacuna aplicada dentro del historial médico de la mascota.
 */
export class CrearVacunaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la vacuna es obligatorio' })
  nombre!: string;

  @IsDateString()
  @IsNotEmpty({ message: 'La fecha de aplicación es obligatoria' })
  fechaAplicacion!: string;

  @IsDateString()
  @IsNotEmpty({ message: 'La fecha de próxima dosis es obligatoria' })
  fechaProximaDosis!: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del producto no es válido' })
  productoId?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
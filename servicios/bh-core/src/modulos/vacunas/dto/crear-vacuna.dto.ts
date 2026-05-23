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
  @IsNotEmpty()
  nombre!: string;

  @IsDateString()
  @IsNotEmpty()
  fechaAplicacion!: string;

  @IsDateString()
  @IsNotEmpty()
  fechaProximaDosis!: string;

  @IsOptional()
  @IsUUID()
  productoId?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

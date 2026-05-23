import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * DTO que representa un medicamento prescrito dentro de una consulta.
 */
export class MedicamentoPrescritoUpdateDto {
  @IsUUID()
  @IsNotEmpty()
  productoId!: string;

  @IsString()
  @IsNotEmpty()
  dosis!: string;

  @IsString()
  @IsNotEmpty()
  duracion!: string;
}

/**
 * DTO para corregir un registro médico dentro de las primeras 24 horas.
 */
export class ActualizarHistorialMedicoDto {
  @IsString()
  @IsNotEmpty()
  motivoVisita!: string;

  @IsString()
  @IsNotEmpty()
  diagnostico!: string;

  @IsString()
  @IsNotEmpty()
  tratamiento!: string;

  @IsNumber()
  @Min(0)
  peso!: number;

  @IsOptional()
  @IsDateString()
  fechaProximaVisita?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicamentoPrescritoUpdateDto)
  medicamentosPrescritos?: MedicamentoPrescritoUpdateDto[];
}
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
export class MedicamentoPrescritoDto {
  @IsUUID()
  @IsNotEmpty()
  productoId: string;
 
  @IsString()
  @IsNotEmpty()
  dosis: string;
 
  @IsString()
  @IsNotEmpty()
  duracion: string;
}
 
/**
 * DTO para registrar el resultado de una consulta en el historial médico.
 */
export class CrearHistorialMedicoDto {
  @IsUUID()
  @IsNotEmpty()
  citaId: string;
 
  @IsString()
  @IsNotEmpty()
  motivoVisita: string;
 
  @IsString()
  @IsNotEmpty()
  diagnostico: string;
 
  @IsString()
  @IsNotEmpty()
  tratamiento: string;
 
  @IsNumber()
  @Min(0)
  peso: number;
 
  @IsOptional()
  @IsDateString()
  fechaProximaVisita?: string;
 
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicamentoPrescritoDto)
  medicamentosPrescritos?: MedicamentoPrescritoDto[];
}
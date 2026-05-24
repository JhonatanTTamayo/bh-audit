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
  @IsUUID('4', { message: 'El ID del producto no es válido' })
  productoId!: string;
 
  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidad!: number;
}
 
/**
 * DTO para registrar el resultado de una consulta en el historial médico.
 */
export class CrearHistorialMedicoDto {
  @IsString()
  @IsNotEmpty({ message: 'El motivo de consulta es obligatorio' })
  motivoConsulta!: string;
 
  @IsString()
  @IsNotEmpty({ message: 'El diagnóstico es obligatorio' })
  diagnostico!: string;
 
  @IsString()
  @IsNotEmpty({ message: 'El tratamiento es obligatorio' })
  tratamiento!: string;
 
  @IsNumber()
  @Min(0, { message: 'El peso debe ser mayor a 0' })
  pesoMascota!: number;
 
  @IsOptional()
  @IsDateString()
  fechaProximaVisita?: string;
 
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicamentoPrescritoDto)
  medicamentos?: MedicamentoPrescritoDto[];
}
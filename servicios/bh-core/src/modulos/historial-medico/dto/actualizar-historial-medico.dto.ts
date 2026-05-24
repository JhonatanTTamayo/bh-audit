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
 * DTO que representa un medicamento prescrito al actualizar el historial.
 */
export class MedicamentoPrescritoUpdateDto {
  @IsUUID('4', { message: 'El ID del producto no es válido' })
  productoId!: string;
 
  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidad!: number;
}
 
/**
 * DTO para corregir un registro médico dentro de las primeras 24 horas.
 */
export class ActualizarHistorialMedicoDto {
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
  @Type(() => MedicamentoPrescritoUpdateDto)
  medicamentos?: MedicamentoPrescritoUpdateDto[];
}
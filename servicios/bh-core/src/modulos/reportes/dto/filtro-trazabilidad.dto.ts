import {
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class FiltroTrazabilidadDto {

  @IsDateString()
  fechaInicio!: string;

  @IsDateString()
  fechaFin!: string;

  @IsOptional()
  @IsString()
  usuario?: string;

  @IsOptional()
  @IsString()
  tipoAccion?: string;
}
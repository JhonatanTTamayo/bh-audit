import {
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * DTO usado para filtrar el reporte de trazabilidad.
 *
 * @class FiltroTrazabilidadDto
 */
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

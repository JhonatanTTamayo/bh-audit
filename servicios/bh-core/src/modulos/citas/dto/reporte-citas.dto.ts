import { IsDateString, IsNotEmpty } from 'class-validator';

/**
 * DTO para recibir el rango de fechas al generar el reporte de citas.
 */
export class ReporteCitasDto {
  @IsDateString({}, { message: 'La fecha desde debe tener formato de fecha valido.' })
  @IsNotEmpty({ message: 'La fecha desde es obligatoria.' })
  fechaDesde: string;

  @IsDateString({}, { message: 'La fecha hasta debe tener formato de fecha valido.' })
  @IsNotEmpty({ message: 'La fecha hasta es obligatoria.' })
  fechaHasta: string;
}
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

/**
 * DTO para paginar el historial médico de una mascota.
 */
/**
 * @class FiltroHistorialMedicoDto
 */
export class FiltroHistorialMedicoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number;
}

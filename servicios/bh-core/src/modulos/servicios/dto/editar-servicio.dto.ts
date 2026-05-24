import { IsString, IsNumber, IsPositive, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para la edición de un servicio existente en el sistema.
 *
 * Permite modificar opcionalmente los campos del servicio,
 * aplicando validaciones para mantener la integridad de los datos.
 */
export class EditarServicioDto {
  /**
   * Nombre del servicio.
   * - Opcional
   * - Debe ser una cadena
   * - Máximo 100 caracteres
   */
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  /**
   * Descripción del servicio.
   * - Opcional
   * - Debe ser una cadena
   * - Máximo 500 caracteres
   */
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  /**
   * Precio del servicio.
   * - Opcional
   * - Debe ser un número positivo
   * - Máximo 2 decimales
   */
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido.' })
  @IsPositive({ message: 'El precio debe ser mayor a cero.' })
  @IsOptional()
  @Type(() => Number)
  precio?: number;
}

import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para la creación de un servicio dentro del sistema.
 *
 * Contiene validaciones para asegurar que los datos ingresados
 * cumplan con las reglas de negocio y restricciones de formato.
 */
export class CrearServicioDto {
  /**
   * Nombre del servicio.
   * - Obligatorio
   * - Debe ser una cadena no vacía
   * - Máximo 100 caracteres
   */
  @IsString()
  @IsNotEmpty({ message: 'El nombre del servicio es obligatorio.' })
  @MaxLength(100)
  nombre: string;

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
   * - Obligatorio
   * - Debe ser un número positivo
   * - Máximo 2 decimales
   */
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido.' })
  @IsPositive({ message: 'El precio debe ser mayor a cero.' })
  @Type(() => Number)
  precio: number;
}

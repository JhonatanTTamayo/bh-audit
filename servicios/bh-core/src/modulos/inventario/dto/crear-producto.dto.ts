import { Type } from 'class-transformer';

import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export enum TipoProductoDto {
  MEDICAMENTO = 'MEDICAMENTO',
  VACUNA = 'VACUNA',
  INSUMO_QUIRURGICO = 'INSUMO_QUIRURGICO',
}

export class CrearProductoDto {

  @IsString({
    message: 'El nombre debe ser texto',
  })
  @IsNotEmpty({
    message: 'El nombre es obligatorio',
  })
  nombre!: string;

  @IsEnum(TipoProductoDto, {
    message:
      'El tipo debe ser MEDICAMENTO, VACUNA o INSUMO_QUIRURGICO',
  })
  tipo!: TipoProductoDto;

  @Type(() => Number)
  @IsInt({
    message: 'El stock debe ser un número entero',
  })
  @Min(0, {
    message: 'El stock no puede ser menor a 0',
  })
  stock!: number;

  @Type(() => Number)
  @IsInt({
    message:
      'El stock mínimo debe ser un número entero',
  })
  @Min(0, {
    message:
      'El stock mínimo no puede ser menor a 0',
  })
  stockMinimo!: number;

  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'El precio debe ser numérico',
    },
  )
  @IsPositive({
    message: 'El precio debe ser mayor a 0',
  })
  precio!: number;

  @IsDateString(
    {},
    {
      message:
        'La fecha de vencimiento debe tener formato válido',
    },
  )
  fechaVencimiento!: string;

}
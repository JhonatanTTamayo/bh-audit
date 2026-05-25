import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { TipoProductoDto } from './crear-producto.dto';

/**
 * DTO usado para filtrar productos de inventario.
 *
 * @class FiltroProductoDto
 */
export class FiltroProductoDto {

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEnum(TipoProductoDto)
  tipo?: TipoProductoDto;

}

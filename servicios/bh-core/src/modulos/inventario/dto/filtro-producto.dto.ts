import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { TipoProductoDto } from './crear-producto.dto';

export class FiltroProductoDto {

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEnum(TipoProductoDto)
  tipo?: TipoProductoDto;

}
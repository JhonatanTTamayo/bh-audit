import { Type } from 'class-transformer';

import {
  IsInt,
} from 'class-validator';

/**
 * DTO usado para ajustar el stock de un producto.
 *
 * @class AjustarStockDto
 */
export class AjustarStockDto {

  @Type(() => Number)
  @IsInt()
  cantidad!: number;

}

import { Type } from 'class-transformer';

import {
  IsInt,
} from 'class-validator';

export class AjustarStockDto {

  @Type(() => Number)
  @IsInt()
  cantidad!: number;

}
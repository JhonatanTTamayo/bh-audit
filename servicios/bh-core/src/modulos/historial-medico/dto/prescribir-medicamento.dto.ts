import { Type } from 'class-transformer';

import {
  IsInt,
  IsUUID,
  Min,
} from 'class-validator';

/**
 * DTO usado para prescribir medicamentos y descontar stock.
 *
 * @class PrescribirMedicamentoDto
 */
export class PrescribirMedicamentoDto {

  @IsUUID('4', {
    message: 'El ID del producto no es válido',
  })
  productoId!: string;

  @Type(() => Number)

  @IsInt({
    message: 'La cantidad debe ser un número entero',
  })

  @Min(1, {
    message: 'La cantidad debe ser mayor a 0',
  })

  cantidad!: number;

}

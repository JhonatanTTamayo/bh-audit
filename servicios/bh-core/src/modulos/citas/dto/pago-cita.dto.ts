import { MetodoPago } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';

/**
 * DTO para recibir y validar los datos del pago de una cita.
 */
export class PagoCitaDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(MetodoPago, {
    message: 'El metodo de pago debe ser EFECTIVO, TARJETA o TRANSFERENCIA.',
  })
  metodo!: MetodoPago;

  @ValidateIf(
    (pago: PagoCitaDto) =>
      pago.metodo === MetodoPago.TARJETA ||
      pago.metodo === MetodoPago.TRANSFERENCIA,
  )
  @IsString({ message: 'La referencia del pago debe ser texto.' })
  @IsNotEmpty({
    message:
      'La referencia del pago es obligatoria para tarjeta o transferencia.',
  })
  referencia?: string;
}

import { MetodoPago } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para recibir y validar los datos del pago de una cita.
 */
export class PagoCitaDto {
  @ApiProperty({
    enum: MetodoPago,
    example: 'tarjeta',
    description: 'Metodo de pago: efectivo, tarjeta o transferencia.',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(MetodoPago, {
    message: 'El metodo de pago debe ser EFECTIVO, TARJETA o TRANSFERENCIA.',
  })
  metodo!: MetodoPago;

  @ApiPropertyOptional({
    example: 'TXN-20250815-001',
    description: 'Obligatoria para pagos con tarjeta o transferencia.',
  })
  @IsOptional()
  @IsString({ message: 'La referencia del pago debe ser texto.' })
  referencia?: string;
}

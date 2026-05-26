// dto/anular-factura.dto.ts
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO usado para anular una factura.
 *
 * @class AnularFacturaDto
 */
export class AnularFacturaDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(10, { message: 'El motivo de anulación debe ser más descriptivo.' })
    motivoAnulacion: string;
}

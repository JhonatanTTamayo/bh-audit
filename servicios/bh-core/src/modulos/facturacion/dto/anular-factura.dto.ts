// dto/anular-factura.dto.ts
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AnularFacturaDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(10, { message: 'El motivo de anulación debe ser más descriptivo.' })
    motivoAnulacion: string;
}
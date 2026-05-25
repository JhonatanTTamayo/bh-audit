import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

/**
 * DTO usado para crear facturas.
 *
 * @class CrearFacturaDto
 */
export class CrearFacturaDto {
    @IsString()
    @IsNotEmpty()
    atencionId: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    descuento?: number;
}

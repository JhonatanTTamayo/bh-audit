import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CrearFacturaDto {
    @IsString()
    @IsNotEmpty()
    atencionId: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    descuento?: number;
}
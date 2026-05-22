// dto/crear-factura.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Primero definimos la estructura de cada ítem/concepto que se va a cobrar
export class DetalleFacturaDto {
    @IsString()
    @IsNotEmpty()
    concepto: string; // Ejemplo: "Consulta médica general", "Examen de laboratorio"

    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    precioUnitario: number;

    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    cantidad: number;
}

export class CrearFacturaDto {
    @IsString()
    @IsNotEmpty()
    atencionId: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    descuento?: number;

    @IsString()
    @IsNotEmpty()
    metodoPago: string; // Ejemplo: "Efectivo", "PSE", "Tarjeta"

    // Validamos que sea un arreglo y que use las reglas de la clase DetalleFacturaDto
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetalleFacturaDto)
    @IsNotEmpty()
    detalles: DetalleFacturaDto[];
}
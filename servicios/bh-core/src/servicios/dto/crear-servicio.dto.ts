import { IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para crear un nuevo servicio de la clínica.
 */
export class CrearServicioDto {
    @IsString({ message: 'El nombre debe ser texto.' })
    @IsNotEmpty({ message: 'El nombre es obligatorio.' })
    nombre!: string;

    @IsString({ message: 'La descripción debe ser texto.' })
    @IsOptional()
    descripcion?: string;

    @IsNumber({}, { message: 'El precio debe ser un número.' })
    @Min(0, { message: 'El precio no puede ser negativo.' })
    @Type(() => Number)
    precio!: number;
}
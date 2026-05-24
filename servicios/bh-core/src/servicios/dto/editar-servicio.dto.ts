import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para editar un servicio existente.
 * Todos los campos son opcionales — solo se actualizan los que se envíen.
 */
export class EditarServicioDto {
    @IsString({ message: 'El nombre debe ser texto.' })
    @IsOptional()
    nombre?: string;

    @IsString({ message: 'La descripción debe ser texto.' })
    @IsOptional()
    descripcion?: string;

    @IsNumber({}, { message: 'El precio debe ser un número.' })
    @Min(0, { message: 'El precio no puede ser negativo.' })
    @Type(() => Number)
    @IsOptional()
    precio?: number;
}
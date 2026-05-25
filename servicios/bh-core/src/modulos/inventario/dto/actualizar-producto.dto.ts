import { PartialType } from '@nestjs/mapped-types';
import { CrearProductoDto } from './crear-producto.dto';

/**
 * DTO usado para actualizar productos con campos parciales.
 *
 * @class ActualizarProductoDto
 */
export class ActualizarProductoDto extends PartialType(CrearProductoDto) {}

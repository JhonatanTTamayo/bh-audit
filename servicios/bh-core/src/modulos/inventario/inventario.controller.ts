import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Delete,
    Query,
} from '@nestjs/common';

import { InventarioService } from './inventario.service';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { FiltroProductoDto } from './dto/filtro-producto.dto';
import { AjustarStockDto } from './dto/ajustar-stock.dto';

/**
 * Controlador encargado de exponer endpoints de inventario.
 *
 * @class InventarioController
 */
@Controller('inventario')
export class InventarioController {

  constructor(
    private readonly inventarioService: InventarioService,
  ) {}

  /**
   * Crea un producto en inventario.
   *
   * @param crearProductoDto Datos del producto.
   * @returns Producto creado.
   */
  @Post()
  crear(
    @Body() crearProductoDto: CrearProductoDto,
  ) {

    return this.inventarioService.crear(
      crearProductoDto,
    );

  }

  /**
   * Lista productos activos aplicando filtros opcionales.
   *
   * @param filtros Filtros por nombre y tipo.
   * @returns Lista de productos activos.
   */
  @Get()
  listar(
    @Query() filtros: FiltroProductoDto,
  ) {

    return this.inventarioService.listar(
      filtros,
    );

  }

  /**
   * Obtiene productos cuyo stock esta en el minimo o por debajo.
   *
   * @returns Lista de productos con stock bajo.
   */
  @Get('stock-bajo')
  obtenerStockBajo() {

    return this.inventarioService.obtenerStockBajo();

  }

  /**
   * Obtiene productos proximos a vencer.
   *
   * @returns Lista de productos con vencimiento cercano.
   */
  @Get('proximos-vencer')
  obtenerProximosAVencer() {

    return this.inventarioService
      .obtenerProximosAVencer();

  }

  /**
   * Obtiene un producto activo por ID.
   *
   * @param id Identificador del producto.
   * @returns Producto encontrado.
   */
  @Get(':id')
  obtenerPorId(
    @Param('id') id: string,
  ) {

    return this.inventarioService.obtenerPorId(id);

  }

  /**
   * Actualiza los datos de un producto.
   *
   * @param id Identificador del producto.
   * @param actualizarProductoDto Datos parciales del producto.
   * @returns Producto actualizado.
   */
  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body()
    actualizarProductoDto: ActualizarProductoDto,
  ) {

    return this.inventarioService.actualizar(
      id,
      actualizarProductoDto,
    );

  }

  /**
   * Ajusta el stock de un producto sumando o restando unidades.
   *
   * @param id Identificador del producto.
   * @param ajustarStockDto Cantidad a aplicar al stock.
   * @returns Producto con stock actualizado.
   */
  @Patch(':id/stock')
  ajustarStock(
    @Param('id') id: string,
    @Body() ajustarStockDto: AjustarStockDto,
  ) {

    return this.inventarioService.ajustarStock(
      id,
      ajustarStockDto.cantidad,
    );

  }

  /**
   * Desactiva un producto mediante eliminacion logica.
   *
   * @param id Identificador del producto.
   * @returns Producto marcado como inactivo.
   */
  @Delete(':id')
  eliminar(
    @Param('id') id: string,
  ) {

    return this.inventarioService.eliminar(id);

  }

}

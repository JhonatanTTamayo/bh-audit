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

@Controller('inventario')
export class InventarioController {

    constructor(
        private readonly inventarioService: InventarioService,
    ) { }

    @Post()
    crear(
        @Body() crearProductoDto: CrearProductoDto,
    ) {

        return this.inventarioService.crear(
            crearProductoDto,
        );

    }

    @Get()
    listar(
        @Query() filtros: FiltroProductoDto,
    ) {

        return this.inventarioService.listar(
            filtros,
        );

    }

    @Get('stock-bajo')
    obtenerStockBajo(
        @Query() filtros: FiltroProductoDto,
    ) {

        return this.inventarioService.obtenerStockBajo(
            filtros,
        );

    }

    @Get('proximos-vencer')
    obtenerProximosAVencer(
        @Query() filtros: FiltroProductoDto,
        @Query('dias') dias?: string,
    ) {

        return this.inventarioService
            .obtenerProximosAVencer(
                dias ? Number(dias) : 30,
                filtros,
            );

    }

    @Get(':id')
    obtenerPorId(
        @Param('id') id: string,
    ) {

        return this.inventarioService.obtenerPorId(id);

    }

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

    @Delete(':id')
    eliminar(
        @Param('id') id: string,
    ) {

        return this.inventarioService.eliminar(id);

    }

    @Get('resumen')
    obtenerResumen() {

        return this.inventarioService.obtenerResumen();

    }

}
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../basedatos/prisma.service';

import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { FiltroProductoDto } from './dto/filtro-producto.dto';

@Injectable()
export class InventarioService {

    constructor(
        private prisma: PrismaService,
    ) { }

    async crear(crearProductoDto: CrearProductoDto) {

        const productoExistente =
            await this.prisma.producto.findFirst({
                where: {
                    nombre: crearProductoDto.nombre,
                    activo: true,
                },
            });

        if (productoExistente) {
            throw new BadRequestException(
                'Ya existe un producto con ese nombre',
            );
        }

        return this.prisma.producto.create({
            data: {
                ...crearProductoDto,

                fechaVencimiento: new Date(
                    crearProductoDto.fechaVencimiento,
                ),
            },
        });

    }

    async listar(filtros?: FiltroProductoDto) {

        return this.prisma.producto.findMany({
            where: {
                activo: true,

                nombre: filtros?.nombre
                    ? {
                        contains: filtros.nombre,
                    }
                    : undefined,

                tipo: filtros?.tipo,
            },
        });

    }

    async obtenerPorId(id: string) {

        const producto =
            await this.prisma.producto.findUnique({
                where: { id },
            });

        if (!producto || !producto.activo) {
            throw new NotFoundException(
                'Producto no encontrado',
            );
        }

        return producto;

    }

    async actualizar(
        id: string,
        actualizarProductoDto: ActualizarProductoDto,
    ) {

        await this.obtenerPorId(id);

        return this.prisma.producto.update({
            where: {
                id,
            },

            data: {
                ...actualizarProductoDto,

                fechaVencimiento:
                    actualizarProductoDto.fechaVencimiento
                        ? new Date(
                            actualizarProductoDto.fechaVencimiento,
                        )
                        : undefined,
            },
        });

    }

    async eliminar(id: string) {

        await this.obtenerPorId(id);

        return this.prisma.producto.update({
            where: { id },

            data: {
                activo: false,
            },
        });

    }

    async obtenerStockBajo() {

        const productos =
            await this.prisma.producto.findMany({
                where: {
                    activo: true,
                },
            });

        return productos.filter(
            producto =>
                producto.stock <= producto.stockMinimo,
        );

    }

    async obtenerProximosAVencer(
        dias = 30,
    ) {

        const fechaLimite = new Date();

        fechaLimite.setDate(
            fechaLimite.getDate() + dias,
        );

        return this.prisma.producto.findMany({
            where: {
                activo: true,

                fechaVencimiento: {
                    lte: fechaLimite,
                },
            },
        });

    }

    async ajustarStock(
        id: string,
        cantidad: number,
    ) {

        const producto =
            await this.obtenerPorId(id);

        const nuevoStock =
            producto.stock + cantidad;

        if (nuevoStock < 0) {
            throw new BadRequestException(
                'El stock no puede ser negativo',
            );
        }

        return this.prisma.producto.update({
            where: {
                id,
            },

            data: {
                stock: nuevoStock,
            },
        });

    }

}
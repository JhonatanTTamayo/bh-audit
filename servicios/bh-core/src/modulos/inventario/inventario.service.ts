import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../basedatos/prisma.service';

/**
 * Servicio encargado de gestionar el inventario de productos de la clinica.
 */
@Injectable()
export class InventarioService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todos los productos activos del inventario.
   * Usado internamente para generar el reporte PDF.
   */
  async obtenerProductosParaReporte() {
    const productos = await this.prisma.inventario.findMany({
      where: { activo: true },
      orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
    });

    return productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      tipo: p.tipo,
      stock: p.stock,
      stockMinimo: p.stockMinimo,
      precio: p.precio.toNumber(),
      fechaVencimiento: p.fechaVencimiento,
      activo: p.activo,
    }));
  }
}
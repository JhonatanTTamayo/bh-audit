import { Response } from 'express';

interface ProductoInventario {
  id: string;
  nombre: string;
  tipo: string;
  stock: number;
  stockMinimo: number;
  precio: number;
  fechaVencimiento: Date;
  activo: boolean;
}

export class PdfInventarioHelper {

  /**
   * Genera y escribe el reporte de inventario directamente sobre la respuesta HTTP.
   * Sigue el mismo patron que PdfFacturacionHelper del proyecto.
   */
  static generarReporteInventarioPdf(
    res: Response,
    productos: ProductoInventario[],
    fechaGeneracion: Date,
  ) {
    const hoy = new Date();
    const diasAlerta = 30;

    const proximosAVencer = productos.filter((p) => {
      const diasRestantes = Math.ceil(
        (p.fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
      );
      return diasRestantes <= diasAlerta && diasRestantes >= 0;
    });

    const stockBajo = productos.filter((p) => p.stock <= p.stockMinimo);

    res.write(`=========================================\n`);
    res.write(`    BREAZE & HAROLD VETERINARY SYSTEM    \n`);
    res.write(`         Nit: 123.456.789-0              \n`);
    res.write(`         Manizales, Caldas               \n`);
    res.write(`=========================================\n`);
    res.write(`  REPORTE DE INVENTARIO ACTUAL           \n`);
    res.write(`  Generado: ${fechaGeneracion.toLocaleString('es-CO')}\n`);
    res.write(`=========================================\n\n`);

    // Alertas destacadas al inicio
    if (stockBajo.length > 0 || proximosAVencer.length > 0) {
      res.write(`*** ALERTAS ***\n`);
      res.write(`-----------------------------------------\n`);
      if (stockBajo.length > 0) {
        res.write(`[!] Productos con stock bajo (${stockBajo.length}):\n`);
        stockBajo.forEach((p) => {
          res.write(`    - ${p.nombre} | Stock actual: ${p.stock} | Minimo: ${p.stockMinimo}\n`);
        });
        res.write(`\n`);
      }
      if (proximosAVencer.length > 0) {
        res.write(`[!] Productos proximos a vencer en ${diasAlerta} dias (${proximosAVencer.length}):\n`);
        proximosAVencer.forEach((p) => {
          const diasRestantes = Math.ceil(
            (p.fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
          );
          res.write(
            `    - ${p.nombre} | Vence: ${p.fechaVencimiento.toLocaleDateString('es-CO')} | Dias restantes: ${diasRestantes}\n`,
          );
        });
        res.write(`\n`);
      }
      res.write(`=========================================\n\n`);
    }

    // Listado completo
    res.write(`INVENTARIO COMPLETO (${productos.length} productos)\n`);
    res.write(`-----------------------------------------\n`);

    const tipos = ['MEDICAMENTO', 'VACUNA', 'INSUMO_QUIRURGICO'];
    const etiquetas: Record<string, string> = {
      MEDICAMENTO: 'MEDICAMENTOS',
      VACUNA: 'VACUNAS',
      INSUMO_QUIRURGICO: 'INSUMOS QUIRURGICOS',
    };

    tipos.forEach((tipo) => {
      const grupo = productos.filter((p) => p.tipo === tipo);
      if (grupo.length === 0) return;

      res.write(`\n[ ${etiquetas[tipo]} ]\n`);

      grupo.forEach((p) => {
        const alertaStock = p.stock <= p.stockMinimo ? ' <<STOCK BAJO>>' : '';
        const diasRestantes = Math.ceil(
          (p.fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
        );
        const alertaVencimiento = diasRestantes <= diasAlerta ? ` <<PROXIMO A VENCER: ${diasRestantes} dias>>` : '';

        res.write(`  Nombre    : ${p.nombre}${alertaStock}${alertaVencimiento}\n`);
        res.write(`  Stock     : ${p.stock} (minimo: ${p.stockMinimo})\n`);
        res.write(`  Precio    : $${p.precio.toLocaleString('es-CO')}\n`);
        res.write(`  Vencimiento: ${p.fechaVencimiento.toLocaleDateString('es-CO')}\n`);
        res.write(`  ..........\n`);
      });
    });

    res.write(`\n=========================================\n`);
    res.write(`  Total productos activos: ${productos.length}\n`);
    res.write(`  Con stock bajo        : ${stockBajo.length}\n`);
    res.write(`  Proximos a vencer     : ${proximosAVencer.length}\n`);
    res.write(`=========================================\n`);

    res.end();
  }
}

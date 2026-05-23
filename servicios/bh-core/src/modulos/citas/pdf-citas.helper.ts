import { Response } from 'express';

interface CitaReporte {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
  cliente: string;
  mascota: string;
  veterinario: string;
}

export class PdfCitasHelper {

  /**
   * Genera y escribe el reporte de citas por periodo directamente sobre la respuesta HTTP.
   * Sigue el mismo patron que PdfFacturacionHelper del proyecto.
   */
  static generarReporteCitasPdf(
      res: Response,
      citas: CitaReporte[],
      fechaDesde: string,
      fechaHasta: string,
      fechaGeneracion: Date,
  ) {
    const totales = {
      CONFIRMADA: citas.filter((c) => c.estado === 'CONFIRMADA').length,
      FINALIZADA: citas.filter((c) => c.estado === 'FINALIZADA').length,
      CANCELADA: citas.filter((c) => c.estado === 'CANCELADA').length,
    };

    res.write(`=========================================\n`);
    res.write(`    BREAZE & HAROLD VETERINARY SYSTEM    \n`);
    res.write(`         Nit: 123.456.789-0              \n`);
    res.write(`         Manizales, Caldas               \n`);
    res.write(`=========================================\n`);
    res.write(`  REPORTE DE CITAS POR PERIODO           \n`);
    res.write(`  Periodo : ${fechaDesde} a ${fechaHasta}\n`);
    res.write(`  Generado: ${fechaGeneracion.toLocaleString('es-CO')}\n`);
    res.write(`=========================================\n\n`);

    res.write(`RESUMEN\n`);
    res.write(`-----------------------------------------\n`);
    res.write(`  Total citas    : ${citas.length}\n`);
    res.write(`  Confirmadas    : ${totales.CONFIRMADA}\n`);
    res.write(`  Finalizadas    : ${totales.FINALIZADA}\n`);
    res.write(`  Canceladas     : ${totales.CANCELADA}\n`);
    res.write(`\n=========================================\n\n`);

    res.write(`DETALLE DE CITAS\n`);
    res.write(`-----------------------------------------\n`);

    if (citas.length === 0) {
      res.write(`  No hay citas registradas en este periodo.\n`);
    }

    citas.forEach((cita, index) => {
      res.write(`\n  #${index + 1}\n`);
      res.write(`  Fecha       : ${cita.fecha} ${cita.hora}\n`);
      res.write(`  Cliente     : ${cita.cliente}\n`);
      res.write(`  Mascota     : ${cita.mascota}\n`);
      res.write(`  Veterinario : ${cita.veterinario}\n`);
      res.write(`  Estado      : ${cita.estado}\n`);
      res.write(`  ..........\n`);
    });

    res.write(`\n=========================================\n`);
    res.write(`  Fin del reporte\n`);
    res.write(`=========================================\n`);

    res.end();
  }
}
const PDFDocument = require('pdfkit');
import { Response } from 'express';

/**
 * Helper encargado de generar el PDF de trazabilidad.
 *
 * @class PdfTrazabilidadHelper
 */
export class PdfTrazabilidadHelper {

  /**
   * Escribe en la respuesta HTTP el reporte PDF de trazabilidad.
   *
   * @param res Respuesta HTTP donde se envia el archivo.
   * @param acciones Acciones de auditoria incluidas en el reporte.
   * @param fechaInicio Fecha inicial del periodo.
   * @param fechaFin Fecha final del periodo.
   * @returns No retorna valor; finaliza el stream del PDF.
   */
  static generarReporteTrazabilidadPdf(
    res: Response,
    acciones: any[],
    fechaInicio: string,
    fechaFin: string,
  ) {

    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
    });

    doc.pipe(res);

    doc.fontSize(18);
    doc.text('B&H Veterinary System', {
      align: 'center',
    });

    doc.moveDown();

    doc.fontSize(14);
    doc.text('Reporte de Trazabilidad');

    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Fecha inicio: ${fechaInicio}`);
    doc.text(`Fecha fin: ${fechaFin}`);

    doc.moveDown();

    doc.text('====================================');

    acciones.forEach((accion, index) => {

      doc.moveDown();

      doc.text(`Registro #${index + 1}`);

      doc.text(`Usuario: ${accion.usuario}`);
      doc.text(`Accion: ${accion.accion}`);
      doc.text(`Modulo: ${accion.modulo}`);
      doc.text(`Fecha: ${accion.fecha}`);

      doc.text('--------------------------------');
    });

    doc.end();
  }
}

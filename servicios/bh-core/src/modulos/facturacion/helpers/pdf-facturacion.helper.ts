import { Response } from 'express';
import PDFDocument from 'pdfkit';

export class PdfFacturaHelper {
    static generarFacturaPdf(res: Response, factura: any): void {
        const doc = new PDFDocument({ margin: 50 });

        doc.pipe(res);

        doc
            .fontSize(18)
            .font('Helvetica-Bold')
            .text('B&H Veterinary System', { align: 'center' });

        doc
            .fontSize(10)
            .font('Helvetica')
            .text('Nit: 123.456.789-0 | Manizales, Caldas', { align: 'center' });

        doc
            .moveDown()
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke()
            .moveDown();

        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('FACTURA DE VENTA');

        doc
            .font('Helvetica')
            .fontSize(11)
            .text(`Número:        ${factura.id}`)
            .text(`Atención:      ${factura.atencionId}`)
            .text(`Método de pago: ${factura.metodoPago}`)
            .text(`Estado:        ${factura.estado}`)
            .text(`Descuento:     $${factura.descuento.toLocaleString('es-CO')}`)
            .moveDown();

        doc
            .fontSize(13)
            .font('Helvetica-Bold')
            .text(`TOTAL: $${factura.totalFacturado.toLocaleString('es-CO')}`);

        doc.end();
    }
}

export class PdfReporteHelper {
    static generarReportePeriodoPdf(
        res: Response,
        facturas: any[],
        inicio: string,
        fin: string,
    ): void {
        const doc = new PDFDocument({ margin: 50 });

        doc.pipe(res);

        doc
            .fontSize(18)
            .font('Helvetica-Bold')
            .text('B&H Veterinary System', { align: 'center' });

        doc
            .fontSize(10)
            .font('Helvetica')
            .text('Reporte institucional de facturación', { align: 'center' });

        doc
            .fontSize(9)
            .text(`Periodo: ${inicio} — ${fin}`, { align: 'center' });

        doc
            .moveDown()
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke()
            .moveDown();

        let granTotal = 0;
        let totalDescuentos = 0;

        if (facturas.length === 0) {
            doc
                .fontSize(11)
                .font('Helvetica')
                .text('No hay facturas en el periodo indicado.', { align: 'center' });
        } else {
            facturas.forEach((f) => {
                doc
                    .fontSize(10)
                    .font('Helvetica')
                    .text(
                        `• Factura ${f.id} | ${f.estado} | $${f.totalFacturado.toLocaleString('es-CO')}`,
                    );

                if (f.estado === 'EMITIDA') {
                    granTotal += f.totalFacturado;
                    totalDescuentos += f.descuento;
                }
            });
        }

        doc
            .moveDown()
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke()
            .moveDown();

        doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .text(`Total descuentos otorgados: $${totalDescuentos.toLocaleString('es-CO')}`)
            .text(`Total neto facturado:       $${granTotal.toLocaleString('es-CO')}`);

        doc.end();
    }
}
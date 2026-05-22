import { Response } from 'express';
// Nota: Si el equipo usa otra librería como pdfmake o jspdf la cambias,
// aquí te lo dejo estructurado conceptualmente con funciones nativas de escritura de flujo.
export class PdfFacturacionHelper {

    // SCRUM 51: Diseño limpio con el encabezado oficial B&H
    static generarFacturaPdf(res: Response, facturaData: any) {
        // Aquí el backend escribe el binario directamente a la respuesta express
        res.write(`=========================================\n`);
        res.write(`         B&H AUDIT & SERVICES            \n`);
        res.write(`   Nit: 123.456.789-0 - Manizales, Caldas\n`);
        res.write(`=========================================\n\n`);
        res.write(`FACTURA DE VENTA: ${facturaData.id}\n`);
        res.write(`Atención Asociada: ${facturaData.atencionId}\n`);
        res.write(`Estado: ${facturaData.estado}\n`);
        res.write(`Descuento Aplicado: $${facturaData.descuento}\n`);
        res.write(`TOTAL FACTURADO: $${facturaData.totalFacturado}\n`);
        res.end();
    }

    // SCRUM 54: Reporte resumido por periodo
    static generarReportePeriodoPdf(res: Response, facturas: any[], inicio: string, fin: string) {
        res.write(`=========================================\n`);
        res.write(`  REPORTE INSTITUCIONAL DE FACTURACION   \n`);
        res.write(`    Periodo: ${inicio} a ${fin}          \n`);
        res.write(`=========================================\n\n`);

        let granTotal = 0;
        let totalDescuentos = 0;

        facturas.forEach(f => {
            res.write(`Factura: ${f.id} | Estado: ${f.estado} | Total: $${f.totalFacturado}\n`);
            if (f.estado === 'EMITIDA') {
                granTotal += f.totalFacturado;
                totalDescuentos += f.descuento;
            }
        });

        res.write(`\n-----------------------------------------\n`);
        res.write(`RESUMEN FINANCIERO:\n`);
        res.write(`Total Descuentos Otorgados: $${totalDescuentos}\n`);
        res.write(`Total Neto Facturado: $${granTotal}\n`);
        res.end();
    }
}
// servicios/bh-core/src/modulos/citas/helpers/pdf-reporte-citas.helper.ts

import { Response } from 'express';
import PDFDocument from 'pdfkit';

export class PdfReporteCitasHelper {
    /**
     * Genera el PDF del reporte de citas por período y lo escribe directamente
     * en el Response de Express (streaming).
     *
     * @param res      - Objeto Response de Express
     * @param citas    - Lista de citas con sus relaciones incluidas
     * @param inicio   - Fecha inicio del período (string YYYY-MM-DD)
     * @param fin      - Fecha fin del período (string YYYY-MM-DD)
     */
    static generarReporteCitasPdf(
        res: Response,
        citas: any[],
        inicio: string,
        fin: string,
    ): void {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        doc.pipe(res);

        // ── Encabezado oficial B&H ────────────────────────────────────────────────
        doc
            .fontSize(18)
            .font('Helvetica-Bold')
            .text('Breaze & Harold Veterinary System', { align: 'center' });

        doc
            .fontSize(10)
            .font('Helvetica')
            .text('NIT: 123.456.789-0  |  Manizales, Caldas, Colombia', {
                align: 'center',
            });

        doc.moveDown(0.5);

        doc
            .fontSize(13)
            .font('Helvetica-Bold')
            .text('REPORTE DE CITAS POR PERÍODO', { align: 'center' });

        doc
            .fontSize(9)
            .font('Helvetica')
            .text(`Período: ${inicio}  —  ${fin}`, { align: 'center' })
            .text(
                `Generado el: ${new Date().toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })}`,
                { align: 'center' },
            );

        doc
            .moveDown()
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .lineWidth(1)
            .stroke()
            .moveDown(0.5);

        // ── Resumen ───────────────────────────────────────────────────────────────
        const totales = {
            AGENDADA: 0,
            FINALIZADA: 0,
            CANCELADA: 0,
        };
        citas.forEach((c) => {
            if (totales[c.estado] !== undefined) totales[c.estado]++;
        });

        doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(`Total de citas en el período: ${citas.length}`, { continued: false });

        doc
            .font('Helvetica')
            .fontSize(9)
            .text(
                `  Agendadas: ${totales.AGENDADA}   |   Finalizadas: ${totales.FINALIZADA}   |   Canceladas: ${totales.CANCELADA}`,
            );

        doc
            .moveDown(0.5)
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .lineWidth(0.5)
            .stroke()
            .moveDown(0.5);

        // ── Tabla de citas ────────────────────────────────────────────────────────
        if (citas.length === 0) {
            doc
                .fontSize(11)
                .font('Helvetica')
                .fillColor('#555555')
                .text('No se encontraron citas en el período indicado.', {
                    align: 'center',
                });
        } else {
            // Encabezados de columna
            const colX = {
                fecha: 50,
                cliente: 140,
                mascota: 260,
                veterinario: 360,
                estado: 470,
            };

            doc
                .fontSize(9)
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text('Fecha / Hora', colX.fecha, doc.y, { width: 85 })
                .text('Cliente', colX.cliente, doc.y - doc.currentLineHeight(), { width: 115 })
                .text('Mascota', colX.mascota, doc.y - doc.currentLineHeight(), { width: 95 })
                .text('Veterinario', colX.veterinario, doc.y - doc.currentLineHeight(), { width: 105 })
                .text('Estado', colX.estado, doc.y - doc.currentLineHeight(), { width: 75 });

            doc
                .moveDown(0.3)
                .moveTo(50, doc.y)
                .lineTo(545, doc.y)
                .lineWidth(0.5)
                .stroke()
                .moveDown(0.3);

            // Filas
            citas.forEach((cita, index) => {
                // Salto de página automático si no hay espacio
                if (doc.y > 750) {
                    doc.addPage();
                    doc
                        .fontSize(8)
                        .font('Helvetica')
                        .fillColor('#888888')
                        .text('(continúa)', { align: 'right' });
                    doc.fillColor('#000000').moveDown(0.5);
                }

                const fechaHora = new Date(cita.fechaHora);
                const fechaStr = fechaHora.toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
                const horaStr = fechaHora.toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit',
                });

                const clienteNombre = cita.cliente
                    ? `${cita.cliente.nombre} ${cita.cliente.apellido}`
                    : '—';

                const mascotaNombre = cita.mascota?.nombre ?? '—';
                const veterinarioNombre = cita.veterinario?.nombreCompleto ?? '—';

                // Color de fondo alternado
                const fillColor = index % 2 === 0 ? '#FFFFFF' : '#F7F7F7';
                doc
                    .rect(50, doc.y - 2, 495, 18)
                    .fill(fillColor)
                    .fillColor('#000000');

                const rowY = doc.y;

                doc
                    .fontSize(8)
                    .font('Helvetica')
                    .text(`${fechaStr}`, colX.fecha, rowY, { width: 50 })
                    .text(horaStr, colX.fecha + 52, rowY, { width: 33 })
                    .text(clienteNombre, colX.cliente, rowY, { width: 115 })
                    .text(mascotaNombre, colX.mascota, rowY, { width: 95 })
                    .text(veterinarioNombre, colX.veterinario, rowY, { width: 105 });

                // Estado con color
                const estadoColor =
                    cita.estado === 'FINALIZADA'
                        ? '#1a7a1a'
                        : cita.estado === 'CANCELADA'
                            ? '#b30000'
                            : '#1a4fb3';

                doc
                    .fillColor(estadoColor)
                    .font('Helvetica-Bold')
                    .fontSize(8)
                    .text(cita.estado, colX.estado, rowY, { width: 75 });

                doc.fillColor('#000000').moveDown(0.6);
            });
        }

        // ── Pie de página ─────────────────────────────────────────────────────────
        doc
            .moveDown()
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .lineWidth(0.5)
            .stroke()
            .moveDown(0.3);

        doc
            .fontSize(8)
            .font('Helvetica')
            .fillColor('#777777')
            .text(
                'Este reporte es de uso interno exclusivo de Breaze & Harold Veterinary System.',
                { align: 'center' },
            );

        doc.end();
    }
}
/**
 * Estados disponibles para una factura.
 *
 * @enum EstadoFactura
 */
export enum EstadoFactura {
    EMITIDA = 'EMITIDA',
    ANULADA = 'ANULADA',
}

/**
 * Contrato de datos de una factura.
 *
 * @interface Factura
 */
export interface Factura {
    id: string;
    atencionId: string;
    totalFacturado: number;
    descuento: number;
    metodoPago?: string | null;
    estado: EstadoFactura;
    motivoAnulacion?: string | null;
    creadoEn: Date;
    actualizadoEn: Date;
}

export enum EstadoFactura {
    EMITIDA = 'EMITIDA',
    ANULADA = 'ANULADA',
}

export interface Factura {
    id: string;
    atencionId: string;
    totalFacturado: number;
    descuento: number;
    estado: EstadoFactura;
    motivoAnulacion?: string | null;
    creadoEn: Date;
    actualizadoEn: Date;
}
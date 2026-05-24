import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export enum TipoAccionAudit {
    CREACION_FACTURA  = 'CREACION_FACTURA',
    ANULACION_FACTURA = 'ANULACION_FACTURA',
}

export interface RegistrarEventoDto {
    tipoAccion:    TipoAccionAudit;
    nombreUsuario: string;
    rolUsuario:    string;
    detalle?:      string;
    entidadId?:    string;
    entidadTipo?:  string;
}

@Injectable()
export class AuditService {
    private readonly logger  = new Logger(AuditService.name);
    private readonly auditUrl = process.env.BH_AUDIT_URL ?? 'http://bh-audit-service/api/v1';

    constructor(private readonly httpService: HttpService) {}

    async registrarEvento(dto: RegistrarEventoDto): Promise<void> {
        try {
            await firstValueFrom(
                this.httpService.post(`${this.auditUrl}/audit/events`, dto),
            );
        } catch (error) {
            // Fire-and-forget: si bh-audit falla, bh-core sigue operando
            this.logger.warn(`bh-audit no disponible: ${error.message}`);
        }
    }
}
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Acciones relevantes que bh-core debe notificar a bh-audit.
 *
 * @enum TipoAccionAudit
 */
export enum TipoAccionAudit {
  REGISTRO_USUARIO = 'REGISTRO_USUARIO',
  VERIFICACION_CORREO = 'VERIFICACION_CORREO',
  APROBACION_CUENTA = 'APROBACION_CUENTA',
  RECHAZO_CUENTA = 'RECHAZO_CUENTA',
  LOGIN_EXITOSO = 'LOGIN_EXITOSO',
  LOGIN_FALLIDO = 'LOGIN_FALLIDO',
  CREACION_CITA = 'CREACION_CITA',
  CAMBIO_ESTADO_CITA = 'CAMBIO_ESTADO_CITA',
  PAGO_CITA = 'PAGO_CITA',
  CREACION_HISTORIAL = 'CREACION_HISTORIAL',
  EDICION_HISTORIAL = 'EDICION_HISTORIAL',
  REGISTRO_VACUNA = 'REGISTRO_VACUNA',
  INICIO_HOSPITALIZACION = 'INICIO_HOSPITALIZACION',
  ALTA_HOSPITALIZACION = 'ALTA_HOSPITALIZACION',
  CREACION_FACTURA = 'CREACION_FACTURA',
  ANULACION_FACTURA = 'ANULACION_FACTURA',
  AJUSTE_INVENTARIO = 'AJUSTE_INVENTARIO',
  CREACION_SERVICIO = 'CREACION_SERVICIO',
  EDICION_SERVICIO = 'EDICION_SERVICIO',
  DESACTIVACION_SERVICIO = 'DESACTIVACION_SERVICIO',
  SUSPENSION_USUARIO = 'SUSPENSION_USUARIO',
}

/**
 * DTO interno para registrar eventos desde bh-core.
 *
 * @interface RegistrarEventoDto
 */
export interface RegistrarEventoDto {
  tipoAccion: TipoAccionAudit;

  usuarioId?: string;
  nombreUsuario?: string;

  /**
   * Se mantiene rolUsuario para no romper código existente.
   */
  rolUsuario?: string;

  /**
   * También se permite rol por si algún módulo ya lo maneja así.
   */
  rol?: string;

  /**
   * Se mantiene detalle para no romper código existente.
   */
  detalle?: string;

  /**
   * También se permite descripcion para adaptarse al contrato de bh-audit.
   */
  descripcion?: string;

  entidadId?: string;
  entidadTipo?: string;

  metadata?: Record<string, unknown>;
}

/**
 * Servicio encargado de notificar acciones relevantes al microservicio bh-audit.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  private readonly auditUrl =
    process.env.BH_AUDIT_URL ?? 'http://bh-audit-service/api/v1';

  private readonly internalKey =
    process.env.BH_AUDIT_INTERNAL_KEY ?? '';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Envia un evento de auditoria al microservicio bh-audit.
   *
   * Construye un payload compatible con los campos usados por bh-core
   * y falla de forma controlada para no interrumpir la operacion principal.
   *
   * @param dto Datos del evento que debe enviarse a auditoria.
   * @returns Promesa sin valor cuando termina el intento de envio.
   */
  async registrarEvento(dto: RegistrarEventoDto): Promise<void> {
    const payload = {
      usuarioId: dto.usuarioId,
      nombreUsuario: dto.nombreUsuario ?? 'Sistema',
      rol: dto.rol ?? dto.rolUsuario ?? 'SISTEMA',
      tipoAccion: dto.tipoAccion,
      descripcion:
        dto.descripcion ??
        dto.detalle ??
        `Evento registrado: ${dto.tipoAccion}`,
      fechaHora: new Date().toISOString(),
      metadata: {
        ...dto.metadata,
        entidadId: dto.entidadId,
        entidadTipo: dto.entidadTipo,
      },
    };

    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.auditUrl}/eventos`,
          payload,
          {
            headers: {
              'X-Internal-Service-Key': this.internalKey,
            },
          },
        ),
      );
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido';

      /**
       * Fire-and-forget:
       * si bh-audit falla, bh-core debe seguir operando normalmente.
       */
      this.logger.warn(`bh-audit no disponible: ${mensaje}`);
    }
  }
}

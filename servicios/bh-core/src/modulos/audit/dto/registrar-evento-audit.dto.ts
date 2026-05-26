/**
 * Tipos de acciones que bh-core puede enviar al servicio de auditoria.
 *
 * @typedef TipoAccionAudit
 */
export type TipoAccionAudit =
  | 'REGISTRO_USUARIO'
  | 'VERIFICACION_CORREO'
  | 'APROBACION_CUENTA'
  | 'RECHAZO_CUENTA'
  | 'LOGIN_EXITOSO'
  | 'LOGIN_FALLIDO'
  | 'CREACION_CITA'
  | 'CAMBIO_ESTADO_CITA'
  | 'PAGO_CITA'
  | 'CREACION_HISTORIAL'
  | 'EDICION_HISTORIAL'
  | 'REGISTRO_VACUNA'
  | 'INICIO_HOSPITALIZACION'
  | 'ALTA_HOSPITALIZACION'
  | 'CREACION_FACTURA'
  | 'ANULACION_FACTURA'
  | 'AJUSTE_INVENTARIO'
  | 'CREACION_SERVICIO'
  | 'EDICION_SERVICIO'
  | 'DESACTIVACION_SERVICIO'
  | 'SUSPENSION_USUARIO';

/**
 * Contrato para registrar eventos de auditoria desde bh-core.
 *
 * @interface RegistrarEventoAuditDto
 */
export interface RegistrarEventoAuditDto {
  usuarioId?: string;
  nombreUsuario?: string;
  rol?: string;
  tipoAccion: TipoAccionAudit;
  descripcion: string;
  fechaHora?: string;
  metadata?: Record<string, unknown>;
}

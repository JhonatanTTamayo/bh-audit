/**
 * Representa una accion de auditoria usada en reportes de trazabilidad.
 *
 * @interface AccionAuditoria
 */
export interface AccionAuditoria {
  usuario: string;
  rol: string;
  accion: string;
  fecha: Date;
}

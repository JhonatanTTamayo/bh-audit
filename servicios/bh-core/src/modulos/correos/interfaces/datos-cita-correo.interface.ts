/**
 * Datos necesarios para construir el correo de confirmación de cita.
 */
/**
 * @interface DatosCitaCorreo
 */
export interface DatosCitaCorreo {
  nombreCliente: string;
  nombreMascota: string;
  fecha: string;
  hora: string;
  nombreVeterinario?: string;
  direccion?: string;
}

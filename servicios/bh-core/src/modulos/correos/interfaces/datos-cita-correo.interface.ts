/**
 * Datos necesarios para construir el correo de confirmación de cita.
 */
export interface DatosCitaCorreo {
  nombreCliente: string;
  nombreMascota: string;
  fecha: string;
  hora: string;
  nombreVeterinario?: string;
  direccion?: string;
}
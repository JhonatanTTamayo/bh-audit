import { DatosCitaCorreo } from '../interfaces/datos-cita-correo.interface';

/**
 * Construye la plantilla HTML para el correo de confirmacion de cita.
 *
 * @param datos Datos principales de la cita agendada.
 * @returns Contenido HTML del correo.
 */
export function plantillaConfirmacionCita(datos: DatosCitaCorreo): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Confirmacion de cita</h2>

      <p>Hola ${datos.nombreCliente},</p>

      <p>Tu cita ha sido agendada correctamente.</p>

      <ul>
        <li><strong>Mascota:</strong> ${datos.nombreMascota}</li>
        <li><strong>Fecha:</strong> ${datos.fecha}</li>
        <li><strong>Hora:</strong> ${datos.hora}</li>
        ${
          datos.nombreVeterinario
            ? `<li><strong>Veterinario:</strong> ${datos.nombreVeterinario}</li>`
            : ''
        }
        ${
          datos.direccion
            ? `<li><strong>Direccion de la sede:</strong> ${datos.direccion}</li>`
            : ''
        }
      </ul>

      <p>Recuerda llegar con 10 minutos de anticipacion.</p>

      <p>Atentamente,<br/>Equipo Breaze & Harold Veterinary System</p>
    </div>
  `;
}

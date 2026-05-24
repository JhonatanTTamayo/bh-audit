import { DatosCitaCorreo } from '../interfaces/datos-cita-correo.interface';

/**
 * Construye la plantilla HTML para el correo de confirmación de cita.
 *
 * @param datos Datos principales de la cita agendada.
 * @returns Contenido HTML del correo.
 */
export function plantillaConfirmacionCita(datos: DatosCitaCorreo): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Confirmación de cita</h2>

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
            ? `<li><strong>Dirección:</strong> ${datos.direccion}</li>`
            : ''
        }
      </ul>

      <p>Te recomendamos llegar con unos minutos de anticipación.</p>

      <p>Atentamente,<br/>Equipo Blue Health</p>
    </div>
  `;
}
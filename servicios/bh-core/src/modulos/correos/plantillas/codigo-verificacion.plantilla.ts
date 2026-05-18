/**
 * Construye la plantilla HTML para el correo de verificación de cuenta.
 *
 * @param nombreUsuario Nombre del usuario que recibirá el correo.
 * @param codigo Código de verificación generado por el sistema.
 * @returns Contenido HTML del correo.
 */
export function plantillaCodigoVerificacion(
  nombreUsuario: string,
  codigo: string,
): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Verificación de cuenta</h2>

      <p>Hola ${nombreUsuario},</p>

      <p>
        Gracias por registrarte en Blue Health. Para completar tu registro,
        utiliza el siguiente código de verificación:
      </p>

      <h1 style="letter-spacing: 4px;">${codigo}</h1>

      <p>
        Este código tiene un tiempo limitado de validez. Si no solicitaste
        este registro, puedes ignorar este mensaje.
      </p>

      <p>Atentamente,<br/>Equipo Blue Health</p>
    </div>
  `;
}
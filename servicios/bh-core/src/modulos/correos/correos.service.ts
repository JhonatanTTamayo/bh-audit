import {Injectable,InternalServerErrorException,Logger,} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { DatosCitaCorreo } from './interfaces/datos-cita-correo.interface';
import { plantillaCodigoVerificacion } from './plantillas/codigo-verificacion.plantilla';
import { plantillaConfirmacionCita } from './plantillas/confirmacion-cita.plantilla';

/**
 * Servicio encargado de centralizar el envío de correos electrónicos
 * del microservicio bh-core.
 *
 * Este servicio utiliza Nodemailer y una configuración SMTP definida
 * mediante variables de entorno.
 */
@Injectable()
export class CorreosService {
  private readonly logger = new Logger(CorreosService.name);
  private readonly transporter: Transporter;
  private readonly remitente: string;

  /**
   * Inicializa el servicio de correos.
   *
   * Lee la configuración SMTP desde las variables de entorno:
   * - MAIL_HOST
   * - MAIL_PORT
   * - MAIL_USER
   * - MAIL_PASS
   * - MAIL_FROM
   *
   * Si falta alguna variable obligatoria, lanza una excepción.
   *
   * @param configService Servicio de configuración de NestJS.
   */

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = Number(this.configService.get<string>('MAIL_PORT') ?? 587);
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');
    const from = this.configService.get<string>('MAIL_FROM');

    if (!host || !port || !user || !pass || !from) {
      throw new InternalServerErrorException(
        'La configuración SMTP está incompleta.',
      );
    }

    this.remitente = from;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    this.transporter.verify((error) => {
      if (error) {
        this.logger.error(
          'Error verificando conexión SMTP:',
          error instanceof Error ? error.stack : String(error),
        );
      } else {
        this.logger.log('Servidor SMTP listo para enviar correos.');
      }
    });
  }

   /**
   * Envía un código de verificación al correo del usuario registrado.
   *
   * Este método se utiliza durante el proceso de registro de usuario.
   *
   * @param destinatario Correo electrónico del usuario.
   * @param nombreUsuario Nombre completo del usuario.
   * @param codigo Código de verificación generado por el sistema.
   */
  async enviarCodigoVerificacion(
    destinatario: string,
    nombreUsuario: string,
    codigo: string,
  ): Promise<void> {
    const html = plantillaCodigoVerificacion(nombreUsuario, codigo);

    await this.enviarCorreo(
      destinatario,
      'Código de verificación de cuenta',
      html,
    );
  }

   /**
   * Envía un correo de confirmación cuando una cita es agendada.
   *
   * @param destinatario Correo electrónico del usuario.
   * @param datos Información de la cita agendada.
   */
  async enviarConfirmacionCita(
    destinatario: string,
    datos: DatosCitaCorreo,
  ): Promise<void> {
    const html = plantillaConfirmacionCita(datos);

    await this.enviarCorreo(
      destinatario,
      'Confirmación de cita agendada',
      html,
    );
  }

  /**
   * Método privado reutilizable para enviar correos electrónicos.
   *
   * Centraliza el envío para evitar repetir lógica en cada tipo de correo.
   *
   * @param destinatario Correo electrónico del destinatario.
   * @param asunto Asunto del correo.
   * @param html Contenido HTML del correo.
   */
  private async enviarCorreo(
    destinatario: string,
    asunto: string,
    html: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.remitente,
        to: destinatario,
        subject: asunto,
        html,
      });

      this.logger.log(`Correo enviado correctamente a ${destinatario}`);
    } catch (error) {
      this.logger.error(
        'Error real al enviar correo electrónico:',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No fue posible enviar el correo electrónico.',
      );
    }
  }
}
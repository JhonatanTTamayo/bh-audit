import {ConflictException,Injectable,NotFoundException,BadRequestException} from '@nestjs/common';
import { EstadoUsuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { VerificarCorreoDto}  from './dto/verificar-correo.dto';
import { PrismaService } from '../../basedatos/prisma.service';
import { CorreosService } from '../correos/correos.service';
import { RegistroUsuarioDto } from './dto/registro-usuario.dto';

/**
 * Servicio encargado de manejar los procesos de autenticación.
 */
@Injectable()
export class AutenticacionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly correosService: CorreosService,
  ) {}

  /**
   * Registra un nuevo usuario y envía un código de verificación
   * al correo electrónico registrado.
   */
  async registrar(registroDto: RegistroUsuarioDto) {
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: {
        correo: registroDto.correo,
      },
    });

    if (usuarioExistente) {
      throw new ConflictException('El correo ya está registrado.');
    }

    const rol = await this.prisma.rol.findUnique({
      where: {
        id: registroDto.rolId,
      },
    });

    if (!rol) {
      throw new NotFoundException('El rol seleccionado no existe.');
    }

    const contrasenaHash = await bcrypt.hash(registroDto.contrasena, 10);
    const codigoVerificacion = this.generarCodigoVerificacion();
    const expiraEn = this.generarFechaExpiracionCodigo();

    const usuario = await this.prisma.usuario.create({
      data: {
        nombreCompleto: registroDto.nombreCompleto,
        correo: registroDto.correo,
        telefono: registroDto.telefono,
        contrasenaHash,
        estado: EstadoUsuario.PENDIENTE_VERIFICACION,
        correoVerificado: false,
        rolId: registroDto.rolId,
        codigosVerificacion: {
          create: {
            codigo: codigoVerificacion,
            expiraEn,
          },
        },
      },
      include: {
        rol: true,
      },
    });

    await this.correosService.enviarCodigoVerificacion(
      usuario.correo,
      usuario.nombreCompleto,
      codigoVerificacion,
    );

    return {
      mensaje:
        'Usuario registrado correctamente. Revisa tu correo para verificar la cuenta.',
      usuario: {
        id: usuario.id,
        nombreCompleto: usuario.nombreCompleto,
        correo: usuario.correo,
        telefono: usuario.telefono,
        rol: usuario.rol.nombre,
        estado: usuario.estado,
        correoVerificado: usuario.correoVerificado,
      },
    };
  }

  /**
   * Verifica el correo electrónico de un usuario mediante
   * el código enviado por correo.
   */
  async verificarCorreo(verificarCorreoDto: VerificarCorreoDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        correo: verificarCorreoDto.correo,
      },
      include: {
        codigosVerificacion: {
          where: {
            codigo: verificarCorreoDto.codigo,
          },
          orderBy: {
            creadoEn: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException('El usuario no existe.');
    }

    if (usuario.correoVerificado) {
      throw new ConflictException('El correo ya fue verificado.');
    }

    const codigoVerificacion = usuario.codigosVerificacion[0];

    if (!codigoVerificacion) {
      throw new BadRequestException('El código de verificación es inválido.');
    }

    const fechaActual = new Date();

    if (codigoVerificacion.expiraEn < fechaActual) {
      throw new BadRequestException('El código de verificación expiró.');
    }

    const usuarioActualizado = await this.prisma.usuario.update({
      where: {
        id: usuario.id,
      },
      data: {
        correoVerificado: true,
        estado: EstadoUsuario.ACTIVO,
      },
      include: {
        rol: true,
      },
    });

    await this.prisma.codigoVerificacion.deleteMany({
      where: {
        usuarioId: usuario.id,
      },
    });

    return {
      mensaje: 'Correo verificado correctamente.',
      usuario: {
        id: usuarioActualizado.id,
        nombreCompleto: usuarioActualizado.nombreCompleto,
        correo: usuarioActualizado.correo,
        telefono: usuarioActualizado.telefono,
        rol: usuarioActualizado.rol.nombre,
        estado: usuarioActualizado.estado,
        correoVerificado: usuarioActualizado.correoVerificado,
      },
    };
  }

  /**
   * Genera un código numérico de seis dígitos.
   */
  private generarCodigoVerificacion(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Genera la fecha de expiración del código.
   *
   * Actualmente el código expira en 15 minutos.
   */
  private generarFechaExpiracionCodigo(): Date {
    const minutosExpiracion = 15;
    const fechaExpiracion = new Date();

    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + minutosExpiracion);

    return fechaExpiracion;
  }
}
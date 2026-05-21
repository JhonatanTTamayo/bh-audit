import {ConflictException,Injectable,NotFoundException,BadRequestException,UnauthorizedException,ForbiddenException,} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EstadoUsuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { VerificarCorreoDto } from './dto/verificar-correo.dto';
import { PrismaService } from '../../basedatos/prisma.service';
import { CorreosService } from '../correos/correos.service';
import { RegistroUsuarioDto } from './dto/registro-usuario.dto';
import { LoginDto } from './dto/login-usuario.dto';

/**
 * Servicio encargado de manejar los procesos de autenticación.
 */
@Injectable()
export class AutenticacionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly correosService: CorreosService,
    private readonly jwtService: JwtService,
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

    // Validar que un usuario con rol admin no se registre
    if (rol.nombre === 'ADMIN') {
      throw new ForbiddenException('No está permitido registrar administradores desde este endpoint',);
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
   * Inicia sesión validando correo, contraseña, verificación y estado del usuario.
   */
  async iniciarSesion(loginDto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        correo: loginDto.correo,
      },
      include: {
        rol: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException({
        codigo: 'CREDENCIALES_INVALIDAS',
        mensaje: 'El correo o la contraseña son incorrectos.',
      });
    }

    const contrasenaValida = await bcrypt.compare(
      loginDto.contrasena,
      usuario.contrasenaHash,
    );

    if (!contrasenaValida) {
      throw new UnauthorizedException({
        codigo: 'CREDENCIALES_INVALIDAS',
        mensaje: 'El correo o la contraseña son incorrectos.',
      });
    }

    if (!usuario.correoVerificado) {
      throw new ForbiddenException({
        codigo: 'CORREO_NO_VERIFICADO',
        mensaje: 'Debes verificar tu correo electrónico antes de iniciar sesión.',
      });
    }

    if (usuario.estado !== EstadoUsuario.ACTIVO) {
      throw new ForbiddenException({
        codigo: 'USUARIO_INACTIVO',
        mensaje: 'El usuario no se encuentra activo.',
      });
    }

    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol.nombre,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
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
      rol: true,
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

  const estadoDespuesDeVerificar =
    usuario.rol.nombre === 'RECEPCIONISTA' || usuario.rol.nombre === 'VETERINARIO'
      ? EstadoUsuario.PENDIENTE_APROBACION
      : EstadoUsuario.ACTIVO;

  const usuarioActualizado = await this.prisma.usuario.update({
    where: {
      id: usuario.id,
    },
    data: {
      correoVerificado: true,
      estado: estadoDespuesDeVerificar,
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
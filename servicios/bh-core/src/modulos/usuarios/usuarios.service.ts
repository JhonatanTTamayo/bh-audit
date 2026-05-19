import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoUsuario } from '@prisma/client';

import { PrismaService } from '../../basedatos/prisma.service';

/**
 * Servicio encargado de gestionar operaciones administrativas
 * relacionadas con usuarios del sistema.
 */
@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista las cuentas de recepcionistas y veterinarios pendientes de aprobación.
   */
  async listarCuentasPendientesAprobacion() {
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        estado: EstadoUsuario.PENDIENTE_APROBACION,
        correoVerificado: true,
        rol: {
          nombre: {
            in: ['RECEPCIONISTA', 'VETERINARIO'],
          },
        },
      },
      include: {
        rol: true,
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });

    return usuarios.map((usuario) => this.formatearUsuario(usuario));
  }

  /**
   * Aprueba una cuenta pendiente de aprobación administrativa.
   */
  async aprobarCuenta(usuarioId: string) {
    const usuario = await this.obtenerUsuarioInternoPendiente(usuarioId);

    const usuarioActualizado = await this.prisma.usuario.update({
      where: {
        id: usuario.id,
      },
      data: {
        estado: EstadoUsuario.ACTIVO,
      },
      include: {
        rol: true,
      },
    });

    return {
      mensaje: 'Cuenta aprobada correctamente.',
      usuario: this.formatearUsuario(usuarioActualizado),
    };
  }

  /**
   * Rechaza una cuenta pendiente de aprobación administrativa.
   */
  async rechazarCuenta(usuarioId: string) {
    const usuario = await this.obtenerUsuarioInternoPendiente(usuarioId);

    const usuarioActualizado = await this.prisma.usuario.update({
      where: {
        id: usuario.id,
      },
      data: {
        estado: EstadoUsuario.RECHAZADO,
      },
      include: {
        rol: true,
      },
    });

    return {
      mensaje: 'Cuenta rechazada correctamente.',
      usuario: this.formatearUsuario(usuarioActualizado),
    };
  }

  /**
   * Obtiene y valida que el usuario exista, tenga rol interno,
   * correo verificado y estado pendiente de aprobación.
   */
  private async obtenerUsuarioInternoPendiente(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id: usuarioId,
      },
      include: {
        rol: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException({
        codigo: 'CUENTA_NO_ENCONTRADA',
        mensaje: 'La cuenta solicitada no existe.',
      });
    }

    const esRolInterno = ['RECEPCIONISTA', 'VETERINARIO'].includes(
      usuario.rol.nombre,
    );

    if (!esRolInterno) {
      throw new BadRequestException({
        codigo: 'ROL_NO_REQUIERE_APROBACION',
        mensaje: 'La cuenta no pertenece a un rol que requiera aprobación.',
      });
    }

    if (!usuario.correoVerificado) {
      throw new BadRequestException({
        codigo: 'CORREO_NO_VERIFICADO',
        mensaje: 'La cuenta aún no ha verificado su correo electrónico.',
      });
    }

    if (usuario.estado !== EstadoUsuario.PENDIENTE_APROBACION) {
      throw new BadRequestException({
        codigo: 'CUENTA_NO_PENDIENTE',
        mensaje: 'La cuenta no se encuentra pendiente de aprobación.',
      });
    }

    return usuario;
  }

  /**
   * Formatea los datos básicos del usuario sin exponer información sensible.
   */
  private formatearUsuario(usuario: {
    id: string;
    nombreCompleto: string;
    correo: string;
    telefono: string | null;
    estado: EstadoUsuario;
    creadoEn: Date;
    rol: {
      nombre: string;
    };
  }) {
    return {
      id: usuario.id,
      nombreCompleto: usuario.nombreCompleto,
      correo: usuario.correo,
      telefono: usuario.telefono,
      rol: usuario.rol.nombre,
      estado: usuario.estado,
      creadoEn: usuario.creadoEn,
    };
  }
}
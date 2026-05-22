import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoUsuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../basedatos/prisma.service';
import { FiltroUsuariosDto } from './dto/filtro-usuarios.dto';
import { CreateAdminDto } from './dto/crear-admin.dto';
import { RechazarCuentaDto } from './dto/rechazar-cuenta.dto';

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
  async rechazarCuenta(usuarioId: string, rechazarCuentaDto:RechazarCuentaDto) {
    const usuario = await this.obtenerUsuarioInternoPendiente(usuarioId);

    const usuarioActualizado = await this.prisma.usuario.update({
      where: {
        id: usuario.id,
      },
      data: {
        estado: EstadoUsuario.RECHAZADO,
        motivoRechazo:
          rechazarCuentaDto.motivo,
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

  /**
 * Suspende una cuenta de usuario existente.
 */
async suspenderCuenta(usuarioId: string) {
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

  if (usuario.estado === EstadoUsuario.SUSPENDIDO) {
    throw new BadRequestException({
      codigo: 'CUENTA_YA_SUSPENDIDA',
      mensaje: 'La cuenta ya se encuentra suspendida.',
    });
  }

  const usuarioActualizado = await this.prisma.usuario.update({
    where: {
      id: usuario.id,
    },
    data: {
      estado: EstadoUsuario.SUSPENDIDO,
    },
    include: {
      rol: true,
    },
  });

  return {
    mensaje: 'Cuenta suspendida correctamente.',
    usuario: this.formatearUsuario(usuarioActualizado),
  };
} 
    
    /**
 * Lista usuarios registrados aplicando filtros opcionales por rol y estado.
 */
async listarUsuarios(filtros: FiltroUsuariosDto) {
  const page = filtros.page ?? 0;
  const size = filtros.size ?? 20;

  const where = {
    ...(filtros.estado && {
      estado: filtros.estado,
    }),
    ...(filtros.rol && {
      rol: {
        nombre: filtros.rol,
      },
    }),
  };

  const [usuarios, totalElements] = await Promise.all([
    this.prisma.usuario.findMany({
      where,
      include: {
        rol: true,
      },
      orderBy: {
        creadoEn: 'desc',
      },
      skip: page * size,
      take: size,
    }),
    this.prisma.usuario.count({
      where,
    }),
  ]);

  return {
    page,
    size,
    totalElements,
    totalPages: Math.ceil(totalElements / size),
    content: usuarios.map((usuario) => this.formatearUsuarioListado(usuario)),
  };
}

    /**
     * Formatea los datos básicos del usuario para el listado administrativo.
     */
    private formatearUsuarioListado(usuario: {
    id: string;
    nombreCompleto: string;
    correo: string;
    telefono: string | null;
    estado: EstadoUsuario;
    correoVerificado: boolean;
    creadoEn: Date;
    actualizadoEn: Date;
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
        correoVerificado: usuario.correoVerificado,
        creadoEn: usuario.creadoEn,
        actualizadoEn: usuario.actualizadoEn,
    };
    }

    
async crearAdministrador(createAdminDto: CreateAdminDto) {
  const usuarioExistente =
    await this.prisma.usuario.findUnique({
      where: {correo: createAdminDto.correo,
      },
    });

  if (usuarioExistente) {
    throw new ConflictException(
      'El correo ya está registrado.',
    );
  }

  const rolAdmin =
    await this.prisma.rol.findFirst({
      where: {nombre: 'ADMIN',},
    });

  if (!rolAdmin) {
    throw new NotFoundException(
      'El rol administrador no existe.',
    );
  }

  const contrasenaHash =
    await bcrypt.hash(
      createAdminDto.contrasena,
      10,
    );

  const usuario =
    await this.prisma.usuario.create({
      data: {
        nombreCompleto:
          createAdminDto.nombreCompleto,

        correo:
          createAdminDto.correo,

        telefono:
          createAdminDto.telefono,

        contrasenaHash,

        rolId: rolAdmin.id,

        correoVerificado:false,

        estado:
          EstadoUsuario.PENDIENTE_VERIFICACION,
      },

      include:{
        rol:true,
      },
    });

  return {
    mensaje:
      'Administrador creado correctamente.',

    usuario:{
      id:usuario.id,
      nombreCompleto:
        usuario.nombreCompleto,

      correo:
        usuario.correo,

      telefono:
        usuario.telefono,

      rol:
        usuario.rol.nombre,

      estado:
        usuario.estado,

      correoVerificado:
        usuario.correoVerificado,
    },
  };
}
    
}
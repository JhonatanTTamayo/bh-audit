import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { PrismaService } from '../../basedatos/prisma.service';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un cliente validando duplicados por correo o documento.
   *
   * Si existe un usuario con rol CLIENTE y el mismo correo, lo vincula
   * automaticamente al nuevo cliente.
   *
   * @param dto Datos del cliente.
   * @returns Cliente creado.
   */
  async crearCliente(dto: CrearClienteDto) {
    const clienteExistente = await this.prisma.cliente.findFirst({
      where: {
        OR: [{ email: dto.email }, { documento: dto.documento }],
      },
    });

    if (clienteExistente) {
      throw new ConflictException({
        codigo: 'CLIENTE_EXISTENTE',
        mensaje: 'Ya existe un cliente con ese correo o documento.',
      });
    }

    const usuarioCliente = await this.prisma.usuario.findFirst({
      where: {
        correo: dto.email,
        rol: {
          nombre: 'CLIENTE',
        },
        cliente: null,
      },
    });

    return this.prisma.cliente.create({
      data: {
        ...dto,
        usuarioId: usuarioCliente?.id,
      },
    });
  }

    /**
     * Lista todos los clientes ordenados desde el mas reciente.
     *
     * @returns Lista de clientes.
     */
    async listarClientes() {
        return this.prisma.cliente.findMany({
            orderBy: {
            creadoEn: 'desc',
            },
        });
    }

    /**
     * Actualiza un cliente validando que correo y documento no queden duplicados.
     *
     * @param clienteId Identificador del cliente.
     * @param dto Datos parciales a actualizar.
     * @returns Cliente actualizado con mensaje de confirmacion.
     */
    async actualizarCliente(clienteId: string,dto: ActualizarClienteDto) {
    const cliente = await this.prisma.cliente.findUnique({where: {id: clienteId,},
    });

    if (!cliente) {
        throw new NotFoundException({
        codigo: 'CLIENTE_NO_ENCONTRADO',
        mensaje: 'El cliente solicitado no existe.',
        });
    }

    // Validar correo duplicado
    if (dto.email) {
        const correoExistente =
        await this.prisma.cliente.findFirst({
            where: {
            email: dto.email,
            id: {
                not: clienteId,
            },
            },
        });

        if (correoExistente) {
        throw new ConflictException({
            codigo: 'CORREO_EN_USO',
            mensaje: 'Ya existe un cliente con ese correo.',
        });
        }
    }

    // Validar documento duplicado
    if (dto.documento) {
        const documentoExistente =
        await this.prisma.cliente.findFirst({
            where: {
            documento: dto.documento,
            id: {
                not: clienteId,
            },
            },
        });

        if (documentoExistente) {
        throw new ConflictException({
            codigo: 'DOCUMENTO_EN_USO',
            mensaje: 'Ya existe un cliente con ese documento.',
        });
        }
    }

    const clienteActualizado =
        await this.prisma.cliente.update({
        where: {
            id: clienteId,
        },
        data: dto,
        });

    return {
        mensaje: 'Cliente actualizado correctamente.',
        cliente: clienteActualizado,
    };
    }

    /**
     * Obtiene un cliente por ID y limita el acceso del rol CLIENTE a sus datos.
     *
     * @param clienteId Identificador del cliente.
     * @param usuario Usuario autenticado que solicita la informacion.
     * @returns Cliente encontrado.
     */
    async obtenerClientePorId(clienteId: string,usuario: any,) {
    const cliente = await this.prisma.cliente.findUnique({where: {id: clienteId,}
    });

    if (!cliente) {
        throw new NotFoundException({
        codigo: 'CLIENTE_NO_ENCONTRADO',
        mensaje: 'El cliente solicitado no existe.',
        });
    }

    // Si es cliente, solo puede consultar sus propios datos
    if (
        usuario.rol === 'CLIENTE' &&
        cliente.usuarioId !== usuario.sub
    ) {
        throw new ForbiddenException({
        codigo: 'ACCESO_DENEGADO',
        mensaje:
            'No tienes permiso para consultar la información de otro cliente.',
        });
    }

    return cliente;
    }
}

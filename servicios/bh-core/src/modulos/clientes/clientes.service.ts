import { ConflictException, Injectable } from '@nestjs/common';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { PrismaService } from '../../basedatos/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

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
}

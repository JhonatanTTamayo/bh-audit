import {Injectable,NotFoundException,} from '@nestjs/common';

import { PrismaService } from '../../basedatos/prisma.service';
import { CrearMascotaDto } from './dto/crear-mascota.dto';

@Injectable()
export class MascotasService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 
   * Registra una nueva mascota asociada a un cliente.
   *
   * Valida que el usuario exista y que tenga rol CLIENTE
   * antes de crear el registro de la mascota.
   * 
   */

  async crearMascota(clienteId: string, dto: CrearMascotaDto) {

    const cliente = await this.prisma.usuario.findUnique({
      where: {
        id: clienteId,
      },
      include: {
        rol: true,
      },
    });

    if (!cliente) {
      throw new NotFoundException({codigo: 'CLIENTE_NO_EXISTE',
        mensaje: 'El cliente no fue encontrado',
      });
    }

    if (cliente.rol.nombre !== 'CLIENTE') {
      throw new NotFoundException({
        codigo: 'USUARIO_NO_CLIENTE',
        mensaje: 'El usuario no es un cliente',
      });
    }

    const mascota = await this.prisma.mascota.create({
      data: {
        nombre: dto.nombre,
        especie: dto.especie,
        raza: dto.raza,
        edad: dto.edad,
        peso: dto.peso,
        clienteId,
      },
    });

    return mascota;
  }
}
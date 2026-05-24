import {Injectable,NotFoundException,} from '@nestjs/common';

import { PrismaService } from '../../basedatos/prisma.service';
import { CrearMascotaDto } from './dto/crear-mascota.dto';


@Injectable()
export class MascotasService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Registra una nueva mascota asociada a un cliente.
   *
   */

  async crearMascota(clienteId: string, dto: CrearMascotaDto) {
    const cliente = await this.prisma.cliente.findUnique({
        where: {
        id: clienteId,
        },
    });

    if (!cliente) {
        throw new NotFoundException({
        codigo: 'CLIENTE_NO_EXISTE',
        mensaje: 'El cliente no fue encontrado',
        });
    }

    const mascota = await this.prisma.mascota.create({
        data: {
        nombre: dto.nombre,
        especie: dto.especie,
        raza: dto.raza,
        color: dto.color,
        fechaNacimiento: new Date(dto.fechaNacimiento),
        peso: dto.peso,
        clienteId,
        },
    });

    return mascota;
    }
}
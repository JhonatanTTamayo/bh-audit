import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../basedatos/prisma.service';
import { JwtPayload } from '../autenticacion/interfaces/jwt-payload.interface';
import { CrearServicioDto } from './dto/crear-servicio.dto';
import { EditarServicioDto } from './dto/editar-servicio.dto';

/**
 * Servicio encargado de gestionar el catálogo de servicios de la clínica.
 *
 * Contiene la lógica de negocio para listar, crear, editar y desactivar servicios,
 * aplicando validaciones y reglas de negocio antes de interactuar con la base de datos.
 */
@Injectable()
export class ServiciosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista los servicios del catálogo.
   *
   * - ADMIN: ve todos los servicios, incluyendo los desactivados.
   * - Otros roles: solo ven los servicios activos.
   *
   * @param usuario Información del usuario autenticado (payload JWT).
   * @returns Lista de servicios formateados según el rol.
   */
  async listarServicios(usuario: JwtPayload) {
    const soloActivos = usuario.rol !== 'ADMIN';

    const servicios = await this.prisma.servicio.findMany({
      where: soloActivos ? { activo: true } : undefined,
      orderBy: { nombre: 'asc' },
    });

    return servicios.map((servicio) => this.formatearServicio(servicio));
  }

  /**
   * Crea un nuevo servicio en el catálogo.
   *
   * @param crearServicioDto DTO con los datos del servicio a crear.
   * @throws BadRequestException si ya existe un servicio con el mismo nombre.
   * @returns El servicio creado y formateado.
   */
  async crearServicio(crearServicioDto: CrearServicioDto) {
    const nombreExistente = await this.prisma.servicio.findFirst({
      where: { nombre: crearServicioDto.nombre },
    });

    if (nombreExistente) {
      throw new BadRequestException({
        codigo: 'SERVICIO_YA_EXISTE',
        mensaje: 'Ya existe un servicio con ese nombre.',
      });
    }

    const servicio = await this.prisma.servicio.create({
      data: {
        nombre: crearServicioDto.nombre,
        descripcion: crearServicioDto.descripcion,
        precio: crearServicioDto.precio,
      },
    });

    return this.formatearServicio(servicio);
  }

  /**
   * Edita el nombre, descripción o precio de un servicio existente.
   *
   * @param servicioId Identificador único del servicio.
   * @param editarServicioDto DTO con los campos a modificar.
   * @throws BadRequestException si el nuevo nombre ya existe en otro servicio.
   * @returns El servicio actualizado y formateado.
   */
  async editarServicio(servicioId: string, editarServicioDto: EditarServicioDto) {
    const servicio = await this.obtenerServicioPorId(servicioId);

    if (editarServicioDto.nombre && editarServicioDto.nombre !== servicio.nombre) {
      const nombreExistente = await this.prisma.servicio.findFirst({
        where: { nombre: editarServicioDto.nombre },
      });

      if (nombreExistente) {
        throw new BadRequestException({
          codigo: 'SERVICIO_YA_EXISTE',
          mensaje: 'Ya existe un servicio con ese nombre.',
        });
      }
    }

    const servicioActualizado = await this.prisma.servicio.update({
      where: { id: servicioId },
      data: {
        ...(editarServicioDto.nombre && { nombre: editarServicioDto.nombre }),
        ...(editarServicioDto.descripcion !== undefined && { descripcion: editarServicioDto.descripcion }),
        ...(editarServicioDto.precio && { precio: editarServicioDto.precio }),
      },
    });

    return this.formatearServicio(servicioActualizado);
  }

  /**
   * Desactiva un servicio del catálogo.
   * El servicio no se elimina — queda visible en citas e historial previo.
   *
   * @param servicioId Identificador único del servicio.
   * @throws BadRequestException si el servicio ya está desactivado.
   * @returns Mensaje de confirmación y el servicio desactivado.
   */
  async desactivarServicio(servicioId: string) {
    const servicio = await this.obtenerServicioPorId(servicioId);

    if (!servicio.activo) {
      throw new BadRequestException({
        codigo: 'SERVICIO_YA_DESACTIVADO',
        mensaje: 'El servicio ya se encuentra desactivado.',
      });
    }

    const servicioActualizado = await this.prisma.servicio.update({
      where: { id: servicioId },
      data: { activo: false },
    });

    return {
      mensaje: 'Servicio desactivado correctamente.',
      servicio: this.formatearServicio(servicioActualizado),
    };
  }

  /**
   * Obtiene un servicio por su ID.
   *
   * @param servicioId Identificador único del servicio.
   * @throws NotFoundException si el servicio no existe.
   * @returns El servicio encontrado.
   */
  private async obtenerServicioPorId(servicioId: string) {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id: servicioId },
    });

    if (!servicio) {
      throw new NotFoundException({
        codigo: 'SERVICIO_NO_ENCONTRADO',
        mensaje: 'El servicio solicitado no existe.',
      });
    }

    return servicio;
  }

  /**
   * Formatea un servicio para devolverlo en la respuesta.
   *
   * @param servicio Objeto del servicio obtenido desde la base de datos.
   * @returns Objeto con los campos normalizados y listos para la respuesta.
   */
  private formatearServicio(servicio: {
    id: string;
    nombre: string;
    descripcion: string | null;
    precio: { toNumber: () => number };
    activo: boolean;
    creadoEn: Date;
    actualizadoEn: Date;
  }) {
    return {
      id: servicio.id,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: servicio.precio.toNumber(),
      activo: servicio.activo,
      creadoEn: servicio.creadoEn,
      actualizadoEn: servicio.actualizadoEn,
    };
  }
}

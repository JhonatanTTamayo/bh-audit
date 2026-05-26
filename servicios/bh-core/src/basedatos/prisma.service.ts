import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Servicio encargado de gestionar la conexión con la base de datos
 * mediante Prisma ORM.
 *
 * Extiende de PrismaClient para permitir el acceso a los modelos definidos
 * en el archivo schema.prisma.
 *
 * Este servicio se registra dentro de BasedatosModule para que pueda ser
 * inyectado en otros servicios del sistema, evitando crear instancias
 * manuales de PrismaClient en diferentes partes del proyecto.
 */
@Injectable()
/**
 * @class PrismaService
 */
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Método llamado cuando el módulo se inicializa.
   * Se encarga de abrir la conexión con la base de datos al iniciar
   * la aplicación.
   */
  /**
   * @returns Promesa que se resuelve cuando Prisma conecta.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Método ejecutado automáticamente cuando el módulo es destruido.
   *
   * Se encarga de cerrar la conexión con la base de datos de forma
   * controlada al detener la aplicación.
   */
  /**
   * @returns Promesa que se resuelve cuando Prisma desconecta.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}

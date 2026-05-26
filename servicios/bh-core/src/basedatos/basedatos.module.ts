import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';


/**
 * Módulo encargado de centralizar la configuración de la base de datos.
 * Este módulo registra y exporta PrismaService para que pueda ser utilizado
 * por otros módulos del sistema mediante inyección de dependencias.
 */
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
/**
 * Modulo de base de datos que registra y exporta PrismaService.
 *
 * @class BasedatosModule
 */
export class BasedatosModule {}

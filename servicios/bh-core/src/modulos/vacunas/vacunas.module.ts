import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BasedatosModule } from '../../basedatos/basedatos.module';
import { VacunasController } from './vacunas.controller';
import { VacunasService } from './vacunas.service';

/**
 * Módulo encargado de gestionar las vacunas de las mascotas.
 */
@Module({
  imports: [BasedatosModule, ConfigModule],
  controllers: [VacunasController],
  providers: [VacunasService],
})
export class VacunasModule {}

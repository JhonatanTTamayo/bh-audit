import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
 
import { BasedatosModule } from '../../basedatos/basedatos.module';
import { VacunasController } from './vacunas.controller';
import { VacunasService } from './vacunas.service';
 
/**
 * Módulo encargado de gestionar las vacunas de las mascotas.
 */
@Module({
  imports: [BasedatosModule, ConfigModule, JwtModule],
  controllers: [VacunasController],
  providers: [VacunasService],
})
export class VacunasModule {}
 
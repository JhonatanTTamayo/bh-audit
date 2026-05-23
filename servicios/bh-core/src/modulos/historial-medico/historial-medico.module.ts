import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BasedatosModule } from '../../basedatos/basedatos.module';
import { HistorialMedicoController } from './historial-medico.controller';
import { HistorialMedicoService } from './historial-medico.service';

/**
 * Módulo encargado de gestionar el historial médico de las mascotas.
 */
@Module({
  imports: [BasedatosModule, ConfigModule],
  controllers: [HistorialMedicoController],
  providers: [HistorialMedicoService],
  exports: [HistorialMedicoService],
})
export class HistorialMedicoModule {}
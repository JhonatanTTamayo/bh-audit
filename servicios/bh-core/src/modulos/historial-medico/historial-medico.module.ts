import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { BasedatosModule } from '../../basedatos/basedatos.module';
import { InventarioModule } from '../inventario/inventario.module';
import { HistorialMedicoController } from './historial-medico.controller';
import { HistorialMedicoService } from './historial-medico.service';

/**
 * Módulo encargado de gestionar el historial médico de las mascotas.
 */
@Module({
  imports: [
    InventarioModule,
    BasedatosModule,
    ConfigModule,
    JwtModule,
  ],
  controllers: [HistorialMedicoController],
  providers: [HistorialMedicoService],
  exports: [HistorialMedicoService],
})
export class HistorialMedicoModule {}
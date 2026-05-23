import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { BasedatosModule } from '../../basedatos/basedatos.module';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { InventarioController } from './inventario.controller';
import { InventarioService } from './inventario.service';

/**
 * Modulo de inventario de productos.
 *
 * Gestiona medicamentos, vacunas e insumos quirurgicos,
 * e incluye la generacion del reporte PDF para el administrador.
 */
@Module({
  imports: [
    BasedatosModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'clave_local_temporal',
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [InventarioController],
  providers: [InventarioService, JwtAuthGuard, RolesGuard],
  exports: [InventarioService],
})
export class InventarioModule {}

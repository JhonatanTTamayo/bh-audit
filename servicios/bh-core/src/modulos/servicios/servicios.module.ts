import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { BasedatosModule } from '../../basedatos/basedatos.module';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { ServiciosController } from './servicios.controller';
import { ServiciosService } from './servicios.service';

/**
 * Módulo del catálogo de servicios.
 *
 * - Importa el módulo de base de datos y el módulo JWT para autenticación.
 * - Expone el controlador de servicios con sus endpoints protegidos.
 * - Provee el servicio de negocio para gestionar el catálogo.
 * - Exporta el servicio para que pueda ser usado en otros módulos.
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
  controllers: [ServiciosController],
  providers: [ServiciosService, JwtAuthGuard, RolesGuard],
  exports: [ServiciosService],
})
export class ServiciosModule {}

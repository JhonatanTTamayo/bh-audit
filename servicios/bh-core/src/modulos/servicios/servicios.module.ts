import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { BasedatosModule } from '../../basedatos/basedatos.module';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { ServiciosController } from './servicios.controller';
import { ServiciosService } from './servicios.service';

/**
 * Modulo del catalogo de servicios.
 *
 * Expone la consulta del catalogo con control de visibilidad por rol.
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

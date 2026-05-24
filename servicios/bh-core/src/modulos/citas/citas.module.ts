import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { BasedatosModule } from '../../basedatos/basedatos.module';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { CorreosModule } from '../correos/correos.module';
import { CitasController } from './citas.controller';
import { CitasService } from './citas.service';

/**
 * Modulo de citas.
 *
 * Centraliza el agendamiento y la gestion del ciclo de vida de citas.
 */
@Module({
  imports: [
    BasedatosModule,
    CorreosModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'clave_local_temporal',
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [CitasController],
  providers: [CitasService, JwtAuthGuard, RolesGuard],
  exports: [CitasService],
})
export class CitasModule {}

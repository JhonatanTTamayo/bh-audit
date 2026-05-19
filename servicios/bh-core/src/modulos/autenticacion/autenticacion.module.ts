import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { BasedatosModule } from '../../basedatos/basedatos.module';
import { CorreosModule } from '../correos/correos.module';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';

/**
 * Módulo de autenticación.
 */
@Module({
  imports: [
    BasedatosModule,
    CorreosModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'clave_temporal_desarrollo',
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService],
  exports: [AutenticacionService],
})
export class AutenticacionModule {}
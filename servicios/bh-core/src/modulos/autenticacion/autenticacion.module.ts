import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
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
      secret: process.env.JWT_SECRET || 'clave_local_temporal',
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService, JwtAuthGuard, RolesGuard],
  exports: [AutenticacionService, JwtModule ,JwtAuthGuard, RolesGuard],
})
export class AutenticacionModule {}
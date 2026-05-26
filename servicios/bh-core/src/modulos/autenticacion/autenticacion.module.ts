import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { BasedatosModule } from '../../basedatos/basedatos.module';
import { CorreosModule } from '../correos/correos.module';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { AuditModule } from '../audit/audit.module';

/**
 * Módulo de autenticación.
 */
@Module({
  imports: [
    BasedatosModule,
    CorreosModule,
    AuditModule,
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
/**
 * Modulo que agrupa autenticacion, JWT, correos y acceso a base de datos.
 *
 * @class AutenticacionModule
 */
export class AutenticacionModule {}

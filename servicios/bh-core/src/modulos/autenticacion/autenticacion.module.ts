import { Module } from '@nestjs/common';

import { BasedatosModule } from '../../basedatos/basedatos.module';
import { CorreosModule } from '../correos/correos.module';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';

/**
 * Módulo de autenticación.
 */
@Module({
  imports: [BasedatosModule, CorreosModule],
  controllers: [AutenticacionController],
  providers: [AutenticacionService],
  exports: [AutenticacionService],
})
export class AutenticacionModule {}
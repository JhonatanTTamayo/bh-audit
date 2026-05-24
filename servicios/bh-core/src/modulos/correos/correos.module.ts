import { Module } from '@nestjs/common';
import { CorreosService } from './correos.service';



/**
 * Módulo de correos.
 *
 * Este módulo será responsable de centralizar la lógica relacionada
 * con el envío de correos electrónicos.
 */
@Module({
  providers: [CorreosService],
  exports: [CorreosService],
})
export class CorreosModule {}
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { BasedatosModule } from '../../basedatos/basedatos.module';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { CorreosModule } from '../correos/correos.module';

/**
 * Módulo de usuarios.
 *
 * Este módulo centraliza la lógica relacionada con la gestión
 * administrativa de usuarios del sistema.
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
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
/**
 * Modulo que agrupa la administracion de usuarios.
 *
 * @class UsuariosModule
 */
export class UsuariosModule {}

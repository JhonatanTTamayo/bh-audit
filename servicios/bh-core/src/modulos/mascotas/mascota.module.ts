import { Module } from '@nestjs/common';

import { PrismaService } from '../../basedatos/prisma.service';
import { BasedatosModule } from '../../basedatos/basedatos.module';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { MascotasController } from './mascota.controller';
import { MascotasService } from './mascota.service';


@Module({
  imports: [
    BasedatosModule,
    AutenticacionModule,
  ],
  controllers: [MascotasController],
  providers: [
    MascotasService,
  ],
})
/**
 * Modulo que agrupa la gestion de mascotas.
 *
 * @class MascotasModule
 */
export class MascotasModule {}

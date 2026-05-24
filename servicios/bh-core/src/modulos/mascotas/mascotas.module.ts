import { Module } from '@nestjs/common';

import { PrismaService } from '../../basedatos/prisma.service';
import { MascotasController } from './mascotas.controller';
import { MascotasService } from './mascotas.service';
import { BasedatosModule } from '../../basedatos/basedatos.module';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';


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
export class MascotasModule {}
import { Module } from '@nestjs/common';

import { AutenticacionModule } from '../modulos/autenticacion/autenticacion.module';
import { BasedatosModule } from '../basedatos/basedatos.module';
import { ServiciosController } from './servicios.controller';
import { ServiciosService } from './servicios.service';

@Module({
    imports: [BasedatosModule, AutenticacionModule],
    controllers: [ServiciosController],
    providers: [ServiciosService],
})
export class ServiciosModule {}
import { Module } from '@nestjs/common';

import { AutenticacionModule } from '../../modulos/autenticacion/autenticacion.module';
import { BasedatosModule } from '../../basedatos/basedatos.module';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';

@Module({
    imports: [BasedatosModule, AutenticacionModule],
    controllers: [CatalogoController],
    providers: [CatalogoService],
})
export class CatalogoModule {}
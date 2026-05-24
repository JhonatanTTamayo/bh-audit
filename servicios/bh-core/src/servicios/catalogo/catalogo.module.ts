import { Module } from '@nestjs/common';

import { BasedatosModule } from '../../basedatos/basedatos.module';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';

@Module({
    imports: [BasedatosModule],
    controllers: [CatalogoController],
    providers: [CatalogoService],
})
export class CatalogoModule {}
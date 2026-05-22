import { Module } from '@nestjs/common';
import { FacturacionService } from './facturacion.service';
import { FacturacionController } from './facturacion.controller';
import { BasedatosModule } from '../../basedatos/basedatos.module';

@Module({
    imports: [BasedatosModule],
    controllers: [FacturacionController],
    providers: [FacturacionService],
})
export class FacturacionModule {}
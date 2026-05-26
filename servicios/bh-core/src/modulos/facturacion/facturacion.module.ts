import { Module } from '@nestjs/common';
import { FacturacionController } from './facturacion.controller';
import { FacturacionService } from './facturacion.service';
import { BasedatosModule } from '../../basedatos/basedatos.module';
import { AuditModule } from '../audit/audit.module';





@Module({
    imports: [BasedatosModule, AuditModule],
    controllers: [FacturacionController],
    providers: [FacturacionService],
})
/**
 * Modulo que agrupa la gestion de facturacion.
 *
 * @class FacturacionModule
 */
export class FacturacionModule {}

import { Module } from '@nestjs/common';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { BasedatosModule } from '../../basedatos/basedatos.module';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';

@Module({
  imports: [BasedatosModule,AutenticacionModule],
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}

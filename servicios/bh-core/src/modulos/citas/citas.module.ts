import { Module } from '@nestjs/common';
import { CitasController } from './citas.controller';
import { CitasService } from './citas.service';
import { BasedatosModule } from '../../basedatos/basedatos.module';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';

@Module({
    imports: [BasedatosModule, AutenticacionModule],
    controllers: [CitasController],
    providers: [CitasService],
    exports: [CitasService],
})
export class CitasModule {}
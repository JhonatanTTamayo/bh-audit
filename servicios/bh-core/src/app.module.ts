import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BasedatosModule } from './basedatos/basedatos.module';
import { AutenticacionModule } from './modulos/autenticacion/autenticacion.module';
import { CitasModule } from './modulos/citas/citas.module';
import { CorreosModule } from './modulos/correos/correos.module';
import { HistorialMedicoModule } from './modulos/historial-medico/historial-medico.module';
import { RolesModule } from './modulos/roles/roles.module';
import { UsuariosModule } from './modulos/usuarios/usuarios.module';
import { VacunasModule } from './modulos/vacunas/vacunas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BasedatosModule,
    AutenticacionModule,
    UsuariosModule,
    RolesModule,
    CorreosModule,
    CitasModule,
    HistorialMedicoModule,
    VacunasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
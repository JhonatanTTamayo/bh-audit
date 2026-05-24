import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BasedatosModule } from './basedatos/basedatos.module';
import { AutenticacionModule } from './modulos/autenticacion/autenticacion.module';
import { CitasModule } from './modulos/citas/citas.module';
import { ClientesModule } from './modulos/clientes/clientes.module';
import { CorreosModule } from './modulos/correos/correos.module';
import { FacturacionModule } from './modulos/facturacion/facturacion.module';
import { HistorialMedicoModule } from './modulos/historial-medico/historial-medico.module';
import { InventarioModule } from './modulos/inventario/inventario.module';
import { MascotasModule } from './modulos/mascotas/mascota.module';
import { RolesModule } from './modulos/roles/roles.module';
import { UsuariosModule } from './modulos/usuarios/usuarios.module';
import { ReportesModule } from './modulos/reportes/reportes.module';

/**
 * Modulo raiz del microservicio bh-core.
 * Centraliza la carga de los modulos principales del sistema.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    BasedatosModule,
    AutenticacionModule,
    UsuariosModule,
    RolesModule,
    CorreosModule,
    ClientesModule,
    MascotasModule,
    InventarioModule,
    HistorialMedicoModule,
    FacturacionModule,
    CitasModule,
    ReportesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
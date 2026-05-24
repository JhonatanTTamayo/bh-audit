import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BasedatosModule } from './basedatos/basedatos.module';
import { AutenticacionModule } from './modulos/autenticacion/autenticacion.module';
import { CitasModule } from './modulos/citas/citas.module';
import { ClientesModule } from './modulos/clientes/clientes.module';
import { CorreosModule } from './modulos/correos/correos.module';
import { InventarioModule } from './modulos/inventario/inventario.module';
import { MascotasModule } from './modulos/mascotas/mascota.module';
import { RolesModule } from './modulos/roles/roles.module';
import { UsuariosModule } from './modulos/usuarios/usuarios.module';

/**
 * Modulo raiz del microservicio bh-core.
 * Este modulo centraliza la carga de los modulos principales del sistema.
 */
@Module({
  imports: [
    /**
     * ConfigModule permite leer variables de entorno desde archivos .env.
     *
     * Al configurarlo como global, los demas modulos pueden acceder a la
     * configuracion sin necesidad de importarlo individualmente.
     */
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    /**
     * Modulo encargado de la conexion y servicios relacionados con la base de datos.
     */
    BasedatosModule,

    /**
     * Modulo encargado de los procesos de autenticacion, como login,
     * registro y gestion de tokens.
     */
    AutenticacionModule,

    /**
     * Modulo encargado de la gestion de usuarios.
     */
    UsuariosModule,

    /**
     * Modulo encargado de la gestion de roles y permisos del sistema.
     */
    RolesModule,

    /**
     * Modulo encargado del envio de correos electronicos.
     */
    CorreosModule,

    ClientesModule,

    /**
     * Modulo encargado del crud del inventario.
     */
    InventarioModule,

    MascotasModule,

    /**
     * Modulo encargado del agendamiento y gestion de citas.
     */
    CitasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

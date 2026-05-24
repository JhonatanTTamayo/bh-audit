  import { Module } from '@nestjs/common';
  import { ConfigModule } from '@nestjs/config';

<<<<<<< HEAD
  import { AppController } from './app.controller';
  import { AppService } from './app.service';
  import { BasedatosModule } from './basedatos/basedatos.module';
  import { AutenticacionModule } from './modulos/autenticacion/autenticacion.module';
  import { CorreosModule } from './modulos/correos/correos.module';
  import { RolesModule } from './modulos/roles/roles.module';
  import { UsuariosModule } from './modulos/usuarios/usuarios.module';
  import { ClientesModule } from './modulos/clientes/clientes.module';
  import { InventarioModule } from './modulos/inventario/inventario.module';
=======
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BasedatosModule } from './basedatos/basedatos.module';
import { AutenticacionModule } from './modulos/autenticacion/autenticacion.module';
import { CorreosModule } from './modulos/correos/correos.module';
import { RolesModule } from './modulos/roles/roles.module';
import { UsuariosModule } from './modulos/usuarios/usuarios.module';
import { ClientesModule } from './modulos/clientes/clientes.module';
import { MascotasModule } from './modulos/mascotas/mascota.module';
>>>>>>> develop

  /**
   * Modulo raíz del microservicio bh-core
   * Este modulo centraliza la carga de los módulos principales del sistema
   * Desde aquí se importan las funcionalidades base relacionadas con 
   * autenticación, gestión de usuarios, roles, correos electrónicos y conexión a la base de datos.
   */


  @Module({
    imports: [

      /**
       * ConfigModule permite leer variables de entorno desde archivos .env
       * 
       * Al configurarlo como global, los demás módulos pueden acceder a la
       * configuración sin necesidad de importarlo individualmente.
       */
      ConfigModule.forRoot({
        isGlobal: true,
      }),

      /**
       * Módulo encargado de la conexión y servicios relacionados con la base de datos.
      */
      BasedatosModule,

      /**
       * Módulo encargado de los procesos de autenticación, como login, 
       * registro y gestión de tokens.
       */

      AutenticacionModule,

      /**
       * Módulo encargado de la gestión de usuarios
       */
      UsuariosModule,

      /**
       * Módulo encargado de la gestión de roles y permisos del sistema
       */
      RolesModule,
      /**
       * Módulo encargado del envío de correos electrónicos.
       */
      CorreosModule,

<<<<<<< HEAD
      ClientesModule,
      /**
       * Módulo encargado del crud del inventario.
       */
      InventarioModule,
    ],
    controllers: [AppController],
    providers: [AppService],
  })
  export class AppModule {}
=======
    ClientesModule,
    MascotasModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
>>>>>>> develop

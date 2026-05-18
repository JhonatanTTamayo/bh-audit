import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


/**
 * Función principal para iniciar la aplicación NestJS. 
 * 
 * En este archivo se configura aspectos globales del microservicio,
 * como el prefijo de las rutas, CORS y las validaciones globales
 * para los DTOs que se implementaran en los módulos funcionales.
 */

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Define el prefijo global de todas las rutas del backend
   * Ejemplo:
   * /api/usuarios
   * /api/roles
   */

  app.setGlobalPrefix('api');

  /**
   * Habilita CORS para permitir comunicación con clientes externos.
   */
  app.enableCors({
    origin: true,
    credentials: true,
  });

  /**
   * Configura validaciones globales para las peticiones entrantes.
   * 
   * - whitelist: Elimina propiedades no definidas en los DTOs.
   * - forbidNonWhitelisted: Rechaza peticiones con campos no permitidos.
   * - transform: convierte automáticamente los datos al tipo esperado.
   */

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;

  await app.listen(port);
}

bootstrap();
import {
  BadRequestException,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Define el prefijo global de todas las rutas del backend
   * Ejemplo:
   * /api/usuarios
   * /api/roles
   */

  app.setGlobalPrefix('bh-core/v1');

  // 2. Swagger Configuration
  const config = new DocumentBuilder()
      .setTitle('API Facturación BH-Core')
      .setDescription('Documentación de los endpoints de facturación y servicios del sistema')
      .setVersion('1.0')
      .addTag('Facturacion')
      .build();

  const document = SwaggerModule.createDocument(app, config);
  // Swagger estará disponible en: http://localhost:3000/api/docs
  SwaggerModule.setup('api/docs', app, document);

  // 3. CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 4. Validaciones Globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (validationErrors) => {
        const hasPagoError = (errors: any[]): boolean =>
          errors.some(
            (error) =>
              error.property === 'pago' ||
              (error.children?.length > 0 && hasPagoError(error.children)),
          );

        const flattenErrors = (errors: any[], parent = ''): string[] =>
          errors.flatMap((error) => {
            const path = parent ? `${parent}.${error.property}` : error.property;
            const messages = error.constraints
              ? Object.values(error.constraints)
              : [];
            return [
              ...messages.map((message) => `${path}: ${message}`),
              ...flattenErrors(error.children || [], path),
            ];
          });

        const detalles = flattenErrors(validationErrors);

        if (hasPagoError(validationErrors)) {
          return new UnprocessableEntityException({
            codigo: 'PAGO_INVALIDO',
            mensaje: 'La información de pago no es válida.',
            detalles,
          });
        }

        return new BadRequestException({
          codigo: 'VALIDACION_INVALIDA',
          mensaje: 'La petición contiene datos inválidos.',
          detalles,
        });
      },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Aplicación corriendo en: http://localhost:${port}/api/docs`);
}

bootstrap();
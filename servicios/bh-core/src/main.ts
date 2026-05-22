import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Prefijo Global
  app.setGlobalPrefix('api');

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
      }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Aplicación corriendo en: http://localhost:${port}/api/docs`);
}

bootstrap();
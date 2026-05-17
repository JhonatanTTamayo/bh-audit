import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('bh-core/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Breaze & Harold Veterinary System — bh-core API')
    .setDescription(
      'Microservicio principal bh-core para la operación de la clínica veterinaria.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);
  SwaggerModule.setup('bh-core/v1/docs', app, document);

  const port = process.env.PORT ?? 3000;

  await app.listen(port);

  console.log(`bh-core corriendo en: http://localhost:${port}/bh-core/v1`);
  console.log(`Swagger disponible en: http://localhost:${port}/docs`);
  console.log(`Swagger alternativo en: http://localhost:${port}/bh-core/v1/docs`);
}

bootstrap();
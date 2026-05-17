"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('bh-core/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Breaze & Harold Veterinary System — bh-core API')
        .setDescription('Microservicio principal bh-core para la operación de la clínica veterinaria.')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    swagger_1.SwaggerModule.setup('bh-core/v1/docs', app, document);
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`bh-core corriendo en: http://localhost:${port}/bh-core/v1`);
    console.log(`Swagger disponible en: http://localhost:${port}/docs`);
    console.log(`Swagger alternativo en: http://localhost:${port}/bh-core/v1/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map
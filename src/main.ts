import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (validationErrors) =>
        new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: validationErrors.flatMap((error) =>
            Object.values(error.constraints ?? {}),
          ),
          statusCode: 400,
        }),
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Patagonia IT Challenge API')
    .setDescription('Technical challenge API for companies and transfers')
    .setVersion('1.0.0')
    .addServer('http://localhost:3000', 'Local')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(3000);
}

void bootstrap();

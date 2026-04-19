import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './infrastructure/http/filters/global-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionFilter());
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

  const appUrl = (await app.getUrl()).replace('[::1]', 'localhost');
  const apiBaseUrl = `${appUrl}/api`;
  const docsUrl = `${appUrl}/docs`;

  logger.log(`API running at ${apiBaseUrl}`);
  logger.log(`Health endpoint: ${apiBaseUrl}/health`);
  logger.log(`Readiness endpoint: ${apiBaseUrl}/health/ready`);
  logger.log(`Swagger UI: ${docsUrl}`);

  const endpoints = Object.entries(swaggerDocument.paths)
    .flatMap(([path, pathItem]) =>
      Object.keys(pathItem).map((method) => {
        const normalizedPath = path.startsWith('/api') ? path : `/api${path}`;
        return `${method.toUpperCase()} ${normalizedPath}`;
      }),
    )
    .sort((a, b) => a.localeCompare(b));

  const groupedEndpoints = new Map<string, string[]>();
  for (const endpoint of endpoints) {
    const [, rawPath = ''] = endpoint.split(' ');
    const pathWithoutPrefix = rawPath.replace(/^\/api\/?/, '');
    const [groupSegment] = pathWithoutPrefix.split('/');
    const group = groupSegment || 'root';

    const current = groupedEndpoints.get(group) ?? [];
    current.push(endpoint);
    groupedEndpoints.set(group, current);
  }

  logger.log('Available endpoints by domain:');
  for (const group of Array.from(groupedEndpoints.keys()).sort((a, b) => a.localeCompare(b))) {
    logger.log(`[${group}]`);

    const groupEndpoints = groupedEndpoints.get(group) ?? [];
    for (const endpoint of groupEndpoints) {
      logger.log(`- ${endpoint}`);
    }
  }
}

void bootstrap();

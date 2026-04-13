import process from 'process';
import { loadEnv } from './appBootstrap/config/loadEnv.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './appBootstrap/app.module.js';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { getApiModels } from './utils/swagger/api-model.swagger.util.js';
//import { ApiResponseDTO } from './utils/swagger/api-response.swagger.util.js';

loadEnv(process.env['NODE_ENV'] ?? 'dev');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  // Swagger is only available in non-production environments.
  // In production, the /api docs endpoint is not exposed.
  if (process.env['NODE_ENV'] !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('SH3PHERD API Documentation')
      .setDescription('API endpoints for the SH3PHERD platform')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
          name: 'Authorization',
          in: 'header',
        },
        'bearer',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      extraModels: getApiModels(),
    });
    SwaggerModule.setup('api-docs', app, document);
  }

  const corsOrigin = process.env['CORS_ORIGIN'] ?? 'http://localhost:4200';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Feature',
      'X-Contract-Id',
      // Print export headers (used by the orgchart PDF pipeline):
      // - X-Print-Token carries the single-use JWT consumed by the
      //   public `print-payload` endpoint.
      // - X-Skip-Auth tells the frontend auth interceptor not to fetch
      //   an access token for this request (Puppeteer has none).
      'X-Print-Token',
      'X-Skip-Auth',
      'X-Retry',
    ],
    // Expose the telemetry headers the export endpoint sets so the
    // frontend export service can read them off the response.
    exposedHeaders: ['X-Orgchart-Pages', 'X-Orgchart-Pagination', 'X-Orgchart-Format'],
  });

  app.setGlobalPrefix('api');

  app.use(cookieParser());

  await app.listen(process.env['PORT'] ?? 3000);
}
await bootstrap();

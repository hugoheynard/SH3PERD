import process from 'process';
import { loadEnv } from './appBootstrap/config/loadEnv.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './appBootstrap/app.module.js';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { getApiModels } from './utils/swagger/api-model.swagger.util.js';
//import { ApiResponseDTO } from './utils/swagger/api-response.swagger.util.js';

loadEnv(process.env['NODE_ENV'] || 'dev');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  //TODO: Swagger setup should be done only in non-production envs and extract logic in config file
  const config = new DocumentBuilder()
    .setTitle('SH3PHERD API Documentation')
    .setDescription('Plan et endpoints de mon application')
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
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: 'http://localhost:4200', //TODO manager CORS avec env
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-XSRF-TOKEN',
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

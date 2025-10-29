import process from 'process';
import { loadEnv } from './appBootstrap/config/loadEnv.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './appBootstrap/app.module.js';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


loadEnv(process.env['NODE_ENV'] || 'dev');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    //logger: ['error', 'warn']
  });

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Plan et endpoints de mon application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: 'http://localhost:4200', //TODO manager CORS avec env
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-XSRF-TOKEN', 'X-Feature']
  });

  app.setGlobalPrefix('api');

  app.use(cookieParser());


  await app.listen(process.env['PORT'] ?? 3000);
}
await bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './appBootstrap/app.module.js';
import cookieParser from 'cookie-parser';
import { loadEnv } from './config/loadEnv.js';
import process from "process";

loadEnv(process.env.NODE_ENV || 'dev');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200', //TODO manager CORS avec env
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.use(cookieParser());


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

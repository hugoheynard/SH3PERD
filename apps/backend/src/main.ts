import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';
import { loadEnv } from './config/loadEnv.js';
import process from "process";

loadEnv(process.env.NODE_ENV || 'dev');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

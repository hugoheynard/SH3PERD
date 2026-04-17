import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = parseInt(process.env.PORT ?? '3001', 10);
  const logger = new Logger('AudioProcessor');

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port },
  });

  await app.listen();
  logger.log(`TCP microservice listening on port ${port}`);
}

void bootstrap();

import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TestController } from './test.controller.js';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration.js';
import { MongoModule } from './database/MongoModule.js';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration available globally
      ignoreEnvFile: true, // Ignores the default .env file, we manage it
      cache: true, // Caches the configuration for performance
      load: [configuration], // You can load additional configuration files or functions here
    }),
    MongoModule
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}

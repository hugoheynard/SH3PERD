import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TestController } from '../test.controller.js';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration.js';
import { MongoModule } from './database/MongoModule.js';
import { ProtectedModule } from './protected.module.js';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from '../auth/api/auth.module.js';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration available globally
      ignoreEnvFile: true, // Ignores the default .env file, we manage it
      cache: true, // Caches the configuration for performance
      load: [configuration], // You can load additional configuration files or functions here
    }),
    // Database module, returns MongoClient instance
    MongoModule,

    // ⚠️ Prefix split
    RouterModule.register([
      {
        path: 'auth',
        module: AuthModule,
      },
      {
        path: 'protected',
        module: ProtectedModule,
      },
    ]),
    AuthModule,
    ProtectedModule,
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}

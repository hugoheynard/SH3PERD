import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TestController } from '../test.controller.js';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration.js';
import { MongoModule } from './database/MongoModule.js';
import { ProtectedModule } from './protected.module.js';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { AuthModule } from '../auth/api_nest/auth.module.js';
import { CoreServicesModule } from './core_modules/services/CoreServiceModule.js';
import { AuthGuard } from '../auth/api_nest/auth.guard.js';
import { TokenFunctionsModule } from './core_modules/services/subModules/TokenFunctionsModule.js';
import { CoreRepositoriesModule } from './core_modules/repositories/CoreRepositoriesModule.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration available globally
      ignoreEnvFile: false, // Ignores the default .env file, we manage it
      cache: true, // Caches the configuration for performance
      load: [configuration], // You can load additional configuration files or functions here
    }),
    // Database module, returns MongoClient instance
    MongoModule,
    // Token verification for AuthGuard
    TokenFunctionsModule,
    CoreRepositoriesModule,
    //Services
    CoreServicesModule,
    // Modules
    AuthModule,
    ProtectedModule,
    // ⚠️ Prefix split
    RouterModule.register([
      { path: 'auth', module: AuthModule },
      { path: 'protected', module: ProtectedModule },
    ]),
  ],
  controllers: [AppController, TestController],
  providers: [AppService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AuthGuard } from '../utils/nest/guards/auth.guard.js';
import { APP_GUARD } from '@nestjs/core';
import { MusicRepertoireController } from '../music/api/musicRepertoire.controller.js';
import { TokenFunctionsModule } from './core_modules/services/subModules/TokenFunctionsModule.js';
import { MusicRepertoireModule } from '../music/musicRepertoire.module.js';


@Module({
  imports: [
    TokenFunctionsModule,
    MusicRepertoireModule
  ],
  providers: [
    {
      provide: APP_GUARD, // applies to all routes in this module
      useClass: AuthGuard,
    },
  ],
  controllers: [],
  exports: []
})
export class ProtectedModule {
  // This module is intended for protected routes and services.
  // It can be extended with additional controllers, providers, or imports as needed.
  // Currently, it does not contain any specific functionality.
}
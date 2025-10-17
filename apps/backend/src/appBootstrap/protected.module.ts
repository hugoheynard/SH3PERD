import { Module } from '@nestjs/common';
import { MusicModule } from '../music/music.module.js';
import { ContractController } from '../contracts/api/contract.controller.js';
import { UserController } from '../user/api/user.controller.js';
import { APP_GUARD } from '@nestjs/core';
import { ContractContextGuard } from '../contracts/api/contract-context.guard.js';
import { TokenFunctionsModule } from '../auth/core/TokenFunctions.module.js';


@Module({
  imports: [
    TokenFunctionsModule,
    MusicModule
  ],
  controllers: [
    UserController,
    ContractController,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ContractContextGuard }
    ],
  exports: [],
})
export class ProtectedModule {
  // This module is intended for protected routes and services.
  // It can be extended with additional controllers, providers, or imports as needed.
  // Currently, it does not contain any specific functionality.
}

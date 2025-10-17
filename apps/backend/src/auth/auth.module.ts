import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller.js';
//import { TokenFunctionsModule } from './core/TokenFunctions.module.js';
//import { AuthCoreModule } from './core/auth-core.module.js';
import { AuthUseCasesModule } from './use-cases/auth-use-cases.module.js';


@Module({
  imports: [
    //TokenFunctionsModule,
    //AuthCoreModule,
    AuthUseCasesModule
  ],
  controllers: [AuthController],
})
export class AuthModule {}

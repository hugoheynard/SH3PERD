import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { CoreUseCasesAccessModule } from '../../appBootstrap/core_modules/useCases/CoreUseCasesAccessModule.js';
import { TokenFunctionsModule } from '../../appBootstrap/core_modules/services/subModules/TokenFunctionsModule.js';

@Module({
  imports: [CoreUseCasesAccessModule.for('auth'), TokenFunctionsModule],
  controllers: [AuthController],
})
export class AuthModule {}

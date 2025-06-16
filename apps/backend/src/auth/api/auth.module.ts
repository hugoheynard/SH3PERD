import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { CoreUseCasesAccessModule } from '../../appBootstrap/core_modules/useCases/CoreUseCasesAccessModule.js';

@Module({
  imports: [CoreUseCasesAccessModule.for('auth')],
  controllers: [AuthController],
})
export class AuthModule {}
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { UseCasesModule } from '../../appBootstrap/core_modules/useCases/UseCaseModule.js';

@Module({
  imports: [UseCasesModule.for('auth')],
  controllers: [AuthController],
})
export class AuthModule {}
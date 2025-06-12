import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthUseCasesModule } from '../../appBootstrap/core_modules/useCases/subModules/AuthUseCasesModule.js';

@Module({
  imports: [AuthUseCasesModule],
  controllers: [AuthController],
})
export class AuthModule {}
import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller.js';
import { AuthHandlersModule } from './auth-handlers.module.js';

@Module({
  imports: [AuthHandlersModule],
  controllers: [AuthController],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { UserController } from './api/user.controller.js';
import { UserHandlersModule } from './user-handlers.module.js';


@Module({
  imports: [UserHandlersModule],
  controllers: [UserController],
})
export class UserModule {}

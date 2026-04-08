import { Module } from '@nestjs/common';
import { UserController } from './api/user.controller.js';
import { UserLookupController } from './api/user-lookup.controller.js';
import { GuestUserController } from './api/guest-user.controller.js';
import { UserHandlersModule } from './user-handlers.module.js';

@Module({
  imports: [UserHandlersModule],
  controllers: [UserController, UserLookupController, GuestUserController],
})
export class UserModule {}

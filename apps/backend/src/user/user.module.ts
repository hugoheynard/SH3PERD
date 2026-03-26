import { Module } from '@nestjs/common';
import { UserController } from './api/user.controller.js';
import { UserLookupController } from './api/user-lookup.controller.js';
import { UserHandlersModule } from './user-handlers.module.js';
import { SearchUserByEmailUseCase } from './useCase/SearchUserByEmailUseCase.js';
import { InviteUserUseCase } from './useCase/InviteUserUseCase.js';

@Module({
  imports: [UserHandlersModule],
  controllers: [UserController, UserLookupController],
  providers: [SearchUserByEmailUseCase, InviteUserUseCase],
})
export class UserModule {}

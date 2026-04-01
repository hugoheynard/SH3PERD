import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetCurrentUserViewModelHandler } from './application/query/GetCurrentUserViewModel.js';
import { GetUserProfileHandler } from './application/query/GetUserProfileQuery.js';
import { SearchUserByEmailHandler } from './application/query/SearchUserByEmailQuery.js';
import { UpdateUserProfileHandler } from './application/commands/UpdateUserProfileCommand.js';
import { InviteUserHandler } from './application/commands/InviteUserCommand.js';
import { AuthCoreModule } from '../auth/core/auth-core.module.js';

const CommandHandlers = [UpdateUserProfileHandler, InviteUserHandler];
const QueryHandlers = [GetCurrentUserViewModelHandler, GetUserProfileHandler, SearchUserByEmailHandler];

@Module({
  imports: [CqrsModule, AuthCoreModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class UserHandlersModule {}

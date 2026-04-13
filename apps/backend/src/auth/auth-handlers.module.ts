import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthCoreModule } from './core/auth-core.module.js';
import { RegisterUserHandler } from './application/commands/RegisterUserCommand.js';
import { LoginHandler } from './application/commands/LoginCommand.js';
import { RefreshSessionHandler } from './application/commands/RefreshSessionCommand.js';
import { LogoutHandler } from './application/commands/LogoutCommand.js';

const CommandHandlers = [RegisterUserHandler, LoginHandler, RefreshSessionHandler, LogoutHandler];

@Module({
  imports: [CqrsModule, AuthCoreModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class AuthHandlersModule {}

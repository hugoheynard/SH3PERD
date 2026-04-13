import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthCoreModule } from './core/auth-core.module.js';
import { AuthController } from './api/auth.controller.js';
import { RegisterUserHandler } from './application/commands/RegisterUserCommand.js';
import { LoginHandler } from './application/commands/LoginCommand.js';
import { RefreshSessionHandler } from './application/commands/RefreshSessionCommand.js';
import { LogoutHandler } from './application/commands/LogoutCommand.js';
import { ChangePasswordHandler } from './application/commands/ChangePasswordCommand.js';
import { ForgotPasswordHandler } from './application/commands/ForgotPasswordCommand.js';
import { ResetPasswordHandler } from './application/commands/ResetPasswordCommand.js';

const CommandHandlers = [
  RegisterUserHandler,
  LoginHandler,
  RefreshSessionHandler,
  LogoutHandler,
  ChangePasswordHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
];

@Module({
  imports: [CqrsModule, AuthCoreModule],
  controllers: [AuthController],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class AuthModule {}

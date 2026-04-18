import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthCoreModule } from './core/auth-core.module.js';
import { AnalyticsModule } from '../analytics/analytics.module.js';
import { MailerModule } from '../mailer/mailer.module.js';
import { TurnstileModule } from './turnstile/turnstile.module.js';
import { AuthController } from './api/auth.controller.js';
import { RegisterUserHandler } from './application/commands/RegisterUserCommand.js';
import { LoginHandler } from './application/commands/LoginCommand.js';
import { RefreshSessionHandler } from './application/commands/RefreshSessionCommand.js';
import { LogoutHandler } from './application/commands/LogoutCommand.js';
import { ChangePasswordHandler } from './application/commands/ChangePasswordCommand.js';
import { DeactivateAccountHandler } from './application/commands/DeactivateAccountCommand.js';
import { ForgotPasswordHandler } from './application/commands/ForgotPasswordCommand.js';
import { ResetPasswordHandler } from './application/commands/ResetPasswordCommand.js';
import { UserRegisteredHandler } from './application/events/UserRegisteredHandler.js';

const CommandHandlers = [
  RegisterUserHandler,
  LoginHandler,
  RefreshSessionHandler,
  LogoutHandler,
  ChangePasswordHandler,
  DeactivateAccountHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
];

@Module({
  imports: [CqrsModule, AuthCoreModule, AnalyticsModule, MailerModule, TurnstileModule],
  controllers: [AuthController],
  providers: [...CommandHandlers, UserRegisteredHandler],
  exports: [...CommandHandlers],
})
export class AuthModule {}

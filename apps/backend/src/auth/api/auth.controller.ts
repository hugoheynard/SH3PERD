import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type {
  TLoginRequestDTO,
  TLoginResponseDTO,
  TRegisterUserRequestDTO,
  TRegisterUserResponseDTO,
  TChangePasswordRequestDTO,
  TForgotPasswordRequestDTO,
  TResetPasswordRequestDTO,
  TUserId,
  TRefreshToken,
} from '@sh3pherd/shared-types';
import {
  SuserCredentialsDTO,
  SRegisterUserRequestDTO,
  SChangePasswordRequestDTO,
  SForgotPasswordRequestDTO,
  SResetPasswordRequestDTO,
} from '@sh3pherd/shared-types';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { Public } from '../../utils/nest/decorators/IsPublic.js';
import { RegisterUserCommand } from '../application/commands/RegisterUserCommand.js';
import { LoginCommand, type TLoginCommandResult } from '../application/commands/LoginCommand.js';
import {
  RefreshSessionCommand,
  type TRefreshSessionResult,
} from '../application/commands/RefreshSessionCommand.js';
import { LogoutCommand } from '../application/commands/LogoutCommand.js';
import { ChangePasswordCommand } from '../application/commands/ChangePasswordCommand.js';
import { ForgotPasswordCommand } from '../application/commands/ForgotPasswordCommand.js';
import { ResetPasswordCommand } from '../application/commands/ResetPasswordCommand.js';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } from '../auth.constants.js';

@ApiTags('auth')
@Controller('')
export class AuthController {
  constructor(private readonly cmdBus: CommandBus) {}

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('register')
  register(
    @Body(new ZodValidationPipe(SRegisterUserRequestDTO)) requestDTO: TRegisterUserRequestDTO,
  ): Promise<TRegisterUserResponseDTO> {
    return this.cmdBus.execute(new RegisterUserCommand(requestDTO));
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(SuserCredentialsDTO)) requestDTO: TLoginRequestDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TLoginResponseDTO> {
    const result: TLoginCommandResult = await this.cmdBus.execute(new LoginCommand(requestDTO));

    res.cookie(
      result.refreshTokenSecureCookie.name,
      result.refreshTokenSecureCookie.value,
      result.refreshTokenSecureCookie.options,
    );

    return {
      authToken: result.authToken,
      user_id: result.user_id,
    };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('refresh')
  async refreshSession(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ authToken: string | null; user_id: TUserId | null }> {
    const currentRefreshToken = (req.cookies as Record<string, string>)['sh3pherd_refreshToken'] as
      | TRefreshToken
      | undefined;

    if (!currentRefreshToken) {
      return { authToken: null, user_id: null };
    }

    const result: TRefreshSessionResult = await this.cmdBus.execute(
      new RefreshSessionCommand(currentRefreshToken),
    );

    res.cookie(
      result.refreshTokenSecureCookie.name,
      result.refreshTokenSecureCookie.value,
      result.refreshTokenSecureCookie.options,
    );

    return {
      authToken: result.authToken,
      user_id: result.user_id,
    };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: 'Logout successful' }> {
    const refreshToken = (req.cookies as Record<string, string>)['sh3pherd_refreshToken'] as
      | TRefreshToken
      | undefined;
    const userId = req.user_id;

    await this.cmdBus.execute(new LogoutCommand(userId, refreshToken));

    res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });

    return { message: 'Logout successful' };
  }

  @ApiOperation({
    summary: 'Change password',
    description:
      'Changes the authenticated user password and invalidates all active sessions, forcing re-login on all devices.',
  })
  @ApiBearerAuth('bearer')
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect or validation failed.' })
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('change-password')
  @HttpCode(200)
  async changePassword(
    @Body(new ZodValidationPipe(SChangePasswordRequestDTO)) body: TChangePasswordRequestDTO,
    @ActorId() actorId: TUserId,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    await this.cmdBus.execute(
      new ChangePasswordCommand(actorId, body.currentPassword, body.newPassword),
    );

    // Clear the refresh cookie — user must re-login
    res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });

    return { message: 'Password changed successfully. Please log in again.' };
  }

  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Sends a password reset link to the email address. Always returns 200 even if email is not found (prevents email enumeration).',
  })
  @ApiResponse({ status: 200, description: 'If the email exists, a reset link has been sent.' })
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(
    @Body(new ZodValidationPipe(SForgotPasswordRequestDTO)) body: TForgotPasswordRequestDTO,
  ): Promise<{ message: string }> {
    await this.cmdBus.execute(new ForgotPasswordCommand(body.email));
    return { message: 'If an account with that email exists, a reset link has been sent.' };
  }

  @ApiOperation({
    summary: 'Reset password with token',
    description:
      'Validates the reset token, sets the new password, and invalidates all active sessions.',
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid, expired, or already used reset token.' })
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(
    @Body(new ZodValidationPipe(SResetPasswordRequestDTO)) body: TResetPasswordRequestDTO,
  ): Promise<{ message: string }> {
    await this.cmdBus.execute(new ResetPasswordCommand(body.token, body.newPassword));
    return { message: 'Password reset successfully. Please log in with your new password.' };
  }

  @Public()
  @SkipThrottle()
  @Get('ping')
  ping(): { ok: 'true' } {
    return { ok: 'true' };
  }
}

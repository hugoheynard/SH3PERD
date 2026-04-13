import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import type {
  TLoginRequestDTO,
  TLoginResponseDTO,
  TRegisterUserRequestDTO,
  TRegisterUserResponseDTO,
  TUserId,
  TRefreshToken,
} from '@sh3pherd/shared-types';
import { SuserCredentialsDTO, SRegisterUserRequestDTO } from '@sh3pherd/shared-types';
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
import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } from '../auth.constants.js';

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
    const currentRefreshToken: TRefreshToken = req.cookies['sh3pherd_refreshToken'];

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
    const refreshToken: TRefreshToken | undefined = req.cookies['sh3pherd_refreshToken'];
    const userId = req.user_id;

    await this.cmdBus.execute(new LogoutCommand(userId, refreshToken));

    res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });

    return { message: 'Logout successful' };
  }

  @Public()
  @SkipThrottle()
  @Get('ping')
  ping(): { ok: 'true' } {
    return { ok: 'true' };
  }
}

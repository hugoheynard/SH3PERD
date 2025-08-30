import {
  Body,
  Controller, Get,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
  //UseInterceptors,
} from '@nestjs/common';
import { type TCoreUseCasesTypeMap, USE_CASES_TOKENS } from '../../appBootstrap/nestTokens.js';
import type {
  TUserCredentialsDTO,
  TLoginResponseDTO,
  TRegisterResponseDTO,
} from '../types/auth.core.useCase.js';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { userCredentialsDTOSchema } from '../zodSchemas/userCredentialsDTOSchema.js';
import { Public } from '../../utils/nest/decorators/IsPublic.js';
//import { LogoutInterceptor } from './logout.interceptor.js';
import type { TUserId } from '../../user/types/user.domain.types.js';
import type { TRefreshToken } from '../types/auth.domain.tokens.js';


//@UseInterceptors(LogoutInterceptor)
@Controller('')
export class AuthController {
  constructor(
    @Inject(USE_CASES_TOKENS.auth)
    private readonly authUseCases: TCoreUseCasesTypeMap['auth'],
  ) {}
  @Public()
  @Post('register')
  register(
    @Body(new ZodValidationPipe(userCredentialsDTOSchema)) requestDTO: TUserCredentialsDTO,
  ): Promise<TRegisterResponseDTO> {
    return this.authUseCases.register(requestDTO);
  }

  /**
   * login - Handles user authentication using email and password.
   *
   * This method orchestrates the login process:
   * - Looks up the user by email
   * - Verifies the password using the injected hashing service
   * - Creates a full authentication session (access + refresh tokens)
   *
   * @param requestDTO - The request object containing email and password in the body
   * @param res - The response object to send the result
   */
  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(userCredentialsDTOSchema)) requestDTO: TUserCredentialsDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TLoginResponseDTO> {

    const { authToken, user_id, refreshTokenSecureCookie } = await this.authUseCases.login({
      email: requestDTO.email,
      password: requestDTO.password,
    });

    res.cookie(
      refreshTokenSecureCookie.name,
      refreshTokenSecureCookie.value,
      refreshTokenSecureCookie.options,
    );

    return {
      authToken,
      user_id,
    };
  }

  /**
   * refreshSession - Refreshes the user's authentication session.
   *
   * This method checks the validity of the current access token and refresh token.
   * If the access token is invalid or expired, it uses the refresh token to create a new session.
   *
   * @param req - The request object containing the current access token in headers and refresh token in cookies
   * @param res - The response object to send the result
   */
  @Public()
  @Post('refresh')
  async refreshSession(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ authToken: string | null; user_id : TUserId | null}> {
    const currentRefreshToken: TRefreshToken = req.cookies['sh3pherd_refreshToken'];

    if (!currentRefreshToken) {
      return { authToken: null, user_id: null };
    }

    const { user_id, refreshTokenSecureCookie, authToken } = await this.authUseCases.refresh({
      refreshToken: currentRefreshToken,
    });

    res.cookie(
      refreshTokenSecureCookie.name,
      refreshTokenSecureCookie.value,
      refreshTokenSecureCookie.options,
    );

    return {
      authToken,
      user_id,
    };
  }

  /**
   * logout - Terminates the user session securely.
   *
   * This method handles logout by:
   * - Revoking the refresh token from the database (via the logout use case)
   * - Clearing the secure refresh token cookie from the user's browser
   *
   * @param req - The request object containing the refresh token in cookies
   * @param res - The response object to confirm logout
   *
   * @returns A JSON response confirming the logout
   */
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request): Promise<{ message: 'Logout successful' }> {
    const refreshToken = req.cookies['sh3pherd_refreshToken'];
    const user_id = req.user_id;

    await this.authUseCases.logout({ user_id, refreshToken });

    return { message: 'Logout successful' };
  }

  /**
   * ping - Health check endpoint to verify server is running.
   */
  @Public()
  @Get('ping')
  ping(): { ok: 'true' } {
    return { ok: 'true' };
  };
}

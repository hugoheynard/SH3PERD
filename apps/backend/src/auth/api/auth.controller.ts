import { Body, Controller, Inject, Post, Req, Res } from '@nestjs/common';
import { type TCoreUseCasesTypeMap, USE_CASES_TOKENS } from '../../appBootstrap/nestTokens.js';
import type {
  TLoginRequestDTO,
  TLoginResponseDTO,
  TRegisterRequestDTO,
  TRegisterResponseDTO,
} from '../types/auth.core.useCase.js';
import type { Request, Response } from 'express';


@Controller('auth')
export class AuthController {
  constructor(
    @Inject(USE_CASES_TOKENS.auth)
    private readonly authUseCases: TCoreUseCasesTypeMap['auth'])
  {};

  @Post('register')
  register(@Body() requestDTO:  TRegisterRequestDTO): Promise<TRegisterResponseDTO> {
    return this.authUseCases.register(requestDTO);
  };

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
  @Post('login')
  async login(
    @Body() requestDTO: TLoginRequestDTO,
    @Res({ passthrough: true }) res: Response
  ): Promise<TLoginResponseDTO> {

    const { authToken, user_id, refreshTokenSecureCookie } = await this.authUseCases.login({
      email: requestDTO.email,
      password: requestDTO.password,
    });

    res.cookie(
      refreshTokenSecureCookie.name,
      refreshTokenSecureCookie.value,
      refreshTokenSecureCookie.options
    );

    return {
      authToken,
      user_id,
    };
  };

  /**
   * refreshSession - Refreshes the user's authentication session.
   *
   * This method checks the validity of the current access token and refresh token.
   * If the access token is invalid or expired, it uses the refresh token to create a new session.
   *
   * @param req - The request object containing the current access token in headers and refresh token in cookies
   * @param res - The response object to send the result
   */
  @Post('refresh')
  async refreshSession(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  )  {
    const currentRefreshToken = req.cookies['sh3pherd_refreshToken'];


    const {
      user_id,
      refreshTokenSecureCookie,
      authToken
    } = await this.authUseCases.refresh({ refreshToken: currentRefreshToken });

    res.cookie(
      refreshTokenSecureCookie.name,
      refreshTokenSecureCookie.value,
      refreshTokenSecureCookie.options
    );

    return {
      authToken,
      user_id,
    };
  };

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
  async logout(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<{ message: 'Logout successful' }> {
    await this.authUseCases.logout({ refreshToken: req.cookies['sh3pherd_refreshToken'] });

    // Clear the refresh token cookie
    res.clearCookie('sh3pherd_refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/'
    });

    return { message: 'Logout successful' };
  }
}

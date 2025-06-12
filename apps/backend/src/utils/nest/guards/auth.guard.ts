import { type CanActivate, type ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { TVerifyAuthTokenFn } from '../../../auth/types/auth.core.contracts.js';
import type { Request } from 'express';


/**
 * `AuthGuard` is a NestJS guard that protects routes by validating the presence and validity of an access token.
 *
 * 🔐 Responsibilities:
 * - Extracts the bearer token from the `Authorization` header
 * - Uses an injected verification function (`verifyAuthTokenFn`) to validate the token
 * - If valid, attaches the decoded `user_id` to the `Request` object
 * - If invalid or missing, throws an `UnauthorizedException` with an appropriate message
 *
 * 🧩 This guard is compatible with NestJS dependency injection and supports custom token verification strategies
 * via the `VERIFY_AUTH_TOKEN_FN` token.
 *
 * @example
 * // Apply globally within a module:
 * {
 *   provide: APP_GUARD,
 *   useClass: AuthGuard
 * }
 *
 * // Access the user ID later in controllers or services:
 * const userId = request.user_id;
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('VERIFY_AUTH_TOKEN_FN') private readonly verifyAuthTokenFn: TVerifyAuthTokenFn
  ) {};

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authToken: string | undefined = request.headers["authorization"]?.split(" ")[1];

    if (!authToken) {
      throw new UnauthorizedException('Missing auth token');
    }

    const payload = await this.verifyAuthTokenFn({ authToken });

    if (!payload) {
      throw new UnauthorizedException('Invalid auth token');
    }

    // Attach user_id to the request for later use
    request.user_id = payload.user_id;
    return true;
  };
}

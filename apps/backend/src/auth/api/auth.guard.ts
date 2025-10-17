import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { TVerifyAuthTokenFn } from '../types/auth.core.contracts.js';
import type { Request } from 'express';
import { VERIFY_AUTH_TOKEN_FN } from '../../appBootstrap/nestTokens.js';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../utils/nest/decorators/IsPublic.js';

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
 * @throws {UnauthorizedException} If the Authorization header is missing or token is invalid
 * // Access the user ID later in controllers or services:
 * const userId = request.user_id;
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(VERIFY_AUTH_TOKEN_FN) private readonly verifyAuthTokenFn: TVerifyAuthTokenFn,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authToken = request.headers['authorization']?.split(' ')[1];

    if (!authToken) {
      throw new UnauthorizedException('Missing auth token');
    }

    const payload = await this.verifyAuthTokenFn({ authToken });

    if (!payload) {
      throw new UnauthorizedException('Invalid auth token');
    }

    request.user_id = payload.user_id;
    return true;
  }
}

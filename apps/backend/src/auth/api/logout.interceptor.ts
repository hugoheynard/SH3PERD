import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import {
  secureCookieConfig,
} from '../../appBootstrap/config/secureCookieConfig.js';
import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } from '../auth.constants.js';

/** * LogoutInterceptor - Interceptor to handle logout requests.
 * This interceptor checks if the request is a logout request and clears the refresh token cookie if it exists.
 * */
@Injectable()
export class LogoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const isLogoutRoute = request.method === 'POST' && request.url.includes('/api/auth/logout');

    return next.handle().pipe(
      tap(() => {
        if (isLogoutRoute && request.cookies?.sh3pherd_refreshToken) {
          const { httpOnly, secure, sameSite } = secureCookieConfig;

          response.clearCookie(REFRESH_COOKIE_NAME, {
            httpOnly,
            secure,
            sameSite,
            path: REFRESH_COOKIE_PATH,
          });
        }
      }),
    );
  }
}

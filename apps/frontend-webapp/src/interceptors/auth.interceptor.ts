import {
  HttpErrorResponse, type HttpHandlerFn, type HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { TokenService } from '../app/services/token.service';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../app/services/auth.service';

/**
 * Http interceptor to attach access tokens to outgoing requests,
 * and automatically attempt to refresh the session on 401 errors.
 *
 * @returns An observable of the HTTP event
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  const shouldIgnore = req.url.includes('/auth');

  if (shouldIgnore) {
    console.log('[AuthInterceptor] Ignoring auth URL:', req.url);
    return next(req);
  }

  const accessToken = tokenService.getToken();

  if (!accessToken) {
    console.warn('[AuthInterceptor] No access token found for request:', req.url);
  }

  const authReq = accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const is401 = error.status === 401;
      const isRefreshingRequest = req.url.includes('/auth/refresh');

      if (!is401 || isRefreshingRequest || !authService.shouldHaveSession()) {
        console.error('[AuthInterceptor] Request failed (not handled):', error.status, req.url);
        return throwError(() => error);
      }

      console.warn('[AuthInterceptor] 401 received, attempting refresh:', req.url);

      return authService.refreshSession().pipe(
        switchMap((newToken: string | null) => {
          if (!newToken) {
            console.error('[AuthInterceptor] Refresh failed — no new token');
            return throwError(() => new Error('Session refresh failed'));
          }

          console.log('[AuthInterceptor] Refresh succeeded, retrying original request with new token:', req.url);

          tokenService.setToken(newToken);

          const retriedReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` }
          });

          return next(retriedReq);
        }),
        catchError(refreshError => {
          console.error('[AuthInterceptor] Refresh request failed:', refreshError);
          return throwError(() => refreshError);
        })
      );
    })
  );
};

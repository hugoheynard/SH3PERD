import {HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {TokenService} from '../app/services/token.service';
import {Router} from '@angular/router';
import {inject} from '@angular/core';
import {catchError, switchMap, throwError} from 'rxjs';
import {AuthService} from '../app/services/auth.service';

/**
* Http interceptor to attach access tokens to outgoing requests,
* and automatically attempt to refresh the session on 401 errors.
*
* 🔒 Behavior:
  * - Skips requests to /auth endpoints (e.g., /auth/login, /auth/refresh)
* - Adds Authorization header with Bearer token if available
  * - On 401 error, triggers token refresh
* - If refresh fails or returns no token, logs the user out
* - If refresh succeeds, retries the original request with the new token
*
* 🚨 Warning:
  * - This interceptor assumes `refreshSession()` returns an Observable<string | null>
* - Do not trigger refresh on /auth/refresh to avoid infinite loops
*
* @param req - The outgoing HTTP request
* @param next - The next handler in the chain
* @returns An observable of the HTTP event
*/
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>,
                                                   next: HttpHandlerFn): any => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const shouldIgnore: boolean = req.url.includes('/auth');

  // Don't intercept auth-related routes
  if (shouldIgnore) {
    return next(req);
  }

  // Attach token if available
  const authToken = tokenService.getToken();
  const authReq = authToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${authToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error.status === 401;
      const isRefreshingRequest = req.url.includes('/auth/refresh');

      if (!isUnauthorized || req.url.includes('/auth/refresh')) {
        return throwError(() => error);
      }

      // Attempt to refresh session
      return authService.refreshSession().pipe(
        switchMap((newToken) => {
          if (!newToken) {
            authService.logout(); // No token → force logout
            return throwError(() => error);
          }

          // Retry the original request with the new token
          const clonedReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });

          return next(clonedReq);
        }),
        catchError(refreshError => {
          authService.logout(); // Refresh itself failed
          return throwError(() => refreshError);
        })
      );
    })
  );
};

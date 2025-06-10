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
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): any => {
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

      // Ne pas traiter si ce n'est pas une 401 ou si c'est déjà un appel à /refresh
      if (!isUnauthorized || isRefreshingRequest) {
        return throwError(() => error);
      }

      // 🚫 Cas 1 : L'utilisateur n'est pas encore authentifié → pas besoin de refresh
      if (!authService.shouldHaveSession()) {
        console.info('[AuthInterceptor] User not authenticated yet, no refresh expected.');
        return throwError(() => error);
      }

      // 🔁 Cas 2 : Tentative de refresh
      return authService.refreshSession().pipe(
        switchMap((newToken: string | null) => {
          if (!newToken) {
            router.navigate(['/login']);
            return throwError(() => new Error('Session refresh failed'));
          }

          const retriedReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` }
          });

          return next(retriedReq);
        }),
        catchError(refreshError => {
          router.navigate(['/login']);
          return throwError(() => refreshError);
        })
      );
    })

);
};

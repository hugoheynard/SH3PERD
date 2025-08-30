import {
  HttpErrorResponse, type HttpHandlerFn, type HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../app/core/services/auth.service';

const isApiUrl = (url: string) => url.includes('/api/');
const isAuthUrl = (url: string) => /\/auth\/(login|refresh|logout)/.test(url);
const withCredsIfApi = (req: HttpRequest<any>) =>
  isApiUrl(req.url) && !req.withCredentials ? req.clone({ withCredentials: true }) : req;


/**
 * Http interceptor to attach access tokens to outgoing requests,
 * and automatically attempt to refresh the session on 401 errors.
 *
 * @returns An observable of the HTTP event
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);

  const baseReq = withCredsIfApi(req);

  // Bypass auth for login, refresh, logout endpoints and if explicitly asked
  if (isAuthUrl(baseReq.url) || baseReq.headers.has('X-Skip-Auth')) {
    return next(baseReq);
  }

  // 1) Get valid access token (from memory or refresh if needed)
  return auth.getValidAccessToken$().pipe(
    switchMap(token => {
      const authedReq = token
        ? baseReq.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : baseReq;

      // 2) Make the request with the access token
      return next(authedReq).pipe(
        catchError((e: unknown) => {
          const err = e as HttpErrorResponse;
          const alreadyRetried = authedReq.headers.has('X-Retry');

          if (err.status === 401 && !alreadyRetried) {
            // Refresh via cookie HttpOnly
            return auth.refreshSession$().pipe(
              switchMap(newToken => {
                if (!newToken) {
                  return throwError(() => err);
                }
                const retryReq = authedReq.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}`, 'X-Retry': '1' }
                });
                return next(retryReq);
              })
            );
          }

          return throwError(() => err);
        })
      );
    })
  );
};

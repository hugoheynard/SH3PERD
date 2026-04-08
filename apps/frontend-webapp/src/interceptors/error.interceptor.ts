import { HttpErrorResponse, type HttpHandlerFn, type HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../app/shared/toast/toast.service';
import { AuthService } from '../app/core/services/auth.service';

/**
 * Global HTTP error interceptor — handles common error responses.
 *
 * Runs AFTER the auth interceptor (which handles 401 refresh).
 * Skipped entirely on SSR (no toast, no logout on the server).
 * Skipped for auth endpoints to avoid infinite loops.
 *
 * ## Behavior (browser only)
 * | Status | Action |
 * |--------|--------|
 * | 401    | Logout + redirect to login |
 * | 403    | Toast "You don't have permission" |
 * | 500+   | Toast "Something went wrong" |
 * | 400/404/409 | No action — let the caller handle it |
 *
 * The error is always re-thrown so `.subscribe({ error })` still fires.
 */
const isAuthUrl = (url: string) => /\/auth\/(login|refresh|logout)/.test(url);

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // Skip on SSR and auth endpoints
  if (!isBrowser || isAuthUrl(req.url)) return next(req);

  const toast = inject(ToastService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Extract backend error message if available
      const backendMessage = error.error?.message;

      switch (error.status) {
        case 401:
          // Session expired and refresh failed — force logout
          auth.logout();
          break;

        case 403:
          toast.show(backendMessage ?? 'You don\'t have permission to perform this action', 'error');
          break;

        case 0:
          // Network error (no response from server)
          toast.show('Unable to reach the server', 'error');
          break;

        default:
          if (error.status >= 500) {
            toast.show(backendMessage ?? 'Something went wrong', 'error');
          }
          // 400, 404, 409, etc. — no toast, let the caller decide
          break;
      }

      // Always re-throw so .subscribe({ error }) still fires
      return throwError(() => error);
    }),
  );
};

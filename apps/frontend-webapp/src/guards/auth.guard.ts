import { type CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../app/core/services/auth.service';
import { catchError, of, switchMap } from 'rxjs';

/**
 * Auth Guard
 * ✅ Allows access if the session is valid
 * ⛔ Goes to /login if not authenticated
 * ⏭️ Skips on SSR (server has no cookies — let client-side handle auth)
 */
export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);

  // SSR: always allow — the client will re-evaluate after hydration
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getValidAccessToken$().pipe(
    switchMap(token => {
      if (!token) {
        return of(router.createUrlTree(['/login']));
      }
      return of(true);
    }),
    catchError(err => {
      console.warn('[AuthGuard] getValidAccessToken$ failed:', err);
      return of(router.createUrlTree(['/login']));
    })
  );
};

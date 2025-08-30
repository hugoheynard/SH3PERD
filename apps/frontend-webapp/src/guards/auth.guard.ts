import { type CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../app/core/services/auth.service';
import { catchError,
  of, switchMap,
} from 'rxjs';

/**
 * Auth Guard
 * ✅ Allows access if the session is valid
 * ⛔ Goes to /login if not authenticated
 */
export const authGuard: CanActivateFn = () => {
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

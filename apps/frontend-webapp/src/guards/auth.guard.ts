import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../app/services/auth.service';
import { TokenService } from '../app/services/token.service';
import { catchError, map, of } from 'rxjs';

/**
 * Auth Guard
 * ✅ Autorise si token présent
 * 🔄 Sinon tente un refreshSession()
 * ⛔ Redirige vers /login si tout échoue
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const token = tokenService.getToken();

  if (token) {
    return of(true);
  }

  return authService.refreshSession().pipe(
    map((newToken) => {
      const isSuccess = !!newToken;
      if (isSuccess) {
        authService.isAuthenticatedSignal.set(true); // 👈 assure-toi de mettre à jour l’état
        return true;
      } else {
        return router.createUrlTree(['/login']);
      }
    }),
    catchError((err) => {
      console.warn('[AuthGuard] Refresh session failed', err);
      return of(router.createUrlTree(['/login']));
    })
  );
};

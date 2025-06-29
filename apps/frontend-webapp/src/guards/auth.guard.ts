import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../app/services/auth.service';
import { catchError, map, of, switchMap, take } from 'rxjs';

/**
 * Auth Guard
 * ✅ Vérifie si l'utilisateur est authentifié via l'observable
 * ⛔ Redirige vers /login si la session est invalide
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.refreshSession().pipe(
    switchMap(() => authService.isAuthenticated$().pipe(
      take(1),
      map(isAuthenticated => isAuthenticated ? true : router.createUrlTree(['/login']))
    )),
    catchError(err => {
      console.warn('[AuthGuard] Refresh failed:', err);
      return of(router.createUrlTree(['/login']));
    })
  );
};

import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../app/services/auth.service';
import {TokenService} from '../app/services/token.service';
import {catchError, map, of} from 'rxjs';

/**
 * Auth Guard
 * This guard checks if the user is authenticated before allowing access to certain routes.
 * If the user is not authenticated, it attempts to refresh the session silently.
 * If the refresh fails or there is no token, it redirects to the login page.
 *
 *  Returns true if authenticated or successfully refreshed, otherwise redirects to login.
 */

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const token = tokenService.getToken();

  // ✅ Cas 1 : déjà connecté → autoriser
  if (token) {
    return of(true);
  }

  // ❓ Cas 2 : pas de token → tenter un refresh silencieux
  return authService.refreshSession().pipe(
    map((newToken) => {
      return newToken ? true : router.createUrlTree(['/login']);
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};

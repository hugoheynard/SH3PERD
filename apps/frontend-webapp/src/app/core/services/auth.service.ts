import { inject, Injectable } from '@angular/core';
import {
  catchError,
  delay,
  finalize,
  map,
  Observable,
  of, shareReplay, tap,
} from 'rxjs';
import {AuthTokenService} from './auth-token.service';
import {Router} from '@angular/router';
import type { TUserCredentialsDTO } from '@sh3pherd/shared-types';
import { BaseHttpService } from './BaseHttpService';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseHttpService {
  private router: Router = inject(Router);
  private tokenService: AuthTokenService =  inject(AuthTokenService);
  private URL: string = this.apiURLService.api().route('auth').build();
  private refreshInFlight$: Observable<string | null> | null = null;


  /**
   *LOGIN
   * @param credentials
   * @returns Observable<boolean> - true if login successful, false otherwise
   */
  login$(credentials: TUserCredentialsDTO): Observable<boolean> {
    return this.http
      .post<{ authToken: string }>(`${this.URL}/login`, credentials, { withCredentials: true })
      .pipe(
        delay(200),
        map(res => res?.authToken ?? null),
        tap(token => {
          if (!token) {
            throw new Error('Missing authToken');
          }
          this.tokenService.setToken(token);
        }),
        map(() => true),
        catchError(err => {
          console.error('Error in login process', err);
          this.tokenService.clear();
          return of(false);
        })
      );
  };


  /**
   * REFRESH SESSION
   * - Uses the refresh token cookie to get a new access token
   * - Ensures only one refresh request is in flight at a time
   * - On success, updates the stored access token
   * - On failure, clears any stored tokens
   * @returns Observable<string | null> - The new access token or null if refresh failed
   */
  refreshSession$(): Observable<string | null> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    this.refreshInFlight$ = this.http
      .post<{ authToken: string }>(`${this.URL}/refresh`, {}, { withCredentials: true })
      .pipe(
        map(res => res?.authToken ?? null),
        tap(token => {
          if (!token) {
            this.tokenService.clear();
          }
          this.tokenService.setToken(token);
        }),
        catchError(() => {
          this.tokenService.clear();
          return of(null);
        }),
        finalize(() => { this.refreshInFlight$ = null; }),
        shareReplay({ bufferSize: 1, refCount: true })
      );

    return this.refreshInFlight$;
  };

  /**
   * LOGOUT
   * - Clears stored tokens
   * - Calls the logout endpoint to clear server-side session
   * - Navigates to the login page
   */
  logout(): void {
    this.tokenService.clear();

    this.http.post(`${this.URL}/logout`, {}, { withCredentials: true })
      .pipe(
        catchError(error => {
          if (error.status === 404) {
            console.warn('[AuthService] Logout endpoint not found, ignoring.', error);
          } else {
            console.error('[AuthService] Error during logout', error);
          }
          return of(null);
        })
      )
      .subscribe(() => {
        console.log('[AuthService] Logout flow finished');
        this.router.createUrlTree(['/login'])
      });
  };



  /**
   * Ensures a valid access token is available.
   * - If the current token is valid and not expiring soon, it is returned.
   * - If the token is missing or about to expire, attempts to refresh the session.
   *
   * @returns Observable<string | null> - The valid access token or null if unable to refresh
   */
  getValidAccessToken$(): Observable<string | null> {
    const t = this.tokenService.getToken();

    if (t && !this.tokenService.willExpireWithin(15)) {
      return of(t);
    }
    return this.refreshSession$();
  };

  /**
   * PING
   * Simple endpoint to check if the server is reachable and the session is valid.
   * @returns Observable<void>
   */
  ping$(): Observable<void> {
    return this.http.get<void>(`${this.URL}/ping`, { withCredentials: true });
  }
}

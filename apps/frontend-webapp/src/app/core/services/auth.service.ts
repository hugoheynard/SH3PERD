import { inject, Injectable } from '@angular/core';
import {
  catchError,
  delay,
  finalize,
  map,
  Observable,
  of,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthTokenService } from './auth-token.service';
import { Router } from '@angular/router';
import { BaseHttpService } from './BaseHttpService';
import { UserContextService } from './user-context.service';
import type {
  TLoginRequestDTO,
  TRegisterUserRequestDTO,
} from '@sh3pherd/shared-types';

/**
 * Result shape for login / register calls.
 *
 * `code` surfaces the backend's `BusinessError.code` when present so
 * callers can react specifically to captcha failures, invalid
 * credentials, locked accounts, etc. without re-parsing HttpErrorResponse.
 */
export type AuthResult =
  | { ok: true }
  | { ok: false; code?: string; status?: number };

function extractErrorCode(err: unknown): { code?: string; status?: number } {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { code?: string } | null | undefined;
    return { code: body?.code, status: err.status };
  }
  return {};
}

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseHttpService {
  private router: Router = inject(Router);
  private tokenService: AuthTokenService = inject(AuthTokenService);
  private URL: string = this.UrlBuilder.api().route('auth').build();
  private refreshInFlight$: Observable<string | null> | null = null;
  private readonly userCtx = inject(UserContextService);

  /**
   *LOGIN
   * @param credentials
   * @returns Observable<AuthResult> — ok=true on success, ok=false with
   *   the backend `code` (e.g. INVALID_CREDENTIALS, CAPTCHA_FAILED,
   *   ACCOUNT_LOCKED) so callers can tailor the UI reaction.
   */
  login$(credentials: TLoginRequestDTO): Observable<AuthResult> {
    return this.http
      .post<{
        authToken: string;
      }>(`${this.URL}/login`, credentials, { withCredentials: true })
      .pipe(
        delay(200),
        map((res) => res?.authToken ?? null),
        tap((token) => {
          if (!token) {
            throw new Error('Missing authToken');
          }
          this.tokenService.setToken(token);
          this.userCtx.getUser();
        }),
        map((): AuthResult => ({ ok: true })),
        catchError((err) => {
          console.error('Error in login process', err);
          this.tokenService.clear();
          return of<AuthResult>({ ok: false, ...extractErrorCode(err) });
        }),
      );
  }

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
      .post<{
        authToken: string;
      }>(`${this.URL}/refresh`, {}, { withCredentials: true })
      .pipe(
        map((res) => res?.authToken ?? null),
        tap((token) => {
          if (!token) {
            this.tokenService.clear();
          }
          this.tokenService.setToken(token);

          if (this.tokenService.getToken()) {
            this.userCtx.getUser();
          }
        }),
        catchError(() => {
          this.tokenService.clear();
          return of(null);
        }),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );

    return this.refreshInFlight$;
  }

  /**
   * LOGOUT
   * - Clears stored tokens
   * - Calls the logout endpoint to clear server-side session
   * - Navigates to the login page
   */
  logout(): void {
    this.tokenService.clear();

    this.http
      .post(`${this.URL}/logout`, {}, { withCredentials: true })
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            console.warn(
              '[AuthService] Logout endpoint not found, ignoring.',
              error,
            );
          } else {
            console.error('[AuthService] Error during logout', error);
          }
          return of(null);
        }),
      )
      .subscribe(() => {
        this.router.navigate(['/login']);
      });
  }

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
  }

  /**
   * REGISTER
   * Creates a new user account with email, password, first name and last name.
   * Returns `AuthResult` so callers can react to CAPTCHA_FAILED /
   * CAPTCHA_REQUIRED specifically (reset the widget, prompt a retry).
   */
  register$(payload: TRegisterUserRequestDTO): Observable<AuthResult> {
    return this.http.post(`${this.URL}/register`, payload).pipe(
      map((): AuthResult => ({ ok: true })),
      catchError((err) =>
        of<AuthResult>({ ok: false, ...extractErrorCode(err) }),
      ),
    );
  }

  /**
   * FORGOT PASSWORD
   * Sends a password reset link. Always succeeds (no email enumeration).
   */
  forgotPassword$(email: string): Observable<boolean> {
    return this.http.post(`${this.URL}/forgot-password`, { email }).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  /**
   * RESET PASSWORD
   * Sets a new password using a reset token.
   */
  resetPassword$(token: string, newPassword: string): Observable<boolean> {
    return this.http
      .post(`${this.URL}/reset-password`, { token, newPassword })
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  }

  /**
   * CHANGE PASSWORD (authenticated)
   * Changes the current password and invalidates all sessions.
   */
  changePassword$(
    currentPassword: string,
    newPassword: string,
  ): Observable<boolean> {
    return this.http
      .post(
        `${this.URL}/change-password`,
        { currentPassword, newPassword },
        { withCredentials: true },
      )
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  }

  /**
   * DEACTIVATE ACCOUNT
   * Soft-deletes the account after password verification. Propagates errors
   * so the caller can display specific messages (wrong password, etc.).
   */
  deactivateAccount$(password: string): Observable<boolean> {
    return this.http
      .post(
        `${this.URL}/deactivate-account`,
        { password },
        { withCredentials: true },
      )
      .pipe(
        map(() => true),
        catchError((err) => throwError(() => err)),
      );
  }

  /**
   * PING
   * Simple endpoint to check if the server is reachable and the session is valid.
   * @returns Observable<void>
   */
  ping$(): Observable<void> {
    return this.http.get<void>(`${this.URL}/ping`, { withCredentials: true });
  }
}

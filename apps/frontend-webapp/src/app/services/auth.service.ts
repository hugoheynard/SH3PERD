import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  delay, delayWhen,
  filter,
  finalize,
  first, interval,
  map,
  Observable,
  of,
  timeout,
} from 'rxjs';
import {TokenService} from './token.service';
import {Router} from '@angular/router';
import type { TUserCredentialsDTO } from '@sh3pherd/shared-types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router: Router = inject(Router);
  private http: HttpClient = inject(HttpClient);
  private tokenService: TokenService =  inject(TokenService);
  isAuthenticatedSignal: WritableSignal<boolean> = signal(false);

  private authState$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** Public observable for authentication state */
  isAuthenticated$(): Observable<boolean> {
    return this.authState$.asObservable();
  };

  /** Marks the session as authenticated */
  private setAuthenticated(value: boolean): void {
    this.authState$.next(value);
  };

  /**
   *LOGIN
   * @param credentials
   */
  login(credentials: TUserCredentialsDTO): Observable<boolean> {
    return this.http.post<{ authToken: string; }>(
      'http://localhost:3000/api/auth/login',
      credentials,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true,
        observe: 'response'
      }
    ).pipe(
      delay(200),
      map(response => {
        const body = response.body;

        if (!response.ok || !body?.authToken) {
          console.error('Connexion failure: invalid response');
          this.setAuthenticated(false);
          return false;
        }

        this.tokenService.setToken(body.authToken);
        this.setAuthenticated(true);
        return true;
      }),
      catchError(error => {
        console.error('Error in login process', error);
        this.setAuthenticated(false);
        return of(false);
      })
    );
  };

  private autoLoginInProgress = false;

  autoLogin(): Observable<void> {
    if (this.autoLoginInProgress) {
      return of(void 0);
    }

    this.autoLoginInProgress = true;
    console.log('[AuthService] Auto-login initiated');

    return this.refreshSession().pipe(
      map((token) => {
        if (token) {
          this.isAuthenticatedSignal.set(true); // 🔐
        } else {
          this.isAuthenticatedSignal.set(false);
        }
      }),
      finalize(() => {
        this.autoLoginInProgress = false;
      }),
      catchError(() => {
        this.isAuthenticatedSignal.set(false);
        return of(void 0);
      })
    );
  }



  private isRefreshing = false;
  private refreshQueue: ((token: string | null) => void)[] = [];

  refreshSession(): Observable<string | null> {

    if (this.isRefreshing) {
      return new Observable(observer => {
        this.refreshQueue.push(token => {
          observer.next(token);
          observer.complete();
        });
      });
    }

    this.isRefreshing = true;

    return this.http.post<any>(
      'http://localhost:3000/api/auth/refresh',
      {},
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true,
        observe: 'response'
      }
    ).pipe(
      delay(200),
      map(response => {
        const body = response.body;

        const token = body?.authToken || null;
        if (token) {
          this.tokenService.setToken(token);
          this.setAuthenticated(true);
        } else {
          this.setAuthenticated(false);
        }

        this.refreshQueue.forEach(cb => cb(token));
        this.refreshQueue = [];

        return token;
      }),
      catchError(err => {
        this.setAuthenticated(false);
        this.refreshQueue.forEach(cb => cb(null));
        this.refreshQueue = [];
        return of(null);
      }),
      finalize(() => {
        this.isRefreshing = false;
      })
    );
  }
  logout(): void {
    this.tokenService.removeToken();
    this.setAuthenticated(false);

    this.http.post('/api/auth/logout', {}, { withCredentials: true })
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
        this.router.navigate(['/login']);
      });
  };


  /** Helper to check if frontend "believes" the session is active */
  shouldHaveSession(): boolean {
    return this.authState$.value;
  }

  private waitForCookie(name: string, ms = 1500): Observable<boolean> {
    return interval(50).pipe(
      map(() => document.cookie.includes(name)),
      filter(Boolean),
      first(),
      timeout({ first: ms }),
      catchError(() => of(false))
    );
  }
}

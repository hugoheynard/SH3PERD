import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, delay, map, Observable, of} from 'rxjs';
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
      delay(1000),
      map(response => {
        const body = response.body;

        if (!response.ok || !body?.authToken) {
          console.error('Connexion failure: invalid response');
          this.isAuthenticatedSignal.set(false);
          return false;
        }

        this.tokenService.setToken(body.authToken);
        this.isAuthenticatedSignal.set(true);
        return true;
      }),
      catchError(error => {
        console.error('Error in login process', error);
        this.isAuthenticatedSignal.set(false);
        return of(false);
      })
    );
  };

  /*
  autoLogin(): Observable<boolean> {
    return this.refreshSession().pipe(
      delay(200),
      map(token => !!token),
      catchError(() => of(false))
    );
  };

   */
  autoLogin(): Observable<void> {
    return this.refreshSession().pipe(
      map(() => void 0), // on retourne juste void
      catchError(() => of(void 0)) // on ignore les erreurs ici
    );
  }

  refreshSession(): Observable<string | null> {
    try {
      return this.http.post<any>(
        'http://localhost:3000/api/auth/refresh',
        {},
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          withCredentials: true,
          observe: 'response'
        }
      ).pipe(
        delay(1000),
        map(response => {
          const body = response.body;

          if (!response.ok || !body?.authToken) {
            console.warn('Session refresh failure: invalid response');
            //this.isAuthenticatedSignal.set(false);
            return null;
          }

          this.tokenService.setToken(body.authToken);
          //this.isAuthenticatedSignal.set(true);
          return body.authToken;
        }),
        catchError(error => {
          //console.error('Error in session refresh', error); //TODO manage error
          return of(null);
        })
      );
    } catch (e) {
      //console.error('Sync error during refresh', e);
      return of(null);
    }
  };

  logout(): void {
    this.tokenService.removeToken();
    this.isAuthenticatedSignal.set(false);

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


  shouldHaveSession(): boolean {
    return this.isAuthenticatedSignal(); // ou true si tu veux tester de façon plus naïve
  }
}

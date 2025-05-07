import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, delay, firstValueFrom, map, Observable, of, switchMap, throwError} from 'rxjs';
import {TokenService} from './token.service';
import { TLoginRequestDTO, TAuthSessionResult} from '@sh3pherd/shared-types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService =  inject(TokenService);

  isAuthenticatedSignal = signal(false);
  private refreshCooldownUntil: number | null = null;

  setRefreshCooldown(ms: number = 200): void {
    this.refreshCooldownUntil = Date.now() + ms;
  }

  canAttemptRefresh(): boolean {
    return !this.refreshCooldownUntil || Date.now() > this.refreshCooldownUntil;
  }

  login(credentials: TLoginRequestDTO): Observable<boolean> {
    return this.http.post<{ authToken: string; user_id: any }>(
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
          //this.isAuthenticatedSignal.set(false);
          return false;
        }

        this.tokenService.setToken(body.authToken);
        //this.isAuthenticatedSignal.set(true);
        return true;
      }),
      catchError(error => {
        console.error('Error in login process', error);
        this.isAuthenticatedSignal.set(false);
        return of(false);
      })
    );
  };

  autoLogin(): Observable<boolean> {
    return this.refreshSession().pipe(
      delay(200),
      map(token => !!token),
      catchError(() => of(false))
    );
  };

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
          console.error('Error in session refresh', error);
          return of(null);
        })
      );
    } catch (e) {
      console.error('Sync error during refresh', e);
      return of(null);
    }
  };

  logout(): void {
    this.tokenService.removeToken();
    //this.isAuthenticatedSignal.set(false);

    this.http.post<any>(
      'http://localhost:3000/api/auth/logout',
      {},
      { withCredentials: true}
    ).pipe(
      catchError(error => {
        console.error('Error during logout', error);
        return of(null);
      })
    ).subscribe(() => {
      console.log('Logout successful');
    });
  };

  loginAndRefresh(credentials: TLoginRequestDTO): Observable<boolean> {
    return this.http.post<any>(
      'http://localhost:3000/api/auth/login',
      credentials,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true,
        observe: 'response'
      }
    ).pipe(
      // Petite pause pour que le cookie soit utilisable
      // Si besoin on peut utiliser delay(100) de RxJS aussi
      delay(200),
      switchMap(() =>
        of(null).pipe(
          delay(100),
          switchMap(() => this.refreshSession())
        )
      ),
      map((token) => {
        if (!token) {
          console.warn('Login + Refresh failed: no token received');
          this.isAuthenticatedSignal.set(false);
          return false;
        }

        this.tokenService.setToken(token);
        this.isAuthenticatedSignal.set(true);
        return true;
      }),
      catchError(error => {
        console.error('Error during loginAndRefresh', error);
        this.isAuthenticatedSignal.set(false);
        return of(false);
      })
    );
  }
}

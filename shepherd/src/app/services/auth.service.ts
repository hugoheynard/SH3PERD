import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, firstValueFrom, map, Observable, of, throwError} from 'rxjs';
import {TokenService} from './token.service';
import { TLoginRequestDTO, TAuthSessionResult} from '@sh3pherd/shared-types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService =  inject(TokenService);

  isAuthenticatedSignal = signal(false);


  login(credentials: TLoginRequestDTO): Observable<boolean> {
    return this.http.post<any>(
      'http://localhost:3000/api/auth/login',
      credentials,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true,
        observe: 'response'
      }
    ).pipe(
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

  autoLogin(): Observable<boolean> {
    return this.refreshSession().pipe(
      map(token => !!token),
      catchError(() => of(false))
    );
  };

  refreshSession(): Observable<string | null> {
    console.log('authService: refreshSession have been called');
    try {
      return this.http.get<any>(
        'http://localhost:3000/api/auth/refresh',
        {
          headers: new HttpHeaders({'Content-Type': 'application/json'}),
          withCredentials: true,
          observe: 'response'
        }
      ).pipe(
        map(response => {
          const body = response.body;

          if (!response.ok || !body?.authToken) {
            console.warn('Session refresh failure: invalid response');
            this.isAuthenticatedSignal.set(false);
            return null;
          }

          this.tokenService.setToken(body.authToken);
          this.isAuthenticatedSignal.set(true);
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
    this.isAuthenticatedSignal.set(false);

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
}

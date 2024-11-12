import {inject, Injectable, signal} from '@angular/core';
import {UserLoginInfos} from '../interfaces/userLoginInfos';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {TokenService} from './token.service';
import {LoginResponse} from '../interfaces/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService =  inject(TokenService);

  isAuthenticatedSignal = signal(false);

  async autoLog_localStorageCheck() {
    const token = this.tokenService.getToken();

    if (!token) {
      return false;
    }

    const validToken = await this.verifyAuthToken(token);

    if (!validToken) {
      return false;
    }

    this.isAuthenticatedSignal.set(true);
    return true;
  };

  async verifyAuthToken(token: string){
    try {
      const response = await firstValueFrom(
        this.http.post<Response>(
          'http://localhost:3000/auth/autoLog',
          { authToken: token },
          {
            headers:
              new HttpHeaders({ 'Content-Type': 'application/json' }),
              observe: 'response'
          }
        )
      );
      return response.ok;

    } catch(e) {
      console.error('Error in token connexion process', e);
      return false;
    }
  };

  async login(credentials: UserLoginInfos) {
    try {
      const response = await firstValueFrom (
        this.http.post<LoginResponse>(
          'http://localhost:3000/auth/login',
          credentials,
          { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
        )
      );

      const { authToken } = response.body

      if (!response.ok && !authToken) {
        console.error('Connexion failure : invalid response');
        return false;
      }

      this.tokenService.setToken(authToken)
      this.isAuthenticatedSignal.set(true);

      return true;
    } catch(e) {
      console.error('Error in connexion process', e);
      return false;
    }
  };

  logout(): void {
    this.tokenService.removeToken();
    this.isAuthenticatedSignal.set(false);
  };

}

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
  }

  logout(): void {
    this.tokenService.removeToken();
    this.isAuthenticatedSignal.set(false);
  }

}

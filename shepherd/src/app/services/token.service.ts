import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private tokenKey: string = 'authToken';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (e) {
      console.error('[TokenService] - Failed to write token to localStorage', e);
    }
  };

  getToken(): string | null {
    try {
      if (isPlatformBrowser(this.platformId)) {
        return localStorage.getItem(this.tokenKey);
      }
      return null;
    } catch (e) {
      console.error('[TokenService] - Failed to get token from localStorage', e);
      return null;
    }
  };

  removeToken(): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem(this.tokenKey);
      }
    } catch (e) {
      console.error('[TokenService] - Failed to delete token from localStorage', e);
    }
  };
}

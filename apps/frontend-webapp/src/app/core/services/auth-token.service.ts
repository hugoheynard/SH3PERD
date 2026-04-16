import { Injectable, signal, type WritableSignal } from '@angular/core';

/**
 * Decode the 'exp' claim from a JWT token.
 * Returns the expiration time in epoch seconds, or null if not present/invalid.
 * @param token
 */
function decodeExpFromJwt(token: string | null): number | null {
  if (!token) {
    return null;
  }
  try {
    const [, payloadB64] = token.split('.');
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json);
    return typeof payload.exp === 'number' ? payload.exp : null; // exp en epoch (sec)
  } catch {
    return null;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthTokenService {
  private accessToken: WritableSignal<string | null> = signal(null);
  private expiresAt: WritableSignal<number | null> = signal<number | null>(null);

  /**
   * Set the token and optionally its explicit expiration time.
   * @param token
   * @param explicitExpiresAt
   */
  setToken(token: string | null, explicitExpiresAt?: number | null): void {
    this.accessToken.set(token);
    this.expiresAt.set(token ? (explicitExpiresAt ?? decodeExpFromJwt(token)) : null);
  };

  /**
   * Get the current token.
   */
  getToken(): string | null {
    return this.accessToken();
  };

  /**
   * Clear the token and expiration.
   */
  clear(): void {
    this.accessToken.set(null);
    this.expiresAt.set(null);
  };

  /**
   * Check if the token will expire within the given leeway (in seconds).
   * Default leeway is 15 seconds.
   * @param leewaySec
   */
  willExpireWithin(leewaySec = 15): boolean {
    const exp = this.expiresAt();

    if (!exp) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return exp - now <= leewaySec;
  };
}

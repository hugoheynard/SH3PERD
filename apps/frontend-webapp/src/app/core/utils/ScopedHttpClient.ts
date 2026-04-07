import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserContextService } from '../services/user-context.service';

/**
 * Contextual, stateless HTTP client with fluent API.
 *
 * Reads the current contract ID from `UserContextService.currentContractId`
 * **at call time** (not at injection time), so workspace switches are
 * picked up immediately.
 *
 * @example
 * ```ts
 * this.scopedHttp.withContract().patch('/api/...', data);
 * this.scopedHttp.withContract().withFeature('import').post('/api/...', data);
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ScopedHttpClient {
  private readonly http = inject(HttpClient);
  private readonly userCtx = inject(UserContextService);

  /** Create a scoped request builder with the given headers. */
  private scoped(headers: HttpHeaders) {
    const self = this;

    return {
      withHeader(key: string, value: string) {
        return self.scoped(headers.set(key, value));
      },

      withFeature(featureName: string) {
        return self.scoped(headers.set('X-Feature', featureName));
      },

      withContract() {
        const contractId = self.userCtx.currentContractId();
        if (!contractId) return self.scoped(headers);
        return self.scoped(headers.set('X-Contract-Id', contractId));
      },

      get<T>(url: string, options: { headers?: HttpHeaders; params?: HttpParams } = {}): Observable<T> {
        return self.http.get<T>(url, { ...options, headers });
      },

      post<T>(url: string, body: unknown, options: { headers?: HttpHeaders; params?: HttpParams } = {}): Observable<T> {
        return self.http.post<T>(url, body, { ...options, headers });
      },

      put<T>(url: string, body: unknown, options: { headers?: HttpHeaders; params?: HttpParams } = {}): Observable<T> {
        return self.http.put<T>(url, body, { ...options, headers });
      },

      patch<T>(url: string, body: unknown, options: { headers?: HttpHeaders; params?: HttpParams } = {}): Observable<T> {
        return self.http.patch<T>(url, body, { ...options, headers });
      },

      delete<T>(url: string, options: { headers?: HttpHeaders; params?: HttpParams } = {}): Observable<T> {
        return self.http.delete<T>(url, { ...options, headers });
      },
    };
  }

  /** Entry point — creates a scope with the current contract header. */
  withContract() {
    const contractId = this.userCtx.currentContractId();
    let headers = new HttpHeaders();
    if (contractId) {
      headers = headers.set('X-Contract-Id', contractId);
    }
    return this.scoped(headers);
  }

  /** Entry point — scope with a custom header (no contract). */
  withHeader(key: string, value: string) {
    return this.scoped(new HttpHeaders().set(key, value));
  }

  /** Entry point — scope with a feature header (no contract). */
  withFeature(featureName: string) {
    return this.scoped(new HttpHeaders().set('X-Feature', featureName));
  }
}

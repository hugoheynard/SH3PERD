import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkspaceContextService } from '../services/workspace-context.service';

/**
 * HttpClient contextuel et stateless, avec API fluide
 * Ex: this.http.withContract().withHeader('X-Feature', 'import').post('/api/...')
 */
@Injectable({ providedIn: 'root' })
export class ScopedHttpClient {
  private readonly http = inject(HttpClient);
  private readonly contractContext = inject(WorkspaceContextService);

  /** Crée un nouveau scope avec les headers donnés */
  private scoped(headers: HttpHeaders) {
    const self = this;

    return {
      /** Ajouter un header custom */
      withHeader(key: string, value: string) {
        const newHeaders = headers.set(key, value);
        return self.scoped(newHeaders);
      },

      /**
       * Adds a feature header to the request.
       * @param featureName
       */
      withFeature(featureName: string) {
        return self.scoped(headers.set('X-Feature', featureName));
      },

      withContract() {
        const contractId = self.contractContext.currentContractId();
        if (!contractId) {
          return self.scoped(headers);
        }
        return self.scoped(headers.set('X-Contract-Id', contractId));
      },

      /** Effectuer une requête GET */
      get<T>(url: string, options: { headers?: HttpHeaders; params?: HttpParams } = {}): Observable<T> {
        return self.http.get<T>(url, { ...options, headers });
      },

      /** POST */
      post<T>(
        url: string,
        body: unknown,
        options: { headers?: HttpHeaders; params?: HttpParams } = {},
      ): Observable<T> {
        return self.http.post<T>(url, body, { ...options, headers });
      },

      /** PUT */
      put<T>(
        url: string,
        body: unknown,
        options: { headers?: HttpHeaders; params?: HttpParams } = {},
      ): Observable<T> {
        return self.http.put<T>(url, body, { ...options, headers });
      },

      /** PATCH */
      patch<T>(
        url: string,
        body: unknown,
        options: { headers?: HttpHeaders; params?: HttpParams } = {},
      ): Observable<T> {
        return self.http.patch<T>(url, body, { ...options, headers });
      },

      /** DELETE */
      delete<T>(url: string, options: { headers?: HttpHeaders; params?: HttpParams } = {}): Observable<T> {
        return self.http.delete<T>(url, { ...options, headers });
      },
    };
  }

  /** Point d’entrée de la DSL : crée un scope contractuel */
  withContract() {
    const contractId = this.contractContext.currentContractId();
    let headers = new HttpHeaders();

    if (contractId) {
      headers = headers.set('X-Contract-Id', contractId);
    }

    return this.scoped(headers);
  };

  /** Point d’entrée sans contrat (custom headers uniquement) */
  withHeader(key: string, value: string) {
    return this.scoped(new HttpHeaders().set(key, value));
  }

  /** 🔹 Scope direct pour une feature spécifique (sans contrat) */
  withFeature(featureName: string) {
    return this.scoped(new HttpHeaders().set('X-Feature', featureName));
  }
}

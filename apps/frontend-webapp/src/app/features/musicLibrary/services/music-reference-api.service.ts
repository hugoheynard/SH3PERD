import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError, of } from 'rxjs';
import { BaseHttpService } from '../../../core/services/BaseHttpService';
import type {
  TCreateMusicReferenceRequestDTO,
  TMusicReferenceDomainModel,
  TApiResponse,
} from '@sh3pherd/shared-types';

/**
 * API service for music references.
 *
 * Endpoints:
 * - `GET  /api/protected/music-reference/dynamic-search?q=...` → fuzzy search
 * - `POST /api/protected/music-reference` → create one
 */
@Injectable({ providedIn: 'root' })
export class MusicReferenceApiService extends BaseHttpService {

  private readonly URL = this.UrlBuilder.apiProtectedRoute('music/references').build();

  /**
   * Fuzzy search references by query string (matches title or artist).
   */
  search(query: string): Observable<TMusicReferenceDomainModel[]> {
    return this.http
      .get<TApiResponse<TMusicReferenceDomainModel[]>>(
        `${this.URL}/dynamic-search`,
        { params: { q: query }, withCredentials: true },
      )
      .pipe(
        map(res => res?.data ?? []),
        catchError(() => {
          return of([]);
        }),
      );
  }

  /**
   * Creates a new music reference.
   * Returns the created domain model on success.
   */
  create(payload: TCreateMusicReferenceRequestDTO): Observable<TMusicReferenceDomainModel> {
    return this.http
      .post<TApiResponse<TMusicReferenceDomainModel>>(
        this.URL,
        { payload },
        { withCredentials: true },
      )
      .pipe(
        map(res => {
          if (!res?.data) {
            throw new Error('INVALID_RESPONSE');
          }
          return res.data;
        }),
        catchError((err) => {
          this.toast.show('Failed to create reference', 'error');
          return throwError(() => err);
        }),
      );
  }
}

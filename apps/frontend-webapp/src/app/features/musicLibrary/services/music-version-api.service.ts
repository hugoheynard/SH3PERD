import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { BaseHttpService } from '../../../core/services/BaseHttpService';
import type {
  TApiResponse,
  TMusicVersionDomainModel,
  TCreateMusicVersionPayload,
  TUpdateMusicVersionPayload,
  TMusicVersionId,
} from '@sh3pherd/shared-types';

/**
 * API service for music version CRUD.
 *
 * Endpoints:
 * - `POST   /api/protected/music/versions`      → create
 * - `PATCH  /api/protected/music/versions/:id`   → update
 * - `DELETE /api/protected/music/versions/:id`   → delete
 */
@Injectable({ providedIn: 'root' })
export class MusicVersionApiService extends BaseHttpService {

  private readonly URL = this.UrlBuilder.apiProtectedRoute('music/versions').build();

  /**
   * Create a new version for a music reference.
   */
  create(payload: TCreateMusicVersionPayload): Observable<TMusicVersionDomainModel> {
    return this.http
      .post<TApiResponse<TMusicVersionDomainModel>>(
        this.URL,
        { payload },
        { withCredentials: true },
      )
      .pipe(
        map(res => {
          if (!res?.data) throw new Error('INVALID_RESPONSE');
          return res.data;
        }),
        catchError(err => {
          this.toast.show('Failed to create version', 'error');
          return throwError(() => err);
        }),
      );
  }

  /**
   * Partial update a version's metadata.
   */
  update(versionId: TMusicVersionId, payload: TUpdateMusicVersionPayload): Observable<TMusicVersionDomainModel> {
    return this.http
      .patch<TApiResponse<TMusicVersionDomainModel>>(
        `${this.URL}/${versionId}`,
        { payload },
        { withCredentials: true },
      )
      .pipe(
        map(res => {
          if (!res?.data) throw new Error('INVALID_RESPONSE');
          return res.data;
        }),
        catchError(err => {
          this.toast.show('Failed to update version', 'error');
          return throwError(() => err);
        }),
      );
  }

  /**
   * Delete a version and all its tracks.
   */
  delete(versionId: TMusicVersionId): Observable<boolean> {
    return this.http
      .delete<TApiResponse<boolean>>(
        `${this.URL}/${versionId}`,
        { withCredentials: true },
      )
      .pipe(
        map(res => res?.data ?? false),
        catchError(err => {
          this.toast.show('Failed to delete version', 'error');
          return throwError(() => err);
        }),
      );
  }
}

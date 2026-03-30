import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { BaseHttpService } from '../../../core/services/BaseHttpService';
import type {
  TMusicRepertoireEntryDomainModel,
  TMusicReferenceId,
  TRepertoireEntryId,
  TApiResponse,
} from '@sh3pherd/shared-types';

/**
 * API service for music repertoire entries.
 *
 * Endpoints:
 * - `GET    /api/protected/music/repertoire/me`    → user's entries
 * - `POST   /api/protected/music/repertoire`       → add entry
 * - `DELETE  /api/protected/music/repertoire/:id`   → remove entry
 */
@Injectable({ providedIn: 'root' })
export class MusicRepertoireApiService extends BaseHttpService {

  private readonly URL = this.UrlBuilder.apiProtectedRoute('music/repertoire').build();

  /**
   * Get all repertoire entries for the authenticated user.
   */
  getMyRepertoire(): Observable<TMusicRepertoireEntryDomainModel[]> {
    return this.http
      .get<TApiResponse<TMusicRepertoireEntryDomainModel[]>>(
        `${this.URL}/me`,
        { withCredentials: true },
      )
      .pipe(
        map(res => res?.data ?? []),
        catchError(err => {
          console.error('[RepertoireApi] getMyRepertoire failed', err);
          return throwError(() => err);
        }),
      );
  }

  /**
   * Add a music reference to the user's repertoire.
   * @param referenceId - The music reference to add.
   * @returns The created repertoire entry.
   */
  addEntry(referenceId: TMusicReferenceId): Observable<TMusicRepertoireEntryDomainModel> {
    return this.http
      .post<TApiResponse<TMusicRepertoireEntryDomainModel>>(
        this.URL,
        { payload: { musicReference_id: referenceId } },
        { withCredentials: true },
      )
      .pipe(
        map(res => {
          if (!res?.data) throw new Error('INVALID_RESPONSE');
          return res.data;
        }),
        catchError(err => {
          console.error('[RepertoireApi] addEntry failed', err);
          this.toast.show('Failed to add to repertoire', 'error');
          return throwError(() => err);
        }),
      );
  }

  /**
   * Remove a repertoire entry.
   * @param entryId - The entry to remove.
   */
  deleteEntry(entryId: TRepertoireEntryId): Observable<boolean> {
    return this.http
      .delete<TApiResponse<boolean>>(
        `${this.URL}/${entryId}`,
        { withCredentials: true },
      )
      .pipe(
        map(res => res?.data ?? false),
        catchError(err => {
          console.error('[RepertoireApi] deleteEntry failed', err);
          this.toast.show('Failed to remove entry', 'error');
          return throwError(() => err);
        }),
      );
  }
}

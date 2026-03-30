import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { BaseHttpService } from '../../../core/services/BaseHttpService';
import type { TApiResponse, TUserMusicLibraryViewModel } from '@sh3pherd/shared-types';

/**
 * API service for fetching the user's full music library.
 *
 * Endpoint:
 * - `GET /api/protected/music/library/me` → user's library (entries + refs + versions)
 */
@Injectable({ providedIn: 'root' })
export class MusicLibraryApiService extends BaseHttpService {

  private readonly URL = this.UrlBuilder.apiProtectedRoute('music/library').build();

  /**
   * Fetch the authenticated user's full music library.
   * Returns the entry-centric view model with references and versions pre-joined.
   */
  getMyLibrary(): Observable<TUserMusicLibraryViewModel> {
    return this.http
      .get<TApiResponse<TUserMusicLibraryViewModel>>(
        `${this.URL}/me`,
        { withCredentials: true },
      )
      .pipe(
        map(res => {
          if (!res?.data) throw new Error('INVALID_RESPONSE');
          return res.data;
        }),
        catchError(err => {
          console.error('[MusicLibraryApi] getMyLibrary failed', err);
          return throwError(() => err);
        }),
      );
  }
}

import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError, of } from 'rxjs';
import { BaseHttpService } from '../../../core/services/BaseHttpService';
import type {
  TApiResponse,
  TUserMusicLibraryViewModel,
  TMusicTabConfigsDomainModel,
  TMusicTabConfig,
  TMusicSavedTabConfig,
} from '@sh3pherd/shared-types';

/**
 * API service for the music library.
 *
 * Endpoints:
 * - `GET    /api/protected/music/library/me`          → user's library
 * - `GET    /api/protected/music/tab-configs`          → user's tab configs
 * - `PUT    /api/protected/music/tab-configs`          → save tab configs
 * - `DELETE /api/protected/music/tab-configs`          → delete tab configs
 */
@Injectable({ providedIn: 'root' })
export class MusicLibraryApiService extends BaseHttpService {

  private readonly URL = this.UrlBuilder.apiProtectedRoute('music/library').build();
  private readonly TAB_CONFIGS_URL = this.UrlBuilder.apiProtectedRoute('music/tab-configs').build();

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

  getTabConfigs(): Observable<TMusicTabConfigsDomainModel | null> {
    return this.http
      .get<TApiResponse<TMusicTabConfigsDomainModel | null>>(
        this.TAB_CONFIGS_URL,
        { withCredentials: true },
      )
      .pipe(
        map(res => res?.data ?? null),
        catchError(err => {
          console.error('[MusicLibraryApi] getTabConfigs failed', err);
          return of(null);
        }),
      );
  }

  saveTabConfigs(payload: {
    tabs: TMusicTabConfig[];
    activeTabId: string;
    activeConfigId?: string;
    savedTabConfigs: TMusicSavedTabConfig[];
  }): Observable<boolean> {
    return this.http
      .put<TApiResponse<boolean>>(
        this.TAB_CONFIGS_URL,
        { payload },
        { withCredentials: true },
      )
      .pipe(
        map(res => res?.data ?? false),
        catchError(err => {
          console.error('[MusicLibraryApi] saveTabConfigs failed', err);
          return of(false);
        }),
      );
  }

  deleteTabConfigs(): Observable<boolean> {
    return this.http
      .delete<TApiResponse<boolean>>(
        this.TAB_CONFIGS_URL,
        { withCredentials: true },
      )
      .pipe(
        map(res => res?.data ?? false),
        catchError(err => {
          console.error('[MusicLibraryApi] deleteTabConfigs failed', err);
          return of(false);
        }),
      );
  }
}

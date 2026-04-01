import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { BaseHttpService } from '../../../core/services/BaseHttpService';
import type {
  TApiResponse,
  TPlaylistSummaryViewModel,
  TPlaylistDetailViewModel,
  TPlaylistDomainModel,
  TPlaylistTrackDomainModel,
  TCreatePlaylistPayload,
  TUpdatePlaylistPayload,
  TAddPlaylistTrackPayload,
  TReorderPlaylistTrackPayload,
} from '@sh3pherd/shared-types';

/**
 * API service for playlists.
 *
 * Endpoints:
 * - `POST   /api/protected/playlists/`                      → create playlist
 * - `GET    /api/protected/playlists/me`                     → user's playlists
 * - `GET    /api/protected/playlists/:id`                    → playlist detail
 * - `PATCH  /api/protected/playlists/:id`                    → update playlist
 * - `DELETE /api/protected/playlists/:id`                    → delete playlist
 * - `POST   /api/protected/playlists/:id/tracks`             → add track
 * - `DELETE /api/protected/playlists/:id/tracks/:trackId`    → remove track
 * - `PATCH  /api/protected/playlists/:id/tracks/:trackId/reorder` → reorder track
 */
@Injectable({ providedIn: 'root' })
export class PlaylistsApiService extends BaseHttpService {

  private readonly URL = this.UrlBuilder.apiProtectedRoute('playlists').build();

  /* ─── Playlists ───────────────────────────────────────── */

  getMyPlaylists(): Observable<TPlaylistSummaryViewModel[]> {
    return this.http
      .get<TApiResponse<TPlaylistSummaryViewModel[]>>(
        `${this.URL}/me`,
        { withCredentials: true },
      )
      .pipe(
        map(res => {
          if (!res?.data) throw new Error('INVALID_RESPONSE');
          return res.data;
        }),
        catchError(err => {
          console.error('[PlaylistsApi] getMyPlaylists failed', err);
          return throwError(() => err);
        }),
      );
  }

  getPlaylistDetail(id: string): Observable<TPlaylistDetailViewModel> {
    return this.http
      .get<TApiResponse<TPlaylistDetailViewModel>>(
        `${this.URL}/${id}`,
        { withCredentials: true },
      )
      .pipe(
        map(res => {
          if (!res?.data) throw new Error('INVALID_RESPONSE');
          return res.data;
        }),
        catchError(err => {
          console.error('[PlaylistsApi] getPlaylistDetail failed', err);
          return throwError(() => err);
        }),
      );
  }

  createPlaylist(payload: TCreatePlaylistPayload): Observable<TPlaylistDomainModel> {
    return this.http
      .post<TApiResponse<TPlaylistDomainModel>>(
        this.URL,
        payload,
        { withCredentials: true },
      )
      .pipe(
        map(res => {
          if (!res?.data) throw new Error('INVALID_RESPONSE');
          return res.data;
        }),
        catchError(err => {
          console.error('[PlaylistsApi] createPlaylist failed', err);
          return throwError(() => err);
        }),
      );
  }

  updatePlaylist(id: string, payload: TUpdatePlaylistPayload): Observable<TPlaylistDomainModel> {
    return this.http
      .patch<TApiResponse<TPlaylistDomainModel>>(
        `${this.URL}/${id}`,
        payload,
        { withCredentials: true },
      )
      .pipe(
        map(res => {
          if (!res?.data) throw new Error('INVALID_RESPONSE');
          return res.data;
        }),
        catchError(err => {
          console.error('[PlaylistsApi] updatePlaylist failed', err);
          return throwError(() => err);
        }),
      );
  }

  deletePlaylist(id: string): Observable<void> {
    return this.http
      .delete<TApiResponse<void>>(
        `${this.URL}/${id}`,
        { withCredentials: true },
      )
      .pipe(
        map(() => void 0),
        catchError(err => {
          console.error('[PlaylistsApi] deletePlaylist failed', err);
          return throwError(() => err);
        }),
      );
  }

  /* ─── Tracks ──────────────────────────────────────────── */

  addTrack(playlistId: string, payload: TAddPlaylistTrackPayload): Observable<TPlaylistTrackDomainModel> {
    return this.http
      .post<TApiResponse<TPlaylistTrackDomainModel>>(
        `${this.URL}/${playlistId}/tracks`,
        payload,
        { withCredentials: true },
      )
      .pipe(
        map(res => {
          if (!res?.data) throw new Error('INVALID_RESPONSE');
          return res.data;
        }),
        catchError(err => {
          console.error('[PlaylistsApi] addTrack failed', err);
          return throwError(() => err);
        }),
      );
  }

  removeTrack(playlistId: string, trackId: string): Observable<void> {
    return this.http
      .delete<TApiResponse<void>>(
        `${this.URL}/${playlistId}/tracks/${trackId}`,
        { withCredentials: true },
      )
      .pipe(
        map(() => void 0),
        catchError(err => {
          console.error('[PlaylistsApi] removeTrack failed', err);
          return throwError(() => err);
        }),
      );
  }

  reorderTrack(playlistId: string, trackId: string, payload: TReorderPlaylistTrackPayload): Observable<void> {
    return this.http
      .patch<TApiResponse<void>>(
        `${this.URL}/${playlistId}/tracks/${trackId}/reorder`,
        payload,
        { withCredentials: true },
      )
      .pipe(
        map(() => void 0),
        catchError(err => {
          console.error('[PlaylistsApi] reorderTrack failed', err);
          return throwError(() => err);
        }),
      );
  }
}

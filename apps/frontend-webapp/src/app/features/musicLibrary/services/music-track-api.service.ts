import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { BaseHttpService } from '../../../core/services/BaseHttpService';
import type {
  TApiResponse,
  TMusicVersionId,
  TVersionTrackId,
  TVersionTrackDomainModel,
} from '@sh3pherd/shared-types';

/**
 * API service for music track operations (upload, delete, favorite, download).
 *
 * Endpoints (under `/api/protected/music/versions/:versionId/tracks`):
 * - `POST   /`                    → upload track file
 * - `DELETE /:trackId`            → delete track
 * - `PATCH  /:trackId/favorite`   → set track as favorite
 * - `GET    /:trackId/download`   → get presigned download URL
 */
@Injectable({ providedIn: 'root' })
export class MusicTrackApiService extends BaseHttpService {

  private trackUrl(versionId: TMusicVersionId): string {
    return this.UrlBuilder.apiProtectedRoute(`music/versions/${versionId}/tracks`).build();
  }

  /**
   * Upload a track file to a version. The file is sent as multipart/form-data
   * and stored in R2/S3. Returns the created track domain model.
   */
  upload(versionId: TMusicVersionId, file: File): Observable<TVersionTrackDomainModel> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http
      .post<TApiResponse<TVersionTrackDomainModel>>(
        this.trackUrl(versionId),
        formData,
        { withCredentials: true },
      )
      .pipe(
        map(res => {
          if (!res?.data) throw new Error('INVALID_RESPONSE');
          return res.data;
        }),
        catchError(err => {
          console.error('[MusicTrackApi] upload failed', err);
          this.toast.show('Failed to upload track', 'error');
          return throwError(() => err);
        }),
      );
  }

  /**
   * Delete a track from a version. Removes from both storage (R2/S3) and database.
   */
  delete(versionId: TMusicVersionId, trackId: TVersionTrackId): Observable<boolean> {
    return this.http
      .delete<TApiResponse<boolean>>(
        `${this.trackUrl(versionId)}/${trackId}`,
        { withCredentials: true },
      )
      .pipe(
        map(res => res?.data ?? false),
        catchError(err => {
          console.error('[MusicTrackApi] delete failed', err);
          this.toast.show('Failed to delete track', 'error');
          return throwError(() => err);
        }),
      );
  }

  /**
   * Set a track as the favorite for its version.
   */
  setFavorite(versionId: TMusicVersionId, trackId: TVersionTrackId): Observable<boolean> {
    return this.http
      .patch<TApiResponse<boolean>>(
        `${this.trackUrl(versionId)}/${trackId}/favorite`,
        {},
        { withCredentials: true },
      )
      .pipe(
        map(res => res?.data ?? false),
        catchError(err => {
          console.error('[MusicTrackApi] setFavorite failed', err);
          this.toast.show('Failed to set favorite', 'error');
          return throwError(() => err);
        }),
      );
  }

  /**
   * Get a presigned download URL for a track. URL expires after 1 hour.
   */
  getDownloadUrl(versionId: TMusicVersionId, trackId: TVersionTrackId): Observable<string> {
    return this.http
      .get<TApiResponse<{ url: string }>>(
        `${this.trackUrl(versionId)}/${trackId}/download`,
        { withCredentials: true },
      )
      .pipe(
        map(res => {
          if (!res?.data?.url) throw new Error('INVALID_RESPONSE');
          return res.data.url;
        }),
        catchError(err => {
          console.error('[MusicTrackApi] getDownloadUrl failed', err);
          this.toast.show('Failed to get download URL', 'error');
          return throwError(() => err);
        }),
      );
  }
}

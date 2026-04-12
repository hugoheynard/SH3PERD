import { Injectable } from '@angular/core';
import { map, catchError, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/BaseHttpService';
import type {
  TApiResponse,
  TMusicVersionId,
  TVersionTrackId,
  TVersionTrackDomainModel,
  TMasteringTargetSpecs,
} from '@sh3pherd/shared-types';
import type { TMasteringResult } from './mastering.types';

/**
 * API service for mastering operations.
 *
 * Two endpoints:
 * - `POST /music/versions/:versionId/tracks/:trackId/master`
 *   → standard loudnorm mastering (existing backend)
 * - `POST /music/versions/:versionId/tracks/:trackId/ai-master`
 *   → AI mastering via DeepAFx-ST (future backend, wired but will
 *     404 until the Python worker is deployed)
 */
@Injectable({ providedIn: 'root' })
export class MasteringApiService extends BaseHttpService {

  private trackUrl(versionId: TMusicVersionId, trackId: TVersionTrackId): string {
    return this.UrlBuilder
      .apiProtectedRoute(`music/versions/${versionId}/tracks/${trackId}`)
      .build();
  }

  /**
   * Standard mastering — ffmpeg loudnorm pass-2.
   * Returns the newly created mastered track.
   */
  masterStandard(
    versionId: TMusicVersionId,
    trackId: TVersionTrackId,
    target: TMasteringTargetSpecs,
  ): Observable<TMasteringResult> {
    return this.scopedHttp.withContract()
      .post<TApiResponse<TVersionTrackDomainModel>>(
        `${this.trackUrl(versionId, trackId)}/master`,
        target,
      )
      .pipe(
        map(res => {
          if (!res?.data) throw new Error('INVALID_RESPONSE');
          return { track: res.data } satisfies TMasteringResult;
        }),
        catchError(err => {
          this.toast.show('Mastering failed', 'error');
          return throwError(() => err);
        }),
      );
  }

  /**
   * AI mastering — DeepAFx-ST autodiff + loudnorm.
   * Returns the mastered track + the predicted DSP parameters.
   *
   * NOTE: this endpoint doesn't exist yet in the backend. Calling it
   * will 404 until Phase 2-3 of the AI mastering TODO is implemented.
   * The UI is built ahead of the backend so it's ready to wire.
   */
  masterAi(
    versionId: TMusicVersionId,
    trackId: TVersionTrackId,
    body: {
      mode: 'reference' | 'auto';
      referenceVersionId?: TMusicVersionId;
      referenceTrackId?: TVersionTrackId;
      preset?: string;
      targetLUFS?: number;
      targetTP?: number;
      targetLRA?: number;
    },
  ): Observable<TMasteringResult> {
    return this.scopedHttp.withContract()
      .post<TApiResponse<TMasteringResult>>(
        `${this.trackUrl(versionId, trackId)}/ai-master`,
        body,
      )
      .pipe(
        map(res => {
          if (!res?.data) throw new Error('INVALID_RESPONSE');
          return res.data;
        }),
        catchError(err => {
          this.toast.show('AI mastering failed', 'error');
          return throwError(() => err);
        }),
      );
  }
}

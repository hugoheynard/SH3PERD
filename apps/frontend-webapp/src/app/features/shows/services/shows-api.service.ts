import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { BaseHttpService } from '../../../core/services/BaseHttpService';
import type {
  TApiResponse,
  TCreateShowPayload,
  TMusicVersionId,
  TPlaylistColor,
  TPlaylistDomainModel,
  TPlaylistId,
  TShowDetailViewModel,
  TShowDomainModel,
  TShowId,
  TShowSectionId,
  TShowSectionItemId,
  TShowSectionItemKind,
  TShowSectionTarget,
  TShowSummaryViewModel,
  TUpdateShowPayload,
} from '@sh3pherd/shared-types';

/**
 * API service for shows.
 *
 * Endpoints:
 *   POST   /api/protected/shows/                                           → create
 *   GET    /api/protected/shows/me                                         → list summaries
 *   GET    /api/protected/shows/:id                                        → detail
 *   PATCH  /api/protected/shows/:id                                        → update meta
 *   DELETE /api/protected/shows/:id                                        → delete
 *   POST   /api/protected/shows/:id/duplicate                              → deep copy
 *   POST   /api/protected/shows/:id/sections                               → add section
 *   PATCH  /api/protected/shows/:id/sections/:sectionId                    → update section
 *   DELETE /api/protected/shows/:id/sections/:sectionId                    → remove section
 *   PATCH  /api/protected/shows/:id/sections/reorder                       → reorder sections
 *   POST   /api/protected/shows/:id/sections/:sectionId/items              → add item
 *   DELETE /api/protected/shows/:id/sections/:sectionId/items/:itemId      → remove item
 *   PATCH  /api/protected/shows/:id/sections/:sectionId/items/reorder      → reorder items
 *   PATCH  /api/protected/shows/:id/items/:itemId/move                     → move across sections
 *   POST   /api/protected/shows/:id/played                                 → mark whole show played
 *   POST   /api/protected/shows/:id/sections/:sectionId/played             → mark section played
 *   POST   /api/protected/shows/:id/sections/:sectionId/to-playlist        → convert to playlist
 */
@Injectable({ providedIn: 'root' })
export class ShowsApiService extends BaseHttpService {
  private readonly URL = this.UrlBuilder.apiProtectedRoute('shows').build();

  // ── shows ──────────────────────────────────────────────

  getMyShows(): Observable<TShowSummaryViewModel[]> {
    return this.http
      .get<
        TApiResponse<TShowSummaryViewModel[]>
      >(`${this.URL}/me`, { withCredentials: true })
      .pipe(mapData());
  }

  getShowDetail(id: TShowId): Observable<TShowDetailViewModel> {
    return this.http
      .get<
        TApiResponse<TShowDetailViewModel>
      >(`${this.URL}/${id}`, { withCredentials: true })
      .pipe(mapData());
  }

  createShow(payload: TCreateShowPayload): Observable<TShowDomainModel> {
    return this.http
      .post<
        TApiResponse<TShowDomainModel>
      >(this.URL, { payload }, { withCredentials: true })
      .pipe(mapData());
  }

  updateShow(
    id: TShowId,
    payload: TUpdateShowPayload,
  ): Observable<TShowDomainModel> {
    return this.http
      .patch<
        TApiResponse<TShowDomainModel>
      >(`${this.URL}/${id}`, { payload }, { withCredentials: true })
      .pipe(mapData());
  }

  deleteShow(id: TShowId): Observable<void> {
    return this.http
      .delete<
        TApiResponse<void>
      >(`${this.URL}/${id}`, { withCredentials: true })
      .pipe(
        map(() => void 0),
        passError(),
      );
  }

  duplicateShow(id: TShowId): Observable<TShowDomainModel> {
    return this.http
      .post<
        TApiResponse<TShowDomainModel>
      >(`${this.URL}/${id}/duplicate`, {}, { withCredentials: true })
      .pipe(mapData());
  }

  // ── sections ───────────────────────────────────────────

  addSection(
    showId: TShowId,
    payload: { name: string; target?: TShowSectionTarget },
  ): Observable<TShowDomainModel> {
    return this.http
      .post<
        TApiResponse<TShowDomainModel>
      >(`${this.URL}/${showId}/sections`, { payload }, { withCredentials: true })
      .pipe(mapData());
  }

  updateSection(
    showId: TShowId,
    sectionId: TShowSectionId,
    payload: { name?: string; target?: TShowSectionTarget | null },
  ): Observable<TShowDomainModel> {
    return this.http
      .patch<
        TApiResponse<TShowDomainModel>
      >(`${this.URL}/${showId}/sections/${sectionId}`, { payload }, { withCredentials: true })
      .pipe(mapData());
  }

  removeSection(
    showId: TShowId,
    sectionId: TShowSectionId,
  ): Observable<TShowDomainModel> {
    return this.http
      .delete<
        TApiResponse<TShowDomainModel>
      >(`${this.URL}/${showId}/sections/${sectionId}`, { withCredentials: true })
      .pipe(mapData());
  }

  reorderSections(
    showId: TShowId,
    orderedIds: TShowSectionId[],
  ): Observable<TShowDomainModel> {
    return this.http
      .patch<
        TApiResponse<TShowDomainModel>
      >(`${this.URL}/${showId}/sections/reorder`, { payload: { ordered_ids: orderedIds } }, { withCredentials: true })
      .pipe(mapData());
  }

  // ── items ──────────────────────────────────────────────

  addItem(
    showId: TShowId,
    sectionId: TShowSectionId,
    payload: {
      kind: TShowSectionItemKind;
      ref_id: TMusicVersionId | TPlaylistId;
      position?: number;
    },
  ): Observable<TShowDomainModel> {
    return this.http
      .post<
        TApiResponse<TShowDomainModel>
      >(`${this.URL}/${showId}/sections/${sectionId}/items`, { payload }, { withCredentials: true })
      .pipe(mapData());
  }

  removeItem(
    showId: TShowId,
    sectionId: TShowSectionId,
    itemId: TShowSectionItemId,
  ): Observable<TShowDomainModel> {
    return this.http
      .delete<
        TApiResponse<TShowDomainModel>
      >(`${this.URL}/${showId}/sections/${sectionId}/items/${itemId}`, { withCredentials: true })
      .pipe(mapData());
  }

  reorderItems(
    showId: TShowId,
    sectionId: TShowSectionId,
    orderedIds: TShowSectionItemId[],
  ): Observable<TShowDomainModel> {
    return this.http
      .patch<
        TApiResponse<TShowDomainModel>
      >(`${this.URL}/${showId}/sections/${sectionId}/items/reorder`, { payload: { ordered_ids: orderedIds } }, { withCredentials: true })
      .pipe(mapData());
  }

  moveItem(
    showId: TShowId,
    itemId: TShowSectionItemId,
    payload: { from: TShowSectionId; to: TShowSectionId; position?: number },
  ): Observable<TShowDomainModel> {
    return this.http
      .patch<
        TApiResponse<TShowDomainModel>
      >(`${this.URL}/${showId}/items/${itemId}/move`, { payload }, { withCredentials: true })
      .pipe(mapData());
  }

  // ── played ─────────────────────────────────────────────

  markShowPlayed(
    showId: TShowId,
    playedAt?: number,
  ): Observable<TShowDomainModel> {
    return this.http
      .post<
        TApiResponse<TShowDomainModel>
      >(`${this.URL}/${showId}/played`, { payload: { playedAt } }, { withCredentials: true })
      .pipe(mapData());
  }

  markSectionPlayed(
    showId: TShowId,
    sectionId: TShowSectionId,
    playedAt?: number,
  ): Observable<TShowDomainModel> {
    return this.http
      .post<
        TApiResponse<TShowDomainModel>
      >(`${this.URL}/${showId}/sections/${sectionId}/played`, { payload: { playedAt } }, { withCredentials: true })
      .pipe(mapData());
  }

  // ── convert ────────────────────────────────────────────

  convertSectionToPlaylist(
    showId: TShowId,
    sectionId: TShowSectionId,
    payload: { name?: string; color?: TPlaylistColor },
  ): Observable<TPlaylistDomainModel> {
    return this.http
      .post<
        TApiResponse<TPlaylistDomainModel>
      >(`${this.URL}/${showId}/sections/${sectionId}/to-playlist`, { payload }, { withCredentials: true })
      .pipe(mapData());
  }
}

// ── helpers ──────────────────────────────────────────────

function mapData<T>() {
  return (source: Observable<TApiResponse<T>>): Observable<T> =>
    source.pipe(
      map((res) => {
        if (!res?.data) throw new Error('INVALID_RESPONSE');
        return res.data;
      }),
      catchError((err) => throwError(() => err)),
    );
}

function passError<T>() {
  return (source: Observable<T>): Observable<T> =>
    source.pipe(catchError((err) => throwError(() => err)));
}

import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import type {
  TApiResponse,
  TListNotificationsResult,
  TNotificationId,
} from '@sh3pherd/shared-types';
import { BaseHttpService } from '../services/BaseHttpService';

/**
 * HTTP surface for the notifications inbox.
 *
 *   GET  /api/protected/notifications/me
 *   POST /api/protected/notifications/read       { payload: { ids } }
 *   POST /api/protected/notifications/read-all
 */
@Injectable({ providedIn: 'root' })
export class NotificationsApiService extends BaseHttpService {
  private readonly URL =
    this.UrlBuilder.apiProtectedRoute('notifications').build();

  list(params?: {
    limit?: number;
    before?: number;
    unreadOnly?: boolean;
  }): Observable<TListNotificationsResult> {
    const query: Record<string, string> = {};
    if (params?.limit !== undefined) query['limit'] = String(params.limit);
    if (params?.before !== undefined) query['before'] = String(params.before);
    if (params?.unreadOnly !== undefined)
      query['unreadOnly'] = String(params.unreadOnly);
    return this.http
      .get<TApiResponse<TListNotificationsResult>>(`${this.URL}/me`, {
        withCredentials: true,
        params: query,
      })
      .pipe(map((r) => r.data));
  }

  markRead(
    ids: TNotificationId[],
  ): Observable<{ transitionedIds: TNotificationId[]; readAt: number }> {
    return this.http
      .post<
        TApiResponse<{ transitionedIds: TNotificationId[]; readAt: number }>
      >(`${this.URL}/read`, { payload: { ids } }, { withCredentials: true })
      .pipe(map((r) => r.data));
  }

  markAllRead(): Observable<{ readAt: number }> {
    return this.http
      .post<
        TApiResponse<{ readAt: number }>
      >(`${this.URL}/read-all`, {}, { withCredentials: true })
      .pipe(map((r) => r.data));
  }
}

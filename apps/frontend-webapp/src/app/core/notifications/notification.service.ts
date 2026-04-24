import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { io, type Socket } from 'socket.io-client';
import {
  NOTIFICATION_SOCKET_EVENTS,
  type TContractNotificationAction,
  type TNotificationDomainModel,
  type TNotificationId,
  type TNotificationReadEvent,
} from '@sh3pherd/shared-types';
import { environment } from '../../../environments/env.dev';
import { AuthTokenService } from '../services/auth-token.service';
import { NotificationsApiService } from './notifications-api.service';

/**
 * Frontend view model — the panel was designed around a severity-first
 * shape (info / warning / success / error). Backend notifications are
 * flattened into this via `severityFor`; locally-pushed warnings
 * (storage quota, etc.) are created directly in the VM shape.
 */
export interface AppNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message?: string;
  createdAt: Date;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(NotificationsApiService);
  private readonly authToken = inject(AuthTokenService);

  private readonly _items = signal<AppNotification[]>([]);
  /** IDs that originated from the backend — mark-read calls the API
   *  only for those. Locally-pushed items (storage-quota warnings,
   *  future UX-only notifs) stay purely in the browser. */
  private readonly backendIds = new Set<string>();

  private socket: Socket | null = null;

  readonly notifications = this._items.asReadonly();

  readonly unreadCount = computed(
    () => this._items().filter((n) => !n.read).length,
  );

  readonly unreadByType = computed(() => {
    const counts = { info: 0, warning: 0, error: 0, success: 0 };
    for (const n of this._items()) {
      if (!n.read) counts[n.type]++;
    }
    return counts;
  });

  constructor() {
    // Auth-driven lifecycle — (re)connects when a token appears, tears
    // down on logout. `getToken()` isn't reactive on its own, so the
    // effect reads it and `AuthTokenService` callers trigger change
    // detection via the components that consume auth state.
    effect(() => {
      const token = this.authToken.getToken();
      if (token) {
        void this.initForUser(token);
      } else {
        this.teardown();
      }
    });
  }

  // ─── Public API ──────────────────────────────────────────

  async initForUser(token: string): Promise<void> {
    await this.reloadFirstPage();
    this.connectSocket(token);
  }

  async reloadFirstPage(): Promise<void> {
    try {
      const result = await firstValueFrom(this.api.list());
      const adapted = result.items.map(toAppNotification);
      // Replace the backend-sourced slice without wiping locally-pushed
      // items — `push()` (storage warnings, …) is purely client-side
      // and survives a refresh.
      this._items.update((prev) => {
        const localOnly = prev.filter((n) => !this.backendIds.has(n.id));
        return [...adapted, ...localOnly];
      });
      this.backendIds.clear();
      for (const n of result.items) this.backendIds.add(n.id);
    } catch (err) {
      console.warn('[notifications] failed to fetch inbox', err);
    }
  }

  /** Local-only notification — never sent to the backend. Used for
   *  client-side signals like storage-quota warnings. */
  push(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): void {
    const newNotif: AppNotification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      read: false,
    };
    this._items.update((list) => [newNotif, ...list]);
  }

  markRead(id: string): void {
    const before = this._items();
    const target = before.find((n) => n.id === id);
    if (!target || target.read) return;
    this.flipReadLocally([id]);

    // Local-only notifs don't round-trip through the backend.
    if (!this.backendIds.has(id)) return;

    this.api.markRead([id as TNotificationId]).subscribe({
      error: () => this._items.set(before),
    });
  }

  markAllRead(): void {
    const before = this._items();
    const unreadIds = before.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    this.flipReadLocally(unreadIds);

    // Only call the backend if at least one unread item was backend-sourced.
    const hasBackendUnread = unreadIds.some((id) => this.backendIds.has(id));
    if (!hasBackendUnread) return;

    this.api.markAllRead().subscribe({
      error: () => this._items.set(before),
    });
  }

  // ─── Socket lifecycle ────────────────────────────────────

  private connectSocket(token: string): void {
    if (this.socket?.connected && tokenOf(this.socket) === token) return;
    this.teardownSocket();

    const socket = io(`${environment.apiBaseUrl}/notifications`, {
      withCredentials: true,
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on(
      NOTIFICATION_SOCKET_EVENTS.created,
      (domain: TNotificationDomainModel) => {
        this.backendIds.add(domain.id);
        this._items.update((list) => [toAppNotification(domain), ...list]);
      },
    );

    socket.on(
      NOTIFICATION_SOCKET_EVENTS.read,
      (evt: TNotificationReadEvent) => {
        if (evt.ids.length === 0) {
          // Server-side mark-all — flip every backend-sourced item.
          this._items.update((list) =>
            list.map((n) =>
              n.read || !this.backendIds.has(n.id) ? n : { ...n, read: true },
            ),
          );
          return;
        }
        this.flipReadLocally(evt.ids);
      },
    );

    this.socket = socket;
  }

  private teardown(): void {
    this.teardownSocket();
    this._items.update((list) =>
      list.filter((n) => !this.backendIds.has(n.id)),
    );
    this.backendIds.clear();
  }

  private teardownSocket(): void {
    if (!this.socket) return;
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }

  private flipReadLocally(ids: string[]): void {
    const idSet = new Set(ids);
    this._items.update((list) =>
      list.map((n) => (idSet.has(n.id) && !n.read ? { ...n, read: true } : n)),
    );
  }
}

// ─── Adapters ──────────────────────────────────────────────

function tokenOf(socket: Socket): string | null {
  const auth = socket.auth as { token?: unknown } | undefined;
  return auth && typeof auth.token === 'string' ? auth.token : null;
}

function toAppNotification(n: TNotificationDomainModel): AppNotification {
  return {
    id: n.id,
    type: severityFor(n),
    title: n.title,
    message: n.body,
    createdAt: new Date(n.createdAt),
    read: n.read,
  };
}

function severityFor(n: TNotificationDomainModel): AppNotification['type'] {
  if (n.kind === 'system') return 'info';
  return CONTRACT_ACTION_SEVERITY[n.action];
}

const CONTRACT_ACTION_SEVERITY: Record<
  TContractNotificationAction,
  AppNotification['type']
> = {
  received: 'info',
  signed: 'success',
  declined: 'warning',
  expired: 'error',
};

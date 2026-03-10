import { computed, Injectable, signal } from '@angular/core';

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
  private _notifications = signal<AppNotification[]>([]);

  notifications = this._notifications.asReadonly();

  unreadCount = computed(() =>
    this._notifications().filter(n => !n.read).length
  );

  push(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {

    const newNotif: AppNotification = {

      ...notification,

      id: crypto.randomUUID(),

      createdAt: new Date(),

      read: false

    };

    this._notifications.update(list => [newNotif, ...list]);

  }

  markRead(id: string) {

    this._notifications.update(list =>
      list.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );

  }

}

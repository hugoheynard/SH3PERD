import { computed, Injectable, signal } from '@angular/core';

export interface AppNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message?: string;
  createdAt: Date;
  read: boolean;
}

const m = (minutes: number) => new Date(Date.now() - minutes * 60_000);
const h = (hours: number) => new Date(Date.now() - hours * 3600_000);
const d = (days: number) => new Date(Date.now() - days * 86400_000);

const n = (type: AppNotification['type'], title: string, message: string, createdAt: Date, read = false): AppNotification =>
  ({ id: crypto.randomUUID(), type, title, message, createdAt, read });

const MOCK_NOTIFICATIONS: AppNotification[] = [
  // Recent — unread
  n('success', 'Song added to repertoire', 'Blue in Green was added successfully.', m(2)),
  n('info', 'New version shared', 'A new arrangement of Fly Me to the Moon was shared with your group.', m(8)),
  n('warning', 'Audio quality low', 'The track for So What has clipping issues (quality 1/4).', m(22)),
  n('error', 'Upload failed', 'Could not upload the track for All Blues. Please try again.', m(35)),
  n('info', 'Group invitation', 'You were invited to join the group Latin Jazz Ensemble.', m(50)),
  n('warning', 'Storage almost full', 'You have used 90% of your audio storage quota.', h(1.5)),
  n('success', 'Analysis complete', 'Audio analysis for Autumn Leaves finished — quality 3/4.', h(2)),
  n('error', 'Sync error', 'Failed to sync your repertoire with the server. Retrying...', h(3)),
  n('info', 'Rehearsal reminder', 'You have a rehearsal scheduled tomorrow at 14:00.', h(4)),
  n('warning', 'Version conflict', 'Someone edited the same version of Night and Day. Please review.', h(5)),

  // Older — read
  n('success', 'Profile updated', 'Your display name was changed successfully.', h(8), true),
  n('info', 'Contract updated', 'Your contract with Jazz Club was modified by the admin.', h(12), true),
  n('success', 'Track uploaded', 'The audio file for Take Five was uploaded successfully.', d(1), true),
  n('info', 'New member joined', 'Marie Dupont joined your group Swing Quartet.', d(1), true),
  n('warning', 'Expiring contract', 'Your contract with Blue Note Bar expires in 7 days.', d(2), true),
  n('success', 'Playlist created', 'Your playlist Summer Set was created with 12 songs.', d(2), true),
  n('info', 'System maintenance', 'Scheduled maintenance on March 30 from 02:00 to 04:00.', d(3), true),
  n('error', 'Payment failed', 'Your last invoice payment could not be processed.', d(3), true),
  n('success', 'Backup complete', 'Your library was backed up successfully.', d(4), true),
  n('info', 'Feature update', 'Audio analysis now supports multi-track comparison.', d(5), true),
];

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notifications = signal<AppNotification[]>(MOCK_NOTIFICATIONS);

  readonly notifications = this._notifications.asReadonly();

  readonly unreadCount = computed(() =>
    this._notifications().filter(n => !n.read).length
  );

  readonly unreadByType = computed(() => {
    const counts = { info: 0, warning: 0, error: 0, success: 0 };
    for (const n of this._notifications()) {
      if (!n.read) counts[n.type]++;
    }
    return counts;
  });

  push(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): void {
    const newNotif: AppNotification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      read: false,
    };
    this._notifications.update(list => [newNotif, ...list]);
  }

  markRead(id: string): void {
    this._notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllRead(): void {
    this._notifications.update(list =>
      list.map(n => n.read ? n : { ...n, read: true })
    );
  }
}

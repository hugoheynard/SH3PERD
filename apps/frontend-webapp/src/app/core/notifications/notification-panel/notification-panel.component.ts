import { Component, inject } from '@angular/core';
import { NotificationService, type AppNotification } from '../notification.service';
import { LayoutService } from '../../services/layout.service';
import { ButtonComponent } from '../../../shared/button/button.component';

@Component({
  selector: 'ui-notification-panel',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './notification-panel.component.html',
  styleUrl: './notification-panel.component.scss',
})
export class NotificationPanelComponent {
  private readonly notifService = inject(NotificationService);
  private readonly layout = inject(LayoutService);

  readonly notifications = this.notifService.notifications;
  readonly unreadCount = this.notifService.unreadCount;

  markRead(id: string): void {
    this.notifService.markRead(id);
  }

  markAllRead(): void {
    this.notifService.markAllRead();
  }

  close(): void {
    this.layout.clearRightPanel();
  }

  /** Icon character per notification type. */
  iconFor(type: AppNotification['type']): string {
    switch (type) {
      case 'success': return '\u2713'; // ✓
      case 'warning': return '\u26A0'; // ⚠
      case 'error':   return '\u2717'; // ✗
      case 'info':
      default:        return '\u2139'; // ℹ
    }
  }

  /** Relative time label. */
  timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}

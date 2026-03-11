import { Component, inject } from '@angular/core';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'ui-notification-panel',
  imports: [],
  templateUrl: './notification-panel.component.html',
  styleUrl: './notification-panel.component.scss'
})
export class NotificationPanelComponent {
  private notificationsService = inject(NotificationService);

  notifications = this.notificationsService.notifications;
}

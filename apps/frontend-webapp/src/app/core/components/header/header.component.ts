import { ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ThemeService } from '../../services/theme.service';
import { CircularMenuComponent } from '../circular-menu/circular-menu.component';
import { NavigationService } from '../../services/navigation.service';
import { NotificationService } from '../../notifications/notification.service';
import { LayoutService } from '../../services/layout.service';
import { NotificationPanelComponent } from '../../notifications/notification-panel/notification-panel.component';

@Component({
    selector: 'app-header',
  imports: [
    MatIcon
  ],
    templateUrl: './header.component.html',
    standalone: true,
    styleUrl: './header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private navigationService: NavigationService = inject(NavigationService);
  private layout = inject(LayoutService);
  private notif = inject(NotificationService);

  @ViewChild('circularMenu') circularMenu!: CircularMenuComponent;
  public isDark: boolean = true;
  constructor(private themeService: ThemeService) {
    this.isDark = this.themeService.getTheme() === 'dark';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDark = !this.isDark;
  }

  onMenuClick(): void {
    console.log('Menu clicked');
    this.circularMenu.open()
  };

  /**
   * Returns the current page name from the navigation service.
   */
  getCurrentPageName(): string {
    return this.navigationService.pageName();
  };

  unreadNotificationsCount(): number {
    return this.notif.unreadCount();
  }

  openNotifications() {
    this.layout.setRightPanel(NotificationPanelComponent);
  }
}

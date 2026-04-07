import { ChangeDetectionStrategy, Component, computed, HostListener, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { NavigationService } from '../../services/navigation.service';
import { NotificationService } from '../../notifications/notification.service';
import { LayoutService } from '../../services/layout.service';
import { NotificationPanelComponent } from '../../notifications/notification-panel/notification-panel.component';
import { HelpPanelComponent } from '../../../shared/help/help-panel.component';
import { UserContextService } from '../../services/user-context.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-header',
  imports: [
    MatIcon,
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
  private router = inject(Router);
  private userCtx = inject(UserContextService);
  private auth = inject(AuthService);

  public isDark: boolean = true;

  readonly showProfileMenu = signal(false);

  /** User initial for the pastille (first letter of first_name, fallback to 'U'). */
  readonly userInitial = computed(() => {
    const user = this.userCtx.userMe();
    return user?.profile?.first_name?.charAt(0)?.toUpperCase() ?? 'U';
  });

  /** Display name for the menu header. */
  readonly userDisplayName = computed(() => {
    const user = this.userCtx.userMe();
    if (!user?.profile) return '';
    return user.profile.display_name
      ?? `${user.profile.first_name} ${user.profile.last_name}`;
  });

  constructor(private themeService: ThemeService) {
    this.isDark = this.themeService.getTheme() === 'dark';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDark = !this.isDark;
  }

  onMenuClick(): void {
    this.layout.openMobileMenu();
  };

  getCurrentPageName(): string {
    return this.navigationService.pageName();
  };

  unreadNotificationsCount(): number {
    return this.notif.unreadCount();
  }

  readonly unreadByType = this.notif.unreadByType;

  openNotifications() {
    this.layout.setRightPanel(NotificationPanelComponent);
  }

  openHelp() {
    this.layout.setRightPanel(HelpPanelComponent);
  }

  /* ── Profile dropdown ── */

  toggleProfileMenu(): void {
    this.showProfileMenu.update(v => !v);
  }

  goToProfile(): void {
    this.showProfileMenu.set(false);
    this.router.navigate(['/app/user-profile']);
  }

  logout(): void {
    this.showProfileMenu.set(false);
    this.auth.logout();
  }

  /** Close dropdown when clicking outside. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-area')) {
      this.showProfileMenu.set(false);
    }
  }
}

import { ChangeDetectionStrategy, Component, computed, HostListener, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';
import { NotificationService } from '../../notifications/notification.service';
import { LayoutService } from '../../services/layout.service';
import { NotificationPanelComponent } from '../../notifications/notification-panel/notification-panel.component';
import { HelpPanelComponent } from '../../../shared/help/help-panel.component';
import { UpgradePanelComponent } from '../upgrade-panel/upgrade-panel.component';
import { UserContextService } from '../../services/user-context.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ThemeToggleComponent } from '../../../shared/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  imports: [
    MatIcon,
    ThemeToggleComponent,
  ],
  templateUrl: './header.component.html',
  standalone: true,
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly navigationService = inject(NavigationService);
  private readonly layout = inject(LayoutService);
  private readonly notif = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly userCtx = inject(UserContextService);
  private readonly auth = inject(AuthService);

  constructor() { void inject(ThemeService); }

  readonly showProfileMenu = signal(false);
  readonly userInitial = this.userCtx.userInitial;
  readonly userDisplayName = this.userCtx.displayName;
  readonly userPlan = this.userCtx.plan;

  readonly planLabel = computed(() => {
    const plan = this.userPlan();
    if (!plan) return '';
    const labels: Record<string, string> = {
      artist_free: 'Free',
      artist_pro: 'Pro',
      artist_max: 'Max',
      company_free: 'Free',
      company_pro: 'Pro',
      company_business: 'Business',
    };
    return labels[plan] ?? plan;
  });

  readonly showUpgrade = computed(() => {
    const plan = this.userPlan();
    return plan !== 'artist_max' && plan !== 'company_business';
  });

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

  goToUpgrade(): void {
    this.layout.setRightPanel(UpgradePanelComponent);
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

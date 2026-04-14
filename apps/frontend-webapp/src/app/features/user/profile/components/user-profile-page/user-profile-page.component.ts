import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { UserContextService } from '../../../../../core/services/user-context.service';
import { ButtonComponent } from '../../../../../shared/button/button.component';
import { TabNavComponent, type TabNavItem } from '../../../../../shared/tab-nav/tab-nav.component';
import { ProfileInfoTabComponent } from '../profile-info-tab/profile-info-tab.component';
import { PlanUsageComponent } from '../plan-usage/plan-usage.component';
import { UserDangerZoneTabComponent } from '../user-danger-zone-tab/user-danger-zone-tab.component';
import { UserSettingsTab } from './user-settings-tab.enum';

// Material icon SVG paths (24×24 viewBox)
const ICON_USER = 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z';
const ICON_PLAN = 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z';
const ICON_DANGER = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z';

@Component({
  selector: 'app-user-profile-page',
  standalone: true,
  imports: [
    ButtonComponent,
    TabNavComponent,
    ProfileInfoTabComponent,
    PlanUsageComponent,
    UserDangerZoneTabComponent,
  ],
  templateUrl: './user-profile-page.component.html',
  styleUrl: './user-profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfilePageComponent {
  private readonly userCtx = inject(UserContextService);

  readonly Tab = UserSettingsTab;
  readonly activeTab = signal<string>(UserSettingsTab.PROFILE);

  readonly userInitial = this.userCtx.userInitial;
  readonly userFullName = this.userCtx.displayName;

  readonly settingsTabs: TabNavItem[] = [
    { key: UserSettingsTab.PROFILE,     label: 'Profile',      icon: ICON_USER },
    { key: UserSettingsTab.PLAN_USAGE,  label: 'Plan & Usage', icon: ICON_PLAN },
    { key: UserSettingsTab.DANGER_ZONE, label: 'Danger zone',  icon: ICON_DANGER },
  ];
}

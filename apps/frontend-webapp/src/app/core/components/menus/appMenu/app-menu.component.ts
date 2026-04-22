import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../../../../shared/icon/icon.component';
import type { Sh3IconName } from '../../../../shared/icon/icon.registry';
import { AuthService } from '../../../services/auth.service';
import { UserContextService } from '../../../services/user-context.service';

interface AppMenuItem {
  id: string;
  icon: Sh3IconName;
  label: string;
  route?: string;
}

const ALL_NAV_ITEMS: readonly AppMenuItem[] = [
  { id: 'home', icon: 'home', label: 'Home', route: 'home' },
  { id: 'program', icon: 'program', label: 'Program', route: 'program' },
  { id: 'music', icon: 'music', label: 'Music', route: 'musicLibrary' },
  {
    id: 'playlists',
    icon: 'play',
    label: 'Playlists',
    route: 'playlistManager',
  },
  { id: 'shows', icon: 'microphone', label: 'Shows', route: 'shows' },
  { id: 'stats', icon: 'stats', label: 'Stats', route: 'stats' },
  {
    id: 'contracts',
    icon: 'contracts',
    label: 'Contracts',
    route: 'contracts',
  },
  { id: 'company', icon: 'company', label: 'Company', route: 'company' },
];

@Component({
  selector: 'appMenu',
  templateUrl: './app-menu.component.html',
  styleUrl: './app-menu.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconComponent],
})
export class AppMenuComponent {
  private authService = inject(AuthService);
  private userCtx = inject(UserContextService);

  // Menu is scoped by account type, active contract workspace, and plan:
  // - `company` is company-only (hidden for artists and while the plan loads)
  // - `program` requires an active contract workspace (company feature)
  // - `shows` is only available on plans with music:* (artist_pro, artist_max,
  //   company_business); `canUseShows` is the single source of truth, mirrored
  //   by the `requireShowsAccessGuard` route guard.
  readonly navItems = computed<AppMenuItem[]>(() => {
    const isArtist = this.userCtx.isArtist();
    const hasWorkspace = this.userCtx.hasContractWorkspace();
    const canUseShows = this.userCtx.canUseShows();
    return ALL_NAV_ITEMS.filter((item) => {
      if (item.id === 'company' && isArtist) return false;
      if (item.id === 'program' && !hasWorkspace) return false;
      if (item.id === 'shows' && !canUseShows) return false;
      return true;
    });
  });

  readonly bottomItems: AppMenuItem[] = [
    { id: 'settings', icon: 'settings', label: 'Settings', route: 'settings' },
    { id: 'logout', icon: 'logout', label: 'Log out' },
  ];

  onLogout(): void {
    this.authService.logout();
  }
}

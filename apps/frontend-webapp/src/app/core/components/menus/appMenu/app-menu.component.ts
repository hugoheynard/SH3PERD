import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SvgIconComponent } from '@sh3pherd/ui-angular';
import { AuthService } from '../../../services/auth.service';

interface AppMenuItem {
  id: string;
  icon: string;
  label: string;
  route?: string;
}

@Component({
  selector: 'appMenu',
  templateUrl: './app-menu.component.html',
  styleUrl: './app-menu.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, SvgIconComponent],
})
export class AppMenuComponent {

  private authService = inject(AuthService);

  readonly navItems: AppMenuItem[] = [
    { id: 'home',       icon: 'home',                label: 'Home',       route: 'home'         },
    { id: 'program',    icon: 'program',              label: 'Program',    route: 'program'      },
    { id: 'calendar',   icon: 'calendar',             label: 'Calendar',   route: 'calendar'     },
    { id: 'music',      icon: 'notes_2',              label: 'Music',      route: 'musicLibrary' },
    { id: 'playlists',  icon: 'play',                 label: 'Playlists',  route: 'playlistManager' },
    { id: 'contracts',  icon: 'contracts',            label: 'Contracts',  route: 'contracts'    },
    { id: 'userGroups', icon: 'user-group-menu-icon', label: 'Groups',     route: 'userGroup'    },
    { id: 'company',    icon: 'company',              label: 'Company',    route: 'company'      },
  ];

  readonly bottomItems: AppMenuItem[] = [
    { id: 'settings', icon: 'settings', label: 'Settings', route: 'settings' },
    { id: 'logout',   icon: 'logout',   label: 'Log out'                     },
  ];

  onLogout(): void {
    this.authService.logout();
  }
}

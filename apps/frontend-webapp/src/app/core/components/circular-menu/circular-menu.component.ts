import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SvgIconComponent } from '../../../shared/svg-icon/svg-icon.component';
import { LayoutService } from '../../services/layout.service';

interface MobileMenuItem {
  id: string;
  icon: string;
  label: string;
  route: string;
}

/**
 * Full-screen mobile menu with grid of square tiles.
 * Controlled via LayoutService.openMobileMenu() / closeMobileMenu().
 * Hidden on desktop (min-width: 769px).
 */
@Component({
  selector: 'app-circular-menu',
  standalone: true,
  imports: [SvgIconComponent],
  templateUrl: './circular-menu.component.html',
  styleUrl: './circular-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CircularMenuComponent {
  private router = inject(Router);
  private layout = inject(LayoutService);

  readonly isOpen = this.layout.mobileMenuOpen;

  readonly menuItems: MobileMenuItem[] = [
    { id: 'home',       icon: 'home',                label: 'Home',       route: '/app/home'            },
    { id: 'program',    icon: 'program',             label: 'Program',    route: '/app/program'         },
    { id: 'calendar',   icon: 'calendar',            label: 'Calendar',   route: '/app/calendar'        },
    { id: 'music',      icon: 'notes_2',             label: 'Music',      route: '/app/musicLibrary'    },
    { id: 'playlists',  icon: 'play',                label: 'Playlists',  route: '/app/playlistManager' },
    { id: 'contracts',  icon: 'contracts',           label: 'Contracts',  route: '/app/contracts'       },
    { id: 'groups',     icon: 'user-group-menu-icon',label: 'Groups',     route: '/app/userGroup'       },
    { id: 'company',    icon: 'company',             label: 'Company',    route: '/app/company'         },
  ];

  close(): void {
    this.layout.closeMobileMenu();
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    this.close();
  }
}

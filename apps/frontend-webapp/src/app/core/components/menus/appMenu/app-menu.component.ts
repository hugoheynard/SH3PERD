import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { type UiMenuItem, UiMenuComponent } from '../menu/ui-menu.component';
import { AuthService } from '../../../services/auth.service';



@Component({
    selector: 'appMenu',
    templateUrl: './app-menu.component.html',
    styleUrl: './app-menu.component.scss',
    standalone: true,
  imports: [RouterModule, UiMenuComponent],
})
export class AppMenuComponent {
  private authService = inject(AuthService);


  menuItems: UiMenuItem[] = [
    { id: 'home', icon: 'home', route: 'home' },
    { id: 'program', icon: 'program', route: 'program' },
    { id: 'calendar', icon: 'calendar', route: 'calendar' },
    { id: 'music', icon: 'notes_2', route: 'musicLibrary' },
    { id: 'contracts', icon: 'contracts', route: 'contracts' },
    { id: 'userGroups', icon: 'user-group-menu-icon', route: 'userGroup' },
    { id: 'settings', icon: 'settings', route: 'settings' },

    // action item
    { id: 'logout', icon: 'logout' }
  ];

  onCommand(item: UiMenuItem) {

    switch (item.id) {

      case 'logout':
        this.authService.logout();
        break;

    }

  }
}

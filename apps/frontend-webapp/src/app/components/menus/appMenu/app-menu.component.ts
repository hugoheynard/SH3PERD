import {Component, Input} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {CommonModule} from '@angular/common';
import {IconFlatButtonComponent} from '../icon-flat-button/icon-flat-button.component';

interface MenuItem {
  route: string;
  iconName: string;
  action: any;
}

@Component({
    selector: 'appMenu',
    templateUrl: './app-menu.component.html',
    styleUrl: './app-menu.component.scss',
    standalone: true,
    imports: [CommonModule, RouterModule, IconFlatButtonComponent]
})
export class AppMenuComponent {
   @Input() menuItems: MenuItem[] = [];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}

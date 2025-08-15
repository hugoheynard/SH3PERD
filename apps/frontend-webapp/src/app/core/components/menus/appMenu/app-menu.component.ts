import {Component, Input} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {CommonModule} from '@angular/common';
import {IconFlatButtonComponent} from '../icon-flat-button/icon-flat-button.component';
import { type MenuItem, Sh3MenuComponent } from '../sh3-menu/sh3-menu.component';



@Component({
    selector: 'appMenu',
    templateUrl: './app-menu.component.html',
    styleUrl: './app-menu.component.scss',
    standalone: true,
  imports: [CommonModule, RouterModule, IconFlatButtonComponent, Sh3MenuComponent],
})
export class AppMenuComponent {
   @Input() menuItems: MenuItem[] = [];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  private handlers: Record<string, () => void> = {
    logout:     () => console.log('logout'),
  };

  onCommand(it: MenuItem) {
    this.handlers[it.command ?? '']?.();
  }
}

import {Component, Input} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {IconFlatButtonComponent} from '../icon-flat-button/icon-flat-button.component';

interface MenuItem {
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
}

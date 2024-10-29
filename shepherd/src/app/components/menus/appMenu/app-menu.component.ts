import { Component } from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';

interface MenuItem {
  label: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'app-appMenu',
  standalone: true,
  templateUrl: './app-menu.component.html',
  styleUrl: './app-menu.component.scss',
  imports: [CommonModule, RouterModule],
})
export class AppMenuComponent {
   menuItems: MenuItem[] = [
     { label: 'CAL', route: '/calendarPage', icon: 'shepherd/public/Icones/appMenus/generalMenu/calendarPage.svg' },
   ]
}

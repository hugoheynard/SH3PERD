import { Component } from '@angular/core';
import {AppMenuComponent} from '../../../../core/components/menus/appMenu/app-menu.component';
import { Sh3MenuComponent } from '../../../../core/components/menus/sh3-menu/sh3-menu.component';

@Component({
  selector: 'app-calendar-menu',
  imports: [AppMenuComponent, Sh3MenuComponent],
  templateUrl: './calendar-menu.component.html',
  standalone: true,
  styleUrl: './calendar-menu.component.scss'
})
export class CalendarMenuComponent {}

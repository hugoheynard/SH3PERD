import { Component } from '@angular/core';
import {AppMenuComponent} from '../../../../components/menus/appMenu/app-menu.component';

@Component({
  selector: 'app-calendar-menu',
  imports: [AppMenuComponent],
  templateUrl: './calendar-menu.component.html',
  standalone: true,
  styleUrl: './calendar-menu.component.scss'
})
export class CalendarMenuComponent {}

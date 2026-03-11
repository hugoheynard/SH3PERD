import { Component } from '@angular/core';
import {AppMenuComponent} from '../../../../core/components/menus/appMenu/app-menu.component';
import { UiMenuComponent } from '../../../../core/components/menus/menu/ui-menu.component';

@Component({
  selector: 'app-calendar-menu',
  imports: [AppMenuComponent, UiMenuComponent],
  templateUrl: './calendar-menu.component.html',
  standalone: true,
  styleUrl: './calendar-menu.component.scss'
})
export class CalendarMenuComponent {}

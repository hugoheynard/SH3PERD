import { Component } from '@angular/core';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {DatepickerComponent} from '../datepicker/datepicker.component';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatSidenav, MatSidenavContainer} from '@angular/material/sidenav';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatSelect} from '@angular/material/select';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatListItem, MatNavList} from '@angular/material/list';
import {NavlistSettingsComponent} from '../navlist-settings/navlist-settings.component';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    MatLabel,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    DatepickerComponent,
    MatTabGroup,
    MatTab,
    MatSidenavContainer,
    MatSidenav,
    MatIcon,
    MatIconModule,
    MatSelect,
    MatSlideToggle,
    RouterOutlet,
    MatNavList,
    MatListItem,
    RouterLink,
    RouterLinkActive,
    NavlistSettingsComponent,

  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

}

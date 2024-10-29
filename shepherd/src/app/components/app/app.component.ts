import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AppMenuComponent} from '../menus/appMenu/app-menu.component';
import {MatSidenav, MatSidenavContainer} from '@angular/material/sidenav';
import {HeaderComponent} from '../header/header.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    AppMenuComponent,
    MatSidenavContainer,
    MatSidenav,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'shepherd';
}

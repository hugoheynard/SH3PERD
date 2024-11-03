import {Component, effect, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AppMenuComponent} from '../menus/appMenu/app-menu.component';
import {MatSidenav, MatSidenavContainer} from '@angular/material/sidenav';
import {HeaderComponent} from '../header/header.component';
import {FooterComponent} from '../footer/footer.component';
import {AuthService} from "../../services/auth.service";
import {RouteService} from '../../services/route.service';
import {NgIf} from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgIf,
    AppMenuComponent, HeaderComponent, FooterComponent,
    MatSidenavContainer, MatSidenav,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent{
  public authService = inject(AuthService);
  public routeService = inject(RouteService);

  title = 'shepherd';

  constructor() {
    effect(async () => {
      if (!this.authService.isAuthenticatedSignal()) {
        await this.routeService.navigateToLogin();
      }
    });
  }
}

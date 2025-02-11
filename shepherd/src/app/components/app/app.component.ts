import {AfterViewInit, Component, effect, inject, Injector, OnInit, ViewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AppMenuComponent} from '../menus/appMenu/app-menu.component';
import {MatSidenav, MatSidenavContainer} from '@angular/material/sidenav';
import {HeaderComponent} from '../header/header.component';
import {FooterComponent} from '../footer/footer.component';
import {AuthService} from "../../services/auth.service";
import {RouteService} from '../../services/route.service';
import {NgComponentOutlet, NgIf} from '@angular/common';
import {SidenavRightService} from '../sidenav-right.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgIf,
    AppMenuComponent, HeaderComponent, FooterComponent,
    MatSidenavContainer, MatSidenav, NgComponentOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  private injector:Injector = inject(Injector);
  public authService: AuthService = inject(AuthService);
  public routeService: RouteService = inject(RouteService);
  public sidenavRightService: SidenavRightService = inject(SidenavRightService);
  public title: string = 'shepherd';

  @ViewChild('sidenavRight') sidenavRight!: MatSidenav;

  ngAfterViewInit(): void {
    if (this.sidenavRight) {
      this.sidenavRightService.setSidenav(this.sidenavRight);
    } else {
      console.warn('🚨 Warning: `sidenavRight` is not defined in the ViewChild.');
    }
  };

  createInjector(inputs: any) {
    return Injector.create({
      providers: Object.keys(inputs).map(key => ({
        provide: key,
        useValue: inputs[key]
      })),
      parent: this.injector
    });
  }

  constructor() {
    /*effect(async () => {
      if (!this.authService.isAuthenticatedSignal()) {
        await this.routeService.navigateToLogin();
      }
    });*/
  }
}

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  inject,
  Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {RouteService} from '../../services/route.service';
import {SidenavRightService} from '../sidenav-right.service';
import {MatSidenav} from '@angular/material/sidenav';

@Component({
  selector: 'app-main-layout',
  imports: [],
  templateUrl: './main-layout.component.html',
  standalone: true,
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements AfterViewInit{
  public authService: AuthService = inject(AuthService);
  public routeService: RouteService = inject(RouteService);
  public sidenavRightService: SidenavRightService = inject(SidenavRightService);
  public title: string = 'shepherd';

  public cdr = inject(ChangeDetectorRef) //TODO a virer si non utilisé

  @ViewChild('sidenavRight') sidenavRight!: MatSidenav;
  @ViewChild('sidenavContainer', { read: ViewContainerRef }) container!: ViewContainerRef;
  private componentRef!: ComponentRef<any>;
  openComponent(component: Type<any>, inputs?: any): void {

    if (!component) {
      console.error("🚨 ERREUR : Le composant injecté est `undefined` !");
      return;
    }

    this.container.clear();

    try {
      this.componentRef = this.container.createComponent(component);
    } catch (error) {
      console.error('🚨 ERREUR lors de la création du composant :', error);
      return;
    }

    if (inputs) {
      try {
        Object.assign(this.componentRef.instance, inputs);
      } catch (error) {
        console.error('🚨 ERREUR lors de l’assignation des inputs :', error);
      }
    }
  };

  closeSidenav() {
    this.container.clear();
  };

  ngAfterViewInit(): void {
    if (!this.sidenavRight) {
      console.warn('🚨 Warning: `sidenavRight` is not defined in the ViewChild.');
      return;
    }
    this.sidenavRightService.setSidenav(this.sidenavRight);
    this.sidenavRightService.setOpenComponentFunction((component: Type<any>, inputs): void => {
      this.openComponent(component, inputs);
    });
    return;
  };


  constructor() {
    /*effect(async () => {
      if (!this.authService.isAuthenticatedSignal()) {
        await this.routeService.navigateToLogin();
      }
    });*/
  }
}

import {
  AfterViewInit,
  Component,
  computed, effect,
  inject, Injector, runInInjectionContext,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {RouteService} from '../../services/route.service';
import {MatSidenav, MatSidenavContainer} from '@angular/material/sidenav';
import {HeaderComponent} from '../header/header.component';
import {AppMenuComponent} from '../menus/appMenu/app-menu.component';
import {RouterOutlet} from '@angular/router';
import {FooterComponent} from '../footer/footer.component';
import {NgClass, NgIf} from '@angular/common';
import {LayoutService} from '../../../core/services/layout.service';
import {ThemeService} from '../../../core/services/theme.service';
import {MatIcon} from '@angular/material/icon';
import {CircularMenuComponent} from '../circular-menu/circular-menu.component';


@Component({
  selector: 'app-main-layout',
  imports: [
    HeaderComponent,
    MatSidenavContainer,
    AppMenuComponent,
    RouterOutlet,
    FooterComponent,
    MatSidenav,
    NgIf,
    NgClass,
    MatIcon,
    CircularMenuComponent,
  ],
  templateUrl: './main-layout.component.html',
  standalone: true,
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements AfterViewInit{
  private injector: Injector = inject(Injector);
  public authService: AuthService = inject(AuthService);
  public routeService: RouteService = inject(RouteService);
  private layoutService: LayoutService = inject(LayoutService);

  public title: string = 'shepherd';
  public isDark = true;

  @ViewChild('leftPanelContainer', { read: ViewContainerRef }) leftPanel!: ViewContainerRef;
  @ViewChild('rightPanelContainer', { read: ViewContainerRef }) rightPanel!: ViewContainerRef;
  @ViewChild('contextMenuContainer', { read: ViewContainerRef }) contextMenu!: ViewContainerRef;
  @ViewChild('circularMenu') circularMenu!: CircularMenuComponent;


  public hasContextMenu = computed(() => this.layoutService.contextMenuComponent() !== null);
  public hasLeftPanel = computed(() => this.layoutService.leftPanelComponent() !== null);
  public hasRightPanel = computed(() => this.layoutService.rightPanelComponent() !== null);


  constructor(private themeService: ThemeService) {}
  ngAfterViewInit() {
    this.isDark = this.themeService.getTheme() === 'dark';

    /**
     * injects components in layout parts
     */
    runInInjectionContext(this.injector, () => {
      effect(() => {
        this.leftPanel.clear();
        const comp = this.layoutService.leftPanelComponent();
        if (comp) {
          this.leftPanel.createComponent(comp, {injector: this.injector});
        }
      });

      effect(() => {
        this.rightPanel.clear();
        const comp = this.layoutService.rightPanelComponent();
        if (comp) {
          this.rightPanel.createComponent(comp, {injector: this.injector});
        }
      });

      effect(() => {
        this.contextMenu.clear();
        const comp = this.layoutService.contextMenuComponent();
        if (comp) {
          this.contextMenu.createComponent(comp, {injector: this.injector});
        }
      });
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDark = !this.isDark;
  }

  onMenuClick(): void {
    console.log('Menu clicked');
    this.circularMenu.open()
  };
}

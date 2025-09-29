import {
  type AfterViewInit,
  Component,
  computed, effect,
  inject, Injector, runInInjectionContext,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {RouteService} from '../services/route.service';
import {HeaderComponent} from '../components/header/header.component';
import {AppMenuComponent} from '../components/menus/appMenu/app-menu.component';
import {RouterOutlet} from '@angular/router';
import {NgClass} from '@angular/common';
import {LayoutService} from '../services/layout.service';
import {CircularMenuComponent} from '../components/circular-menu/circular-menu.component';


@Component({
  selector: 'app-main-layout',
  imports: [
    AppMenuComponent,
    RouterOutlet,
    NgClass,
    CircularMenuComponent,
    HeaderComponent,
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

  public leftPanelMode: 'over' | 'push' = 'over';
  public rightPanelMode: 'over' | 'push' = 'over';

  @ViewChild('leftPanelContainer', { read: ViewContainerRef }) leftPanel!: ViewContainerRef;
  @ViewChild('rightPanelContainer', { read: ViewContainerRef }) rightPanel!: ViewContainerRef;
  @ViewChild('contextMenuContainer', { read: ViewContainerRef }) contextMenu!: ViewContainerRef;


  public hasContextMenu = computed(() => this.layoutService.contextMenuComponent() !== null);
  public hasLeftPanel = computed(() => this.layoutService.leftPanelComponent() !== null);
  public hasRightPanel = computed(() => this.layoutService.rightPanelComponent() !== null);


  ngAfterViewInit() {
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
}

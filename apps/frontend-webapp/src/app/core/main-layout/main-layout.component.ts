import {
  type AfterViewInit,
  Component,
  computed, effect,
  inject, InjectionToken, Injector, runInInjectionContext,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {HeaderComponent} from '../components/header/header.component';
import {AppMenuComponent} from '../components/menus/appMenu/app-menu.component';
import {RouterOutlet} from '@angular/router';
import {LayoutService} from '../services/layout.service';
import {CircularMenuComponent} from '../components/circular-menu/circular-menu.component';
import { NgClass } from '@angular/common';
import { ToastContainerComponent } from '../../shared/toast/toast-container.component';

export const INJECTION_DATA = new InjectionToken<unknown>('PANEL_DATA');

@Component({
  selector: 'app-main-layout',
  imports: [
    AppMenuComponent,
    RouterOutlet,
    CircularMenuComponent,
    HeaderComponent,
    NgClass,
    ToastContainerComponent,
  ],
  templateUrl: './main-layout.component.html',
  standalone: true,
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements AfterViewInit{
  private injector: Injector = inject(Injector);
  private layoutService: LayoutService = inject(LayoutService);

  public title: string = 'shepherd';
  public isDark = true;

  readonly rightPanelMode = computed(() =>
    this.layoutService.rightPanelComponent()?.mode ?? 'over'
  );
  readonly leftPanelMode = computed(() =>
    this.layoutService.leftPanelComponent()?.mode ?? 'over'
  );

  @ViewChild('leftPanelContainer', { read: ViewContainerRef }) leftPanel!: ViewContainerRef;
  @ViewChild('rightPanelContainer', { read: ViewContainerRef }) rightPanel!: ViewContainerRef;
  @ViewChild('contextMenuContainer', { read: ViewContainerRef }) contextMenu!: ViewContainerRef;
  @ViewChild('popoverContainer', { read: ViewContainerRef }) popover!: ViewContainerRef;


  hasContextMenu = computed(() => this.layoutService.contextMenuComponent() !== null);
  hasLeftPanel = computed(() => this.layoutService.leftPanelComponent() !== null);
  hasRightPanel = computed(() => this.layoutService.rightPanelComponent() !== null);
  hasPopover = computed(() => this.layoutService.popoverComponent() !== null);


  ngAfterViewInit() {
    /**
     * injects components in layout parts
     */
    runInInjectionContext(this.injector, () => {
      effect(() => {
        this.leftPanel.clear();
        const panelConfig = this.layoutService.leftPanelComponent();

        if (!panelConfig) {
          return;
        }

        const customInjector = Injector.create({
          parent: this.injector,
          providers: [{ provide: INJECTION_DATA, useValue: panelConfig.data }],
        });

        this.leftPanel.createComponent(panelConfig.component!, { injector: customInjector });
      });

      effect(() => {
        this.rightPanel.clear();
        const panelConfig = this.layoutService.rightPanelComponent();

        if (!panelConfig) {
          return;
        }

        const customInjector = Injector.create({
          parent: this.injector,
          providers: [{ provide: INJECTION_DATA, useValue: panelConfig.data }],
        });

        this.rightPanel.createComponent(panelConfig.component!, { injector: customInjector });
      });

      effect(() => {
        this.contextMenu.clear();
        const comp = this.layoutService.contextMenuComponent();
        if (comp) {
          this.contextMenu.createComponent(comp, {injector: this.injector});
        }
      });

      effect(() => {
        this.popover.clear();

        const popoverConfig = this.layoutService.popoverComponent();

        if (!popoverConfig) {
          return;
        }

        const customInjector = Injector.create({
          parent: this.injector,
          providers: [{ provide: INJECTION_DATA, useValue: popoverConfig.data }],
        });

        this.popover.createComponent(popoverConfig.component, {
          injector: customInjector
        });
      });
    });
  }
}

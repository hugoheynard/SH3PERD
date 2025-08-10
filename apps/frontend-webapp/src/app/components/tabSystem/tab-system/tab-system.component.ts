import {
  type AfterViewInit, ChangeDetectorRef,
  Component, ComponentRef,
  ElementRef,
  inject,
  Input, Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import type { ITabDefinition } from './ITabDefinition';
import {CdkDrag, type CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatIcon} from '@angular/material/icon';
import {TabNotFoundComponent} from '../tab-not-found/tab-not-found.component';

@Component({
  selector: 'app-tab-system',
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    CdkDropList,
    CdkDrag,
    MatIcon
  ],
  templateUrl: './tab-system.component.html',
  standalone: true,
  styleUrl: './tab-system.component.scss'
})
export class TabSystemComponent implements AfterViewInit{
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef)
  @ViewChild('tabHeaderRef', { static: true }) tabHeaderRef!: ElementRef<HTMLDivElement>;
  @ViewChild('tabContentHost', { read: ViewContainerRef }) tabContentHost!: ViewContainerRef;
  @Input() allowDynamicTabs: boolean = false;
  @Input() componentMap: Record<string, Type<any>> = {};
  @Input() tabs: ITabDefinition[] = [];
  @Input() generateDefaultTab?: (id: string) => ITabDefinition;
  // default Display Component Map
  private readonly defaultComponentMap: Record<string, Type<any>> = {
    'tab-not-found': TabNotFoundComponent,
  };
  public activeTab: ITabDefinition | undefined;

  // ──────────── LIFECYCLE ────────────
  ngAfterViewInit(): void {
    // Verify if dynamic tabs are allowed and if a default tab generator is provided
    if (this.allowDynamicTabs && !this.generateDefaultTab) {
      throw new Error('[TabSystem] Dynamic mode requires `generateDefaultTab` implementation');
    }

    const defaultTab = this.getDefaultTab();

    if (defaultTab) {
      this.activateTab(defaultTab.id);
    }
  };

  // ──────────── TAB MANAGEMENT ────────────
  /**
   * Returns the default tab if defined and valid,
   * otherwise the first tab with a registered component.
   */
  getDefaultTab(): ITabDefinition | undefined {
    if (!this.tabs?.length) {
      //if dynamic - generate a big + add tab?
      //if static - generate "no content" tab?

      // No tabs available, return undefined?
      return undefined;
    }

    return (
      this.tabs.find(tab =>
        this.hasConfigurator(tab) &&
        tab.default &&
        !!tab.configComponentKey &&
        tab.configComponentKey in this.getComponentMap()
      ) ??
      this.tabs.find(tab =>
        this.hasConfigurator(tab) &&
        !!tab.configComponentKey &&
        tab.configComponentKey in this.getComponentMap()
      )
    );
  }

  /**
   * Activates a tab by its ID.
   * params id: string - The ID of the tab to activate.
   * Will ensure that one tab is always active, the rest will be inactive.
   */
  activateTab(id: string): void {
    // Will ensure that one tab is always active, the rest will be inactive
    this.tabs.forEach(t => {
      t.isActive = t.id === id;

      if (t.isActive) {
        this.activeTab = t;
      }
    });

    this.loadTabComponent(this.activeTab);
    this.cdr.detectChanges();
  };

  /**
   * Loads the component for the active tab.
   * If the tab has no component defined, it will not load anything.
   */
  private loadTabComponent(tab?: ITabDefinition): void {
    if (!tab) {
      return;
    }

    this.tabContentHost.clear();

    const key = this.resolveComponentKey(tab);
    const component = this.getComponentMap()[key ?? ''];

    if (!component) {
      console.warn(`[TabSystem] Component not found for key: ${key}`);
      return;
    }

    const ref = this.tabContentHost.createComponent(component);

    if (this.hasConfigurator(tab) && 'configData' in ref.instance && tab.configuratorData) {
      ref.instance.configuratorData = tab.configuratorData;
    }

    this.setupEvents(tab.id, ref);
  }

  /**
   * Sets up event listeners for the tab component.
   * This includes listening for tabReady of configurators and openTab events.
   * @param tabId - The ID of the tab.
   * @param ref - The component reference of the loaded tab.
   */
  private setupEvents(tabId: string, ref: ComponentRef<any>): void {

    if (ref.instance?.tabReady) {
      ref.instance.tabReady.subscribe((newTab: ITabDefinition) =>
        this.replaceTab(tabId, newTab)
      );
    }

    if (ref.instance?.openTab) {
      ref.instance.openTab.subscribe((newTab: ITabDefinition) =>
        this.handleOpenTabFromChild(newTab)
      );
    }

    if (ref.instance?.backToConfig) {
      ref.instance.backToConfig.subscribe(() => {
        this.handleBackToConfig(tabId);
      });
    }
  };

  private handleBackToConfig(tabId: string): void {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab || !tab.hasConfigurator) return;

    tab.configMode = true;
    this.loadTabComponent(tab); // recharger le composant configurateur
  }

  // ──────────── TAB CREATION ────────────
  /**
   * Adds a new tab to the tab system.
   */
  addNewTab(newTab?: ITabDefinition): void {
    if (newTab) {
      this.tabs.push(newTab);
      this.activateTab(newTab.id);
      return;
    }

    if (!this.generateDefaultTab) {
      console.error('[TabSystem] Cannot add new tab: no `generateDefaultTab` function provided.');
      return;
    }

    const id = `tab-${crypto.randomUUID()}`;
    const tab = this.generateDefaultTab?.(id) ?? this.createFallbackTab(id);
    this.tabs.push(tab);
    this.activateTab(tab.id);
    return;
  };

  private createFallbackTab(id: string): ITabDefinition {
    return {
      id: `tab-${id}`,
      title: `No result`,
      hasConfigurator: false,
      displayComponentKey: 'tab-not-found',
      isActive: true,
      isDeletable: true,
      default: false,
    };
  };

  // ──────────── TAB REPLACEMENT ────────────
  replaceTab(oldId: string, newTab: ITabDefinition): void {
    const index = this.tabs.findIndex(t => t.id === oldId);
    if (index !== -1) {
      this.tabs[index] = newTab;
      this.activateTab(newTab.id);
    }
  };

  //TODO: Implement this method to apply the filter to the active tab
  applyFilter(value: string): void {
    if (!this.activeTab) {
      return;
    }
    this.activeTab.searchValue = value;
    //this.tabRefs.get(this.activeTab.id)?.applyFilter?.(value);
  };

  private resolveComponentKey(tab: ITabDefinition): string | undefined {
    if (tab.hasConfigurator) {
      return tab.configMode ? tab.configComponentKey : tab.displayComponentKey;
    }
    return tab.displayComponentKey;
  };

  // ──────────── TAB TYPE CHECKERS - DONT DELETE ────────────
  /**
   * Checks if the tab has a configurator.
   * This is used to determine if the tab should load a configurator component or just display data.
   * @param tab - The tab to check.
   * @returns boolean - True if the tab has a configurator, false otherwise.
   */
  private hasConfigurator(tab: ITabDefinition): tab is ITabDefinition & { hasConfigurator: true } {
    return tab.hasConfigurator;
  };

  // ──────────── UI HELPERS ────────────
  enableTabNameEdit(tab: ITabDefinition): void {
    tab.isEditingTitle = true;
  };

  disableTabNameEdit(tab: ITabDefinition): void {
    const newTitle: string = tab.title?.trim();
    tab.title = newTitle || 'Untitled Tab';
    tab.isEditingTitle = false;
  };

  toggleSearch(tab: ITabDefinition): void {
    tab.isSearchVisible = !tab.isSearchVisible;
  };

  closeTab(id: string): void {
    const index = this.tabs.findIndex(tab => tab.id === id);
    const tabToClose = this.tabs[index];

    if (!tabToClose || !tabToClose.isDeletable) {
      return;
    }

    const wasActive = tabToClose.isActive;

    // Remove the tab
    this.tabs.splice(index, 1);

    // Auto-activate another tab if needed
    if (wasActive) {
      const fallbackIndex = Math.max(0, index - 1);
      const fallbackTab = this.tabs[fallbackIndex];

      if (fallbackTab) {
        this.activateTab(fallbackTab.id);
      } else {
        this.activeTab = undefined;
        this.tabContentHost.clear();
      }
    }
  };



  // ──────────── TAB Drag and Drop ────────────
  dropTab(event: CdkDragDrop<ITabDefinition[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.tabs, event.previousIndex, event.currentIndex);
    }
  };

  trackByTabId(_index: number, tab: ITabDefinition): string {
    return tab.id;
  };

  // ──────────── CHILDREN ACCESS ────────────
  handleOpenTabFromChild(tab: ITabDefinition): void {
    const allowedComponents = Object.keys(this.getComponentMap());

    if (!tab.displayComponentKey || !allowedComponents.includes(tab.displayComponentKey)) {
      console.warn('Rejected tab from child:', tab);
      return;
    }

    this.loadTabComponent(tab);
  }

  // ──────────── UTILS ────────────
  /**
   * use this method for getting the componentMap;
   * @private
   */
  private getComponentMap(): Record<string, Type<any>> {
    //merge the component map with the default one
    return {
      ...this.defaultComponentMap,
      ...this.componentMap
    };
  };
}

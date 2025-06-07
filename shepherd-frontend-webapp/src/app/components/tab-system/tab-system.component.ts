import {
  AfterViewInit,
  Component, ComponentRef,
  ElementRef,
  EventEmitter,
  Input, OnDestroy,
  Output,
  Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ITabDefinition} from './ITabDefinition';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatIcon} from '@angular/material/icon';

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
export class TabSystemComponent implements AfterViewInit, OnDestroy {
  @Input() allowDynamicTabs: boolean = false;
  @Input() tabs: ITabDefinition[] = [];
  @Input() componentMap: Record<string, Type<any>> = {};
  @ViewChild('tabHeaderRef', { static: true }) tabHeaderRef!: ElementRef<HTMLDivElement>;
  @ViewChild('tabContentHost', { read: ViewContainerRef }) tabContentHost!: ViewContainerRef;

  private tabRefs: Map<string, ComponentRef<any>> = new Map();
  public activeTab: ITabDefinition | undefined;
  public searchValue: string = '';
  public tabCount: number = 0;

  // ──────────── LIFECYCLE ────────────
  ngAfterViewInit(): void {
    const defaultTab = this.getDefaultTab();

    if (defaultTab) {
      this.activateTab(defaultTab.id);
    }
  };

  ngOnDestroy(): void {
    this.tabRefs.forEach(ref => ref.destroy?.());
    this.tabRefs.clear();
  };


  // ──────────── TAB MANAGEMENT ────────────
  /**
   * Returns the default tab if defined and valid,
   * otherwise the first tab with a registered component.
   */
  getDefaultTab(): ITabDefinition | undefined {
    if (!this.tabs?.length) {
      return undefined;
    }

    return (
      this.tabs.find(tab => tab.default && !!tab.configComponentKey && tab.configComponentKey in this.componentMap) ??
      this.tabs.find(tab => !!tab.configComponentKey && tab.configComponentKey in this.componentMap)
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
        this.searchValue = t.searchValue || '';
      }
    });

    this.loadTabComponent(this.activeTab);
  };

  /**
   * Loads the component for the active tab.
   * If the tab has no component defined, it will not load anything.
   */
  loadTabComponent(tab?: ITabDefinition): void {
    if (!tab) {
      return;
    }

    const key = tab.configMode ? tab.configComponentKey : tab.displayComponentKey;

    if (!key) {
      console.warn('No component key for tab', tab);
      return;
    }

    const newComponent = this.componentMap[key];
    if (!newComponent) {
      console.warn('Component not found in map for key:', key);
      return;
    }

    this.tabContentHost.clear();
    const ref = this.tabContentHost.createComponent(newComponent);

    // Injects the tab data into the component instance
    if ('configData' in ref.instance && tab.configData) {
      ref.instance.configData = tab.configData;
    }

    this.tabRefs.set(tab.id, ref.instance);

    // event management for tabReady from configurators, if the component has a tabReady EventEmitter
    if (ref.instance?.tabReady) {
      ref.instance.tabReady.subscribe((newTab: ITabDefinition): void => {
        this.replaceTab(tab.id, newTab);
      });
    }

    if (ref.instance?.openTab) {
      ref.instance.openTab.subscribe((newTab: ITabDefinition) => {
        this.handleOpenTabFromChild(newTab);
      });
    }
  };

  handleOpenTabFromChild(tab: ITabDefinition): void {
    const allowedComponents = Object.keys(this.componentMap);

    if (!tab.displayComponentKey || !allowedComponents.includes(tab.displayComponentKey)) {
      console.warn('Rejected tab from child:', tab);
      return;
    }

    this.loadTabComponent(tab);
  }

  addNewTab(): void {
    const newDefaultTab: ITabDefinition = {
      id: `tab-${this.tabCount + 1}`,
      title: `Tab #${this.tabCount + 1}`,
      hasConfigurator: false,
      configComponentKey: 'music-tab-configurator', //TODO: Change to a default component
      configMode: true,
      isDeletable: true,
      isActive: true,
      searchValue: '',
      default: false,
    };

    this.tabs.push(newDefaultTab);
    this.tabCount++;

    this.activateTab(newDefaultTab.id);
  };

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
  }












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
    const tabIndex: number = this.tabs.findIndex((t: ITabDefinition): boolean => t.id === id);
    const currentTab: ITabDefinition = this.tabs[tabIndex];

    if (!currentTab || tabIndex === -1 || !currentTab.isDeletable) {
      return;
    }

    const isActive = currentTab.isActive;

    // Deletes the tab from the list
    this.tabs = this.tabs.filter((t: ITabDefinition): boolean => t.id !== id);

    // If a tab is active, we need to activate the previous one
    if (isActive) {
      const newActiveIndex: number = Math.max(0, tabIndex - 1); //previousTab
      const newActiveTab = this.tabs[newActiveIndex];

      if (newActiveTab) {
        this.activateTab(newActiveTab.id);
        console.log(`Activated tab: ${newActiveTab.title}`);
      }
    }
  };


  // ──────────── TAB Drag and Drop ────────────
  dropTab(event: CdkDragDrop<ITabDefinition[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.tabs, event.previousIndex, event.currentIndex);
    }
  }

  trackByTabId(index: number, tab: ITabDefinition): string {
    return tab.id;
  }

  // ──────────── TAB SEARCH UTILS ────────────
  findInTabMap(predicate: (tab: ITabDefinition) => boolean): ITabDefinition | undefined {
    for (const tab of this.tabs.values()) {
      if (predicate(tab)) {
        return tab
      }
    }
    return undefined;
  };
}



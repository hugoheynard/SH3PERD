import {AfterViewInit, Component, EventEmitter, Input, Output, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TabDefinition} from './ITabDefinition';

@Component({
  selector: 'app-tab-system',
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './tab-system.component.html',
  standalone: true,
  styleUrl: './tab-system.component.scss'
})
export class TabSystemComponent implements AfterViewInit {
  @Input() tabs: TabDefinition[] = [];
  @Input() componentMap: Record<string, Type<any>> = {};
  @Output() tabUpdated: EventEmitter<TabDefinition> = new EventEmitter<TabDefinition>();
  @ViewChild('tabContentHost', { read: ViewContainerRef }) tabContentHost!: ViewContainerRef;

  private tabRefs: Map<string, any> = new Map<string, any>();
  public searchValue: string = '';
  public tabCount: number = 0;

  // ──────────── LIFECYCLE ────────────
  ngAfterViewInit(): void {
    const initialTab = this.getFirstValidTab();

    if (initialTab) {
      this.activateTab(initialTab.id);
    }
  };

  getFirstValidTab(): TabDefinition | undefined {
    return this.tabs.find((t: TabDefinition) => t.default && this.componentMap[t.component]);
  };

  getActiveTab(): TabDefinition | undefined {
    return this.tabs.find((t: TabDefinition) => t.isActive);
  };

  activateTab(id: string): void {
    this.tabs.forEach((t: TabDefinition): boolean => t.isActive = t.id === id);
    const activeTab = this.tabs.find((t: TabDefinition): boolean => t.id === id);
    this.searchValue = activeTab?.search || '';
    this.loadTabComponent(activeTab);
  };

  loadTabComponent(tab?: TabDefinition): void {
    if (!tab) {
      return;
    }

    const comp = this.componentMap[tab.component];
    if (!comp) {
      return;
    }

    this.tabContentHost.clear();
    const ref = this.tabContentHost.createComponent(comp);
    this.tabRefs.set(tab.id, ref.instance);

    // Gestion d’événement tabReady (ex : pour configurateur)
    if (ref.instance?.tabReady) {
      ref.instance.tabReady.subscribe((newTab: TabDefinition): void => {
        this.replaceTab(tab.id, newTab);
        this.tabUpdated.emit(newTab);
      });
    }
  };

  addNewTab(): void {
    const newDefaultTab: TabDefinition = {
      id: `tab-${this.tabCount + 1}`,
      title: `Tab #${this.tabCount + 1}`,
      component: 'music-tab-configurator',
      isDeletable: true,
      isActive: true,
      search: '',
      default: false,
    };

    this.tabs.push(newDefaultTab);
    this.tabCount++;

    this.activateTab(newDefaultTab.id);
  };

  replaceTab(oldId: string, newTab: TabDefinition): void {
    const index = this.tabs.findIndex(t => t.id === oldId);
    if (index !== -1) {
      this.tabs[index] = newTab;
      this.activateTab(newTab.id);
    }
  };

  applyFilter(value: string): void {
    const tab = this.tabs.find(t => t.isActive);
    if (!tab) {
      return;
    }
    tab.search = value;
    this.tabRefs.get(tab.id)?.applyFilter?.(value);
  }


  // ──────────── UI HELPERS ────────────
  enableTabNameEdit(tab: TabDefinition): void {
    tab.isEditing = true;
  };

  disableTabNameEdit(tab: TabDefinition): void {
    const newTitle: string = tab.title?.trim();
    tab.title = newTitle || 'Untitled Tab';
    tab.isEditing = false;
  };

  toggleSearch(tab: TabDefinition): void {
    tab.isSearchVisible = !tab.isSearchVisible;
  };

  closeTab(id: string): void {
    const tabIndex: number = this.tabs.findIndex((t: TabDefinition): boolean => t.id === id);
    const currentTab: TabDefinition = this.tabs[tabIndex];

    if (!currentTab || tabIndex === -1 || !currentTab.isDeletable) {
      return;
    }

    const isActive = currentTab.isActive;

    // Deletes the tab from the list
    this.tabs = this.tabs.filter((t: TabDefinition): boolean => t.id !== id);

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
}

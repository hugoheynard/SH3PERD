import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
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
export class TabSystemComponent implements AfterViewInit {
  @Input() tabs: ITabDefinition[] = [];
  @Input() componentMap: Record<string, Type<any>> = {};
  @Output() tabUpdated: EventEmitter<ITabDefinition> = new EventEmitter<ITabDefinition>();
  @ViewChild('tabHeaderRef', { static: true }) tabHeaderRef!: ElementRef<HTMLDivElement>;
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

  // ──────────── TAB MANAGEMENT ────────────

  getFirstValidTab(): ITabDefinition | undefined {
    return this.tabs.find((t: ITabDefinition) => t.default && this.componentMap[t.component]);
  };

  getActiveTab(): ITabDefinition | undefined {
    return this.tabs.find((t: ITabDefinition) => t.isActive);
  };

  activateTab(id: string): void {
    this.tabs.forEach((t: ITabDefinition): boolean => t.isActive = t.id === id);
    const activeTab = this.tabs.find((t: ITabDefinition): boolean => t.id === id);
    this.searchValue = activeTab?.searchValue || '';

    // Animation de soulignement
    setTimeout(() => {
      const header = this.tabHeaderRef.nativeElement;
      // deleteEffect on tabs
      header.querySelectorAll('.tab').forEach(el => el.classList.remove('tab-activated'));
      // addEffect on active tab
      const active = header.querySelector('.tab.active');
      if (active) {
        active.classList.add('tab-activated');
      }
    });
    this.loadTabComponent(activeTab);
  };

  loadTabComponent(tab?: ITabDefinition): void {
    if (!tab) {
      return;
    }

    const newComponent = this.componentMap[tab.component];
    if (!newComponent) {
      return;
    }

    this.tabContentHost.clear();
    const ref = this.tabContentHost.createComponent(newComponent);

    // Injects the tab data into the component instance
    if ('configData' in ref.instance && tab.configData) {
      ref.instance.configData = tab.configData;
    }


    this.tabRefs.set(tab.id, ref.instance);

    // Gestion d’événement tabReady (ex : pour configurateur)
    if (ref.instance?.tabReady) {
      ref.instance.tabReady.subscribe((newTab: ITabDefinition): void => {
        this.replaceTab(tab.id, newTab);
        this.tabUpdated.emit(newTab);
      });
    }
  };

  addNewTab(): void {
    const newDefaultTab: ITabDefinition = {
      id: `tab-${this.tabCount + 1}`,
      title: `Tab #${this.tabCount + 1}`,
      component: 'music-tab-configurator',
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

  applyFilter(value: string): void {
    const tab = this.tabs.find(t => t.isActive);
    if (!tab) {
      return;
    }
    tab.searchValue = value;
    this.tabRefs.get(tab.id)?.applyFilter?.(value);
  }


  // ──────────── UI HELPERS ────────────
  enableTabNameEdit(tab: ITabDefinition): void {
    tab.isEditing = true;
  };

  disableTabNameEdit(tab: ITabDefinition): void {
    const newTitle: string = tab.title?.trim();
    tab.title = newTitle || 'Untitled Tab';
    tab.isEditing = false;
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
}



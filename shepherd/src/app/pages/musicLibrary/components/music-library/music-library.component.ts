import {
  AfterViewInit,
  Component,
  inject,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatIconButton} from '@angular/material/button';
import {CdkAccordion, CdkAccordionItem} from '@angular/cdk/accordion';
import {FormsModule} from '@angular/forms';
import {MusicRepertoireTableComponent} from '../music-repertoire-table/music-repertoire-table.component';
import {MusicTabConfiguratorComponent} from '../music-tab-configurator/music-tab-configurator.component';
import {MusicLibContextMenuComponent} from '../music-lib-context-menu/music-lib-context-menu.component';
import {LayoutService} from '../../../../../core/services/layout.service';
import {ToggleButtonComponent} from '../../../settingsModule/toggle-button/toggle-button.component';


interface Tab {
  id: string;
  title: string;
  component: string;
  data?: any;
  isActive?: boolean;
  isEditing?: boolean;
  isDeletable?: boolean;
  isEditable?: boolean;
  isSearchable?: boolean;
  isSearchVisible?: boolean;
  search: string;
  default: boolean;
}

@Component({
    selector: 'app-music-library',
    imports: [
    NgForOf,
    NgStyle,
    MatIcon,
    MatMenuTrigger,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    CdkAccordionItem,
    CdkAccordion,
    NgIf,
    FormsModule,
    ToggleButtonComponent,
    MusicRepertoireTableComponent,
      MusicTabConfiguratorComponent,
      MusicLibContextMenuComponent,
  ],
    templateUrl: './music-library.component.html',
    standalone: true,
    styleUrl: './music-library.component.scss',
})

export class MusicLibraryComponent implements AfterViewInit{
  private layoutService: LayoutService = inject(LayoutService);

  // ──────────── CHILDREN ACCESS ────────────
  @ViewChild('tabContentHost', { read: ViewContainerRef }) tabContentHost!: ViewContainerRef;

  // ──────────── STATE ────────────
  public tabs: Tab[] = [
    {
      id: 'music-tab-configurator', title: 'new Tab',
      component: 'music-tab-configurator',
      isDeletable: false,
      isEditable: false,
      isSearchable: false,
      isActive: true,
      search: '',
      default: true,
    },
    {
      id: 'repertoire-me', title: 'My Repertoire',
      component: 'repertoire-me',
      isDeletable: false,
      isEditable: false,
      isSearchable: true,
      isActive: true,
      search: '',
      default: false,
    },
    //{ id: 'cross-search', title: 'crossSearch with long name', component: 'cross', isDeletable: true, search: '', default: false },
  ];
  private tabCount: number = this.tabs.length;
  private tabRefs: Map<string, any> = new Map<string, any>();
  public searchValue: string = '';
  public filter: string = '';
  public isCompact: boolean = true;


  // ──────────── COMPONENT MAP ────────────
  private componentMap: Record<string, Type<any>> = {
    ['repertoire-me']: MusicRepertoireTableComponent,
    ['music-tab-configurator']: MusicTabConfiguratorComponent,
  };

  // ──────────── LIFECYCLE ────────────
  ngAfterViewInit(): void {
    this.layoutService.setContextMenu(MusicLibContextMenuComponent);

    const initialTab = this.getFirstValidTab();

    if (!initialTab) {
      console.warn('No valid tab found to initialize.');
      this.addNewTab();
      return;
    }
    this.activateTab(initialTab.id);
    this.loadTabComponent(initialTab);
    return;
  };

  // ──────────── TAB LOGIC ────────────
  addNewTab(): void {
    const newDefaultTab: Tab = {
      id: `tab-${this.tabCount + 1}`,
      title: `Tab #${this.tabCount + 1}`,
      component: 'music-tab-configurator',
      isDeletable: true,
      search: '',
      default: false,
    };

    this.tabs.push(newDefaultTab);
    this.tabCount++;

    this.activateTab(newDefaultTab.id);
  };

  activateTab(tabId: string): void {
    this.tabs.forEach(t => t.isActive = t.id === tabId);
    const tab = this.getActiveTab();
    this.searchValue = tab?.search ?? '';
    this.loadTabComponent(tab);
  };

  getActiveTab(): Tab | undefined {
    return this.tabs.find(t => t.isActive);
  };

  replaceTab(oldTabId: string, newTab: Tab): void {
    const index = this.tabs.findIndex(t => t.id === oldTabId);
    if (index !== -1) {
      this.tabs[index] = newTab;
      this.activateTab(newTab.id);
    }
  };

  closeTab(id: string): void {
    const tab = this.tabs.find(t => t.id === id);

    if (!tab || !tab.isDeletable) {
      return;
    }

    this.tabs = this.tabs.filter(t => t.id !== id);
  };

  getFirstValidTab(): Tab | undefined {
    return this.tabs.find(tab => tab.default && this.componentMap[tab.component]);
  };

  // ──────────── COMPONENT INJECTION ────────────
  getTabComponentRef(tabId: string): any {
    return this.tabRefs.get(tabId);
  }

  loadTabComponent(tab: Tab = this.tabs[0]): void {
    const comp = this.componentMap[tab.component];

    if (!comp) {
      return;
    }
    // Clear the previous component if any and create a new one + archive in tabRefs
    this.tabContentHost.clear();
    const ref = this.tabContentHost.createComponent(comp);
    this.tabRefs.set(tab.id, ref.instance);

    if (tab.component !== 'music-tab-configurator') {
      return;
    }
    // If the component is the configurator, subscribe to its tabReady event
    ref.instance.tabReady.subscribe((newTab: Tab) => this.replaceTab(tab.id, newTab));
    return;
  };

  // ──────────── SEARCH ────────────
  applyFilter(value: string): void {
    const tab = this.getActiveTab();

    if (!tab) {
      return;
    }

    tab.search = value;
    this.getTabComponentRef(tab.id)?.applyFilter?.(value);
    return;
  };

  // ──────────── UI HELPERS ────────────
  enableTabNameEdit(tab: Tab): void {
    tab.isEditing = true;
  };

  disableTabNameEdit(tab: Tab): void {
    const newTitle = tab.title?.trim();
    tab.title = newTitle || 'Untitled Tab';
    tab.isEditing = false;
  };

  toggleSearch(tab: Tab): void {
    tab.isSearchVisible = !tab.isSearchVisible;
  }
}

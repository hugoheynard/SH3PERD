import {Component, inject, OnInit} from '@angular/core';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatIconButton} from '@angular/material/button';
import {CdkAccordion, CdkAccordionItem} from '@angular/cdk/accordion';
import {VersionTableComponent} from '../versionTable/version-table/version-table.component';
import {FormsModule} from '@angular/forms';
import {ToggleButtonComponent} from '../../settingsModule/toggle-button/toggle-button.component';
import {AddSongFormComponent} from '../add-song-table/add-song-form.component';
import {MusicRepertoireService} from '../../../services/music-repertoire.service';
import {MusicTableComponent} from '../music-table/music-table.component';
import {MlDisplayService} from '../mlDisplayService';
import {SidenavRightService} from '../../../components/sidenav-right.service';
import {MusicRepertoireTableComponent} from '../music-repertoire-table/music-repertoire-table.component';
import {LayoutService} from '../../../../core/services/layout.service';


interface Tab {
  id: string;
  title: string;
  component: string;
  data?: any;
  isActive?: boolean;
  isEditing?: boolean;
  isDeletable?: boolean;
  isEditable?: boolean;
  search?: string;
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
    VersionTableComponent,
    NgIf,
    FormsModule,
    ToggleButtonComponent,
    AddSongFormComponent,
    MusicTableComponent,
    MusicRepertoireTableComponent
  ],
    templateUrl: './music-library.component.html',
    standalone: true,
    styleUrl: './music-library.component.scss'
})

export class MusicLibraryComponent {
  public musicRepertoireService: MusicRepertoireService = inject(MusicRepertoireService);
  public layoutService = inject(LayoutService);

  private sidenavRightService: SidenavRightService = inject(SidenavRightService);
  public addSongTableWindowService: MlDisplayService = inject(MlDisplayService);

  public filter: string = '';

  tabs: Tab[] = [
    { id: 'my-repertoire', title: 'My Repertoire', component: 'repertoire', isDeletable: false, isActive: true, search: '' },
    { id: 'cross-search', title: 'crossSearch', component: 'cross', isDeletable: true, search: '' },
  ];

  private tabCount = this.tabs.length; // Compteur pour les nouveaux onglets

  activeTabId = 'my-repertoire';

  public searchValue = '';

  closeTab(id: string): void {
    const tab = this.tabs.find(t => t.id === id);

    if (!tab || !tab.isDeletable) {
      return
    }

    this.tabs = this.tabs.filter(t => t.id !== id);

    if (this.activeTabId === id && this.tabs.length > 0) {
      this.activeTabId = this.tabs[0].id;
    }
  };



  enableTabNameEdit(tab: Tab): void {
    tab.isEditing = true;
  };

  disableEdit(tab: Tab, newTitle: string): void {
    tab.isEditing = false;
    tab.title = newTitle.trim() || tab.title;
  };


  /**
   * TAB MANAGEMENT
   */
  addNewTab(): void {
    const newTab: Tab = {
      id: `tab-${this.tabCount}`,
      title: `Tab #${this.tabCount}`,
      component: 'custom' // ou 'search', 'playlist', selon le besoin
    };

    this.tabs.push(newTab);
    this.activeTabId = newTab.id;
    this.tabCount++;
  }

  activateTab(tabId: string): void {
    this.tabs.forEach(t => t.isActive = t.id === tabId);
    const tab = this.getActiveTab();
    this.searchValue = tab?.search ?? '';
  };

  getActiveTab(): Tab | undefined {
    return this.tabs.find(t => t.isActive);
  };

  //SEARCH BAR

  applyFilter(searchValue: string): void {

      const tab = this.getActiveTab();

      if (!tab) {
        return
      }

      tab.search = searchValue;

      // Transmet le filtre au composant enfant s’il existe
      //const ref = this.getTabComponentRef(tab.id);
      //ref?.applyFilter(searchValue);

    }




}

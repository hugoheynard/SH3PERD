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
import {TabSystemComponent} from '../../../../components/tab-system/tab-system.component';
import {TabDefinition} from '../../../../components/tab-system/ITabDefinition';


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
    TabSystemComponent,
  ],
    templateUrl: './music-library.component.html',
    standalone: true,
    styleUrl: './music-library.component.scss',
})

export class MusicLibraryComponent implements AfterViewInit{
  private layoutService: LayoutService = inject(LayoutService);

  // ──────────── CHILDREN ACCESS ────────────


  // ──────────── STATE ────────────
  public tabs: TabDefinition[] = [
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

  public filter: string = '';
  public isCompact: boolean = true;


  // ──────────── COMPONENT MAP ────────────
  public componentMap: Record<string, Type<any>> = {
    ['repertoire-me']: MusicRepertoireTableComponent,
    ['music-tab-configurator']: MusicTabConfiguratorComponent,
  };

  // ──────────── LIFECYCLE ────────────
  ngAfterViewInit(): void {
    this.layoutService.setContextMenu(MusicLibContextMenuComponent);
    return;
  };


  // ──────────── SEARCH ────────────

  // ──────────── UI HELPERS ────────────



}

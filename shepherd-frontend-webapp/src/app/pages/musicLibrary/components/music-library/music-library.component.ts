import {
  AfterViewInit,
  Component, computed,
  inject, OnInit,
  Type,
} from '@angular/core';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {MusicRepertoireTableComponent} from '../music-repertoire-table/music-repertoire-table.component';
import {MusicTabConfiguratorComponent} from '../../forms/musicTabConfigurator/components/music-tab-configurator/music-tab-configurator.component';
import {MusicLibContextMenuComponent} from '../music-lib-context-menu/music-lib-context-menu.component';
import {LayoutService} from '../../../../../core/services/layout.service';
import {TabSystemComponent} from '../../../../components/tab-system/tab-system.component';
import {ITabDefinition} from '../../../../components/tab-system/ITabDefinition';
import {MusicLibNavDataService} from '../../services/music-lib-nav-data.service';


@Component({
    selector: 'app-music-library',
  imports: [
    NgForOf,
    NgStyle,
    NgIf,
    MusicRepertoireTableComponent,
    MusicTabConfiguratorComponent,
    MusicLibContextMenuComponent,
    TabSystemComponent,
  ],
    templateUrl: './music-library.component.html',
    standalone: true,
    styleUrl: './music-library.component.scss',
})

export class MusicLibraryComponent implements AfterViewInit, OnInit{
  private layoutService: LayoutService = inject(LayoutService);
  private navDataService: MusicLibNavDataService = inject(MusicLibNavDataService);

  /**
   * This is the list of mandatory tabs that should always be present in the music library.
   * must at least include a tab for the configurator.
   */
  private mandatoryTabs: ITabDefinition[] = [
    {
      id: 'repertoire_me',
      title: 'my repertoire',
      hasConfigurator: false,
      displayComponentKey: 'repertoire',
      configMode: false,
      isDeletable: false,
      isTitleEditable: false,
      isSearchable: true,
      isActive: false,
      default: true,
    }
  ];

  // ──────────── COMPONENT MAP ────────────
  /**
   * This map is used to dynamically load components based on the tab configuration.
   */
  public componentMap: Record<string, Type<any>> = {
    ['music-tab-configurator']: MusicTabConfiguratorComponent,
    ['repertoire']: MusicRepertoireTableComponent,
    ['music-version-details']: MusicRepertoireTableComponent,
  };

  // ──────────── CHILDREN ACCESS ────────────

  // ──────────── STATE ────────────
  public readonly tabs = computed(() => this.navDataService.getTabConfig());
  public isCompact: boolean = true;

  // ──────────── LIFECYCLE ────────────
  ngOnInit(): void {
    // fake call to db, but if singer mandatory repertoire-me
    const navData: ITabDefinition[] = [
      {
        id: 'music-tab-testInput',
        title: 'test input',
        hasConfigurator: false,
        configComponentKey: 'music-tab-configurator',
        configMode: true,
        isDeletable: false,
        isTitleEditable: false,
        isSearchable: false,
        isActive: true,
        default: false,
        configData: {
          searchConfiguration: {
            autoTitle: false,
            title: 'Test Input',
            searchMode: 'repertoire',
            target: {
              mode: 'me'
            },
            dataFilterActive: false,
            exploitationFilterActive: false
          }
        }
      }
    ];

    // Set the initial tab configuration with mandatory tabs and the repertoire tab.
    this.navDataService.setTabConfig([...this.mandatoryTabs, ...navData]);
  };

  ngAfterViewInit(): void {
    this.layoutService.setContextMenu(MusicLibContextMenuComponent);
    return;
  };

  // ──────────── SEARCH ────────────

  // ──────────── UI HELPERS ────────────
}

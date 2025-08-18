import {
  ChangeDetectorRef,
  Component, computed,
  inject, type OnInit,
  Type, ViewChild,
} from '@angular/core';
import {MusicRepertoireTableComponent} from '../music-repertoire-table/music-repertoire-table.component';
import {MusicTabConfiguratorComponent} from '../../forms/musicTabConfigurator/components/music-tab-configurator/music-tab-configurator.component';
import {MusicLibContextMenuComponent} from '../music-lib-context-menu/music-lib-context-menu.component';
import {LayoutService} from '../../../../../core/services/layout.service';
import {TabSystemComponent} from '../../../../shared/tabSystem/tab-system/tab-system.component';
import type { ITabDefinition } from '../../../../shared/tabSystem/tab-system/ITabDefinition';
import {MusicLibNavDataService} from '../../services/music-lib-nav-data.service';
import type { IDynamicTabHost } from '../../../../shared/tabSystem/tab-system/IDynamicTabHost';
import {
  MusicVersionConfiguratorComponent
} from '../../forms/musicVersionConfigurator/components/music-version-configurator/music-version-configurator.component';


@Component({
    selector: 'app-music-library',
  imports: [TabSystemComponent, MusicRepertoireTableComponent],
    templateUrl: './music-library.component.html',
    standalone: true,
    styleUrl: './music-library.component.scss',
})
export class MusicLibraryComponent implements OnInit, IDynamicTabHost{
  private layoutService: LayoutService = inject(LayoutService);
  private navDataService: MusicLibNavDataService = inject(MusicLibNavDataService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  @ViewChild('musicLibraryTabSystem', { static: true }) tabSystem!: TabSystemComponent;

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
      isDeletable: false,
      isTitleEditable: false,
      isSearchable: true,
      isActive: true,
      default: true
    }
  ];

  // ──────────── COMPONENT MAP ────────────
  /**
   * This map is used to dynamically load components based on the tab configuration.
   */
  public componentMap: Record<string, Type<any>> = {
    /**
     * SEARCH AND RESULTS TABS
     */
    ['music-tab-configurator']: MusicTabConfiguratorComponent,
    ['repertoire']: MusicRepertoireTableComponent,
    /**
     * MUSIC VERSION TABS
     */
    ['music-version-configurator']: MusicVersionConfiguratorComponent,
    ['music-version-element']: MusicRepertoireTableComponent,
  };

  public generateDefaultTab(id: string): ITabDefinition {
    return {
      id,
      title: 'Default Tab',
      hasConfigurator: true,
      configComponentKey: 'music-tab-configurator',
      displayComponentKey: 'repertoire',
      configMode: true,
      isDeletable: true,
      isTitleEditable: true,
      isSearchable: true,
      isActive: false,
      default: false,
    }
  };

  public addMusicTab(configuratorData?: any): void {
    const musicVersionTab: ITabDefinition = {
      id: 'music-tab-testInput',
      title: `Add Music`,
      hasConfigurator: true,
      configComponentKey: 'music-version-configurator',
      displayComponentKey: 'music-version-element',
      configMode: true,
      isDeletable: true,
      isTitleEditable: false,
      isSearchable: false,
      isActive: false,
      default: false,
      configuratorData: configuratorData? configuratorData: {},
    };

    this.tabSystem.addNewTab(musicVersionTab);
    return;
  };


  // ──────────── STATE ────────────
  public readonly tabs = computed(() => this.navDataService.getTabConfig());

  // ──────────── LIFECYCLE ────────────
  ngOnInit(): void {
    this.layoutService.setContextMenu(MusicLibContextMenuComponent);
    this.cdr.detectChanges();

    // fake call to db, but if singer mandatory repertoire-me
    const navData: ITabDefinition[] = [
      {
        id: 'music-tab-testInput',
        title: 'test input',
        hasConfigurator: true,
        configComponentKey: 'music-version-configurator',//'music-tab-configurator',
        displayComponentKey: 'repertoire',
        configMode: true,
        isDeletable: false,
        isTitleEditable: false,
        isSearchable: false,
        isActive: true,
        default: true,
        configuratorData: {
          autoTitle: false,
          title: 'Test Input',
          searchConfiguration: {
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

  // ──────────── SEARCH ────────────


  // ──────────── UI HELPERS ────────────
}

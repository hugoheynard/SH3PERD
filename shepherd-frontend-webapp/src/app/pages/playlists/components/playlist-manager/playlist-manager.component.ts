import {Component, inject, OnInit, WritableSignal} from '@angular/core';
import {PlaylistDisplayService} from '../../playlist-display.service';
import {PlaylistService} from '../../../../services/playlistService/playlist.service';
import {TabSystemComponent} from '../../../../components/tabSystem/tab-system/tab-system.component';
import {IDynamicTabHost} from '../../../../components/tabSystem/tab-system/IDynamicTabHost';
import {ITabDefinition} from '../../../../components/tabSystem/tab-system/ITabDefinition';
import {
  MusicLibContextMenuComponent
} from '../../../musicLibrary/components/music-lib-context-menu/music-lib-context-menu.component';
import {LayoutService} from '../../../../../core/services/layout.service';


@Component({
  selector: 'app-playlist-manager',
  imports: [
    TabSystemComponent
  ],
  templateUrl: './playlist-manager.component.html',
  standalone: true,
  styleUrl: './playlist-manager.component.scss'
})
export class PlaylistManagerComponent implements OnInit, IDynamicTabHost{
  private layoutService: LayoutService = inject(LayoutService);

  private playlistDisplayService: PlaylistDisplayService = inject(PlaylistDisplayService);
  private playlistService: PlaylistService = inject(PlaylistService);
  public viewModeSignal: WritableSignal<'library' | 'playlist'> = this.playlistDisplayService.viewModeSignal;
  public playlists: any[] = [];

  async ngOnInit(): Promise<void> {
    //this.layoutService.setContextMenu(MusicLibContextMenuComponent);
    //this.layoutService.setRightPanel(PlaylistViewComponent);
    await this.getPlaylists();
  };

  async getPlaylists(): Promise<void> {
    try {
      this.playlists = await this.playlistService.getPlaylists();
    } catch (error) {
      throw new Error (`[PlaylistService]: error getting playlists', ${error}`);
    }
  }

  async createEmptyPlaylist(): Promise<void> {
    try {
      const playlist = await this.playlistService.createNewEmptyPlaylist();
      this.playlistDisplayService.openPlaylistInSidenav(
        {
          playlist: playlist,
          viewMode: 'create'
        });
    } catch (error) {
      throw new Error (`[PlaylistService]: impossible to create new playlist', ${error}`);
    }
  };


  generateDefaultTab(id: string): ITabDefinition{
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
  }
}

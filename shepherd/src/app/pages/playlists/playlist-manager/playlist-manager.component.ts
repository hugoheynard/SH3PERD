import {Component, inject, OnInit, WritableSignal} from '@angular/core';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {MatIcon} from '@angular/material/icon';
import {TrackLineComponent} from '../playlistView/track-line/track-line.component';
import {NgForOf, NgIf} from '@angular/common';
import {PlaylistTableComponent} from '../playlist-table/playlist-table.component';
import {PlaylistViewComponent} from '../playlistView/playlist-view/playlist-view.component';
import {PlaylistDisplayService} from '../playlist-display.service';
import {Playlist} from '../playlist_interfaces';
import {SongListDndComponent} from '../playlistView/song-list-dnd/song-list-dnd.component';
import {PlvSectionContainerComponent} from '../playlistView/plv-section-container/plv-section-container.component';
import {MatTab, MatTabGroup, MatTabLabel} from '@angular/material/tabs';
import {PlTemplateFormComponent} from '../playlistTemplate/pl-template-form/pl-template-form.component';
import {PlTemplateTableComponent} from '../playlistTemplate/pl-template-table/pl-template-table.component';
import {PlaylistService} from '../../../services/playlistService/playlist.service';


@Component({
  selector: 'app-playlist-manager',
  imports: [MatSidenavContainer, MatSidenav, MatSidenavContent,
    MatIcon,
    TrackLineComponent,
    NgForOf,
    PlaylistTableComponent,
    PlaylistViewComponent,
    NgIf,
    SongListDndComponent,
    PlvSectionContainerComponent,
    MatTabGroup, MatTab,
    PlTemplateFormComponent,
    PlTemplateTableComponent, MatTabLabel
  ],
  templateUrl: './playlist-manager.component.html',
  standalone: true,
  styleUrl: './playlist-manager.component.scss'
})
export class PlaylistManagerComponent implements OnInit{
  private playlistDisplayService: PlaylistDisplayService = inject(PlaylistDisplayService);
  private playlistService: PlaylistService = inject(PlaylistService);
  public viewModeSignal: WritableSignal<'library' | 'playlist'> = this.playlistDisplayService.viewModeSignal;
  public playlists: any[] = [];

  async ngOnInit(): Promise<void> {
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
}

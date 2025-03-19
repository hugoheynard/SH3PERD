import {Component, inject, WritableSignal} from '@angular/core';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {MatIcon} from '@angular/material/icon';
import {TrackLineComponent} from '../playlistView/track-line/track-line.component';
import {NgForOf, NgIf} from '@angular/common';
import {PlaylistTableComponent} from '../playlist-table/playlist-table.component';
import {PlaylistViewComponent} from '../playlistView/playlist-view/playlist-view.component';
import {MusicLibraryComponent} from '../../musicLibrary/music-library/music-library.component';
import {MusicTableComponent} from '../../musicLibrary/music-table/music-table.component';
import {PlaylistDisplayService} from '../playlist-display.service';
import {Playlist} from '../playlist_interfaces';
import {SongListDndComponent} from '../playlistView/song-list-dnd/song-list-dnd.component';
import {PlvSectionContainerComponent} from '../playlistView/plv-section-container/plv-section-container.component';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
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
    MusicLibraryComponent,
    MusicTableComponent,
    SongListDndComponent,
    PlvSectionContainerComponent,
    MatTabGroup, MatTab,
    PlTemplateFormComponent,
    PlTemplateTableComponent
  ],
  templateUrl: './playlist-manager.component.html',
  standalone: true,
  styleUrl: './playlist-manager.component.scss'
})
export class PlaylistManagerComponent {
  private playlistDisplayService: PlaylistDisplayService = inject(PlaylistDisplayService);
  private playlistService: PlaylistService = inject(PlaylistService);
  public viewModeSignal: WritableSignal<'library' | 'playlist'> = this.playlistDisplayService.viewModeSignal;

  public playlists: any[] = [];

  async createEmptyPlaylist(): Promise<void> {
    try {
      const playlist = await this.playlistService.createNewEmptyPlaylist();
      this.playlistDisplayService.openPlaylistInSidenav({ playlist: playlist });
    }catch (error) {
      console.error('error creating empty playlist', error);
    }
  };
}

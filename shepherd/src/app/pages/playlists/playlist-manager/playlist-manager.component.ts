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
import {PlvSectionHeaderComponent} from '../playlistView/plv-section-header/plv-section-header.component';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {PlTemplateFormComponent} from '../playlistTemplate/pl-template-form/pl-template-form.component';


@Component({
    selector: 'app-playlist-manager',
    imports: [MatSidenavContainer, MatSidenav, MatSidenavContent,
        MatIcon,
        TrackLineComponent,
        NgForOf,
        PlaylistTableComponent, PlaylistViewComponent, NgIf, MusicLibraryComponent, MusicTableComponent, SongListDndComponent, SongListDndComponent, PlvSectionContainerComponent, PlvSectionHeaderComponent, MatTabGroup, MatTab, PlTemplateFormComponent
    ],
    templateUrl: './playlist-manager.component.html',
    styleUrl: './playlist-manager.component.scss'
})
export class PlaylistManagerComponent {
  private playlistDisplayService: PlaylistDisplayService = inject(PlaylistDisplayService);
  public viewModeSignal: WritableSignal<'library' | 'playlist'> = this.playlistDisplayService.viewModeSignal;

  public playlists: any[] = [
    {
      name: 'Hello world',
      creation_date: '2025/01/28',
      energy: 4,
      favorite: true,
      settings: {
        containsAerial: true,
        containsDuo: true,
      },
      tags: ['duo', 'aerial'],
      songList: [
        {
          _id: 1,
          title: 'Show must go up',
          tags: ['duo', 'aerial'],
        },
        {

          tags: [],
        },
        {
          _id: 3,
          title: 'Show must go up',
          tags: [],
        },
        {
          _id: 4,
          title: 'Up go must show',
          tags: [],
        }
      ]
    },
    {
      name: 'World world',
      creation_date: '2025/01/29',
      energy: 4,
      favorite: false,
      tags: [],
      songList: [
        {
          _id: 1,
          title: 'Show must go up'
        },
        {
          _id: 2,
          title: 'Up go must show'
        }
      ]
    }];

  createPlaylistInSidenav(playlist: Playlist | null): void {
    this.playlistDisplayService.openPlaylistInSidenav({ playlist: playlist });
  };
}

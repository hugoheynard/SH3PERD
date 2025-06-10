import {Component, inject, Input} from '@angular/core';
import {DatePipe, NgForOf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {PlaylistDisplayService} from '../playlist-display.service';
import {Playlist} from '../playlist_interfaces';
import {TagStyleDirective} from '../../../../Directives/tag-style.directive';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {PlaylistService} from '../../../services/playlistService/playlist.service';

@Component({
    selector: 'playlist-table',
  imports: [
    NgForOf,
    MatIcon,
    MatIconButton,
    TagStyleDirective,
    DatePipe,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger
  ],
    templateUrl: './playlist-table.component.html',
    standalone: true,
    styleUrl: './playlist-table.component.scss'
})
export class PlaylistTableComponent {
  public playlistDisplayService: PlaylistDisplayService = inject(PlaylistDisplayService);
  private playlistService: any = inject(PlaylistService);
  private creationDateOrder: string = 'down';
  private energyLevelOrder: any = null;
  @Input() playlists: any[] = [];

  editPlaylist(playlist: Playlist): void {
    this.playlistDisplayService.openPlaylistInSidenav(
      {
        playlist: playlist,
        viewMode: 'edit'
      });
  };

  deletePlaylist(input : { playlist_id: string }): void {
    this.playlistService.deletePlaylist({ playlist_id: input.playlist_id});
  };

  sortByCreationDate(): void {
    if (this.creationDateOrder === 'up') {
      this.creationDateOrder = 'down'

      this.playlists.sort((a, b) => {
        const dateA: any = new Date(a.creation_date).getTime();
        const dateB: any = new Date(b.creation_date).getTime();
        return dateA - dateB;
      });
      return
    }
    this.creationDateOrder = 'up'

    this.playlists.sort((a, b) => {
      const dateA: any = new Date(a.creation_date).getTime();
      const dateB: any = new Date(b.creation_date).getTime();
      return dateB - dateA;
    });
    return
  };

  sortByEnergyLevel(): void {
    this.playlists.sort((a, b) => a.energy - b.energy); // Tri croissant par niveau d'énergie
  };
}

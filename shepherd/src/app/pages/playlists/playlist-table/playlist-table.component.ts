import {Component, inject, Input} from '@angular/core';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {FavoriteDynamicIconComponent} from '../favorite-dynamic-icon/favorite-dynamic-icon.component';
import {PlaylistDisplayService} from '../playlist-display.service';
import {Playlist} from '../playlist_interfaces';
import {TagStyleDirective} from '../../../../Directives/tag-style.directive';

@Component({
  selector: 'app-playlist-table',
  standalone: true,
  imports: [
    NgForOf,
    MatIcon,
    MatIconButton,
    NgIf,
    NgStyle,
    FavoriteDynamicIconComponent,
    TagStyleDirective
  ],
  templateUrl: './playlist-table.component.html',
  styleUrl: './playlist-table.component.scss'
})
export class PlaylistTableComponent {
  public playlistDisplayService: PlaylistDisplayService = inject(PlaylistDisplayService);
  private creationDateOrder: string = 'down';
  private energyLevelOrder: any = null;
  @Input() playlists: any[] = [];

  editPlaylist(playlist: Playlist): void {
    this.playlistDisplayService.openPlaylistInSidenav({ playlist: playlist });
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

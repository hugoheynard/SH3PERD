import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {FavoriteDynamicIconComponent} from '../favorite-dynamic-icon/favorite-dynamic-icon.component';
import {PlaylistDisplayService} from '../playlist-display.service';
import {Playlist} from '../playlist_interfaces';

@Component({
  selector: 'app-playlist-table',
  standalone: true,
  imports: [
    NgForOf,
    MatIcon,
    MatIconButton,
    NgIf,
    NgStyle,
    FavoriteDynamicIconComponent
  ],
  templateUrl: './playlist-table.component.html',
  styleUrl: './playlist-table.component.scss'
})
export class PlaylistTableComponent {
  public playlistDisplayService: any = inject(PlaylistDisplayService);

  @Input() playlists: any[] = [];
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();

  private creationDateOrder: string = 'down';
  private energyLevelOrder: any = null;

  editPlaylist(playlist: Playlist): void {
    this.playlistDisplayService.viewPlaylist(playlist);
    this.playlistDisplayService.openSidenav();
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

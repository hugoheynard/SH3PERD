import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlaylistsSelectorService } from '../services/selector-layer/playlists-selector.service';
import { PlaylistMutationService } from '../services/mutations-layer/playlist-mutation.service';
import { TrackMutationService } from '../services/mutations-layer/track-mutation.service';
import { PLAYLIST_COLORS } from '../playlist-types';
import type { PlaylistColor } from '../playlist-types';

@Component({
  selector: 'app-playlists-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './playlists-page.component.html',
  styleUrl: './playlists-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistsPageComponent {

  public selector = inject(PlaylistsSelectorService);
  private playlistMutation = inject(PlaylistMutationService);
  private trackMutation = inject(TrackMutationService);

  readonly colors = PLAYLIST_COLORS;

  /** ID of the playlist currently being renamed inline. */
  readonly editingId = signal<string | null>(null);
  readonly editingName = signal('');

  selectPlaylist(id: string): void {
    this.playlistMutation.selectPlaylist(id);
  }

  addPlaylist(): void {
    const name = `Playlist ${this.selector.totalPlaylists() + 1}`;
    this.playlistMutation.addPlaylist(name, 'indigo');
  }

  deletePlaylist(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.playlistMutation.deletePlaylist(id);
  }

  startRename(id: string, currentName: string, event: MouseEvent): void {
    event.stopPropagation();
    this.editingId.set(id);
    this.editingName.set(currentName);
  }

  commitRename(id: string): void {
    const name = this.editingName().trim();
    if (name) this.playlistMutation.updatePlaylist(id, { name });
    this.editingId.set(null);
  }

  cancelRename(): void {
    this.editingId.set(null);
  }

  setColor(id: string, color: PlaylistColor, event: MouseEvent): void {
    event.stopPropagation();
    this.playlistMutation.updatePlaylist(id, { color });
  }

  removeTrack(trackId: string): void {
    this.trackMutation.removeTrack(trackId);
  }
}

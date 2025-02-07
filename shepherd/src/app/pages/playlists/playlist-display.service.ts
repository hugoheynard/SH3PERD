import {Injectable, signal, WritableSignal} from '@angular/core';
import {Playlist} from './playlist_interfaces';

@Injectable({
  providedIn: 'root'
})
export class PlaylistDisplayService {
  public playlistSidenavSignal: WritableSignal<boolean> = signal(false);
  public viewModeSignal: WritableSignal<'library' | 'playlist'> = signal('playlist');
  public currentPlaylistSignal: WritableSignal<Playlist | null> = signal(null);

  viewPlaylist(value: Playlist): void {
    this.currentPlaylistSignal.set(value);
  };
  openSidenav(): void {
    this.playlistSidenavSignal.set(true);
  };
  closeSidenav(): void {
    this.playlistSidenavSignal.set(false);
  };
  openPlaylistView(): void {
    this.viewModeSignal.set('playlist');
  };
  openLibraryView(): void {
    this.viewModeSignal.set('library');
  };
}

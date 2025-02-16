import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {Playlist} from './playlist_interfaces';
import {SidenavRightService} from '../../components/sidenav-right.service';
import {PlaylistViewComponent} from './playlistView/playlist-view/playlist-view.component';

@Injectable({
  providedIn: 'root'
})
export class PlaylistDisplayService {
  private sidenavRightService: SidenavRightService = inject(SidenavRightService);
  public playlistSidenavSignal: WritableSignal<boolean> = signal(false);
  public viewModeSignal: WritableSignal<'library' | 'playlist'> = signal('playlist');
  public currentPlaylistSignal: WritableSignal<Playlist | null> = signal(null);
  public selectedTagSignal: WritableSignal<string | null> = signal<string | null>(null);
  public songDropListConnectionsSignal: WritableSignal<string[]> = signal<string[]>(['']);

  setSongDropListConnectionsSignal(value: string[]): void {
    this.songDropListConnectionsSignal.set(value);
  };

  setSelectedTag(tag: string | null): void {
    this.selectedTagSignal.set(tag);
  };

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

  openPlaylistInSidenav(input: { playlist: Playlist | null }): void {
    this.currentPlaylistSignal.set(input.playlist);
    this.sidenavRightService.openComponent(PlaylistViewComponent, { playlist: this.currentPlaylistSignal() });
    this.sidenavRightService.openRightSidenav();
  };

  closePlaylistInSidenav(): void {
    this.currentPlaylistSignal.set(null);
    this.sidenavRightService.closeRightSidenav();
  };
}

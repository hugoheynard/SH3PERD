import {Component, inject} from '@angular/core';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {MatIcon} from '@angular/material/icon';
import {TrackLineComponent} from '../track-line/track-line.component';
import {NgForOf, NgIf} from '@angular/common';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {PlaylistTableComponent} from '../playlist-table/playlist-table.component';
import {PlaylistViewComponent} from '../playlist-view/playlist-view.component';
import {MusicLibraryComponent} from '../../musicLibrary/music-library/music-library.component';
import {MusicTableComponent} from '../../musicLibrary/music-table/music-table.component';
import {PlaylistDisplayService} from '../playlist-display.service';
import {Playlist} from '../playlist_interfaces';


@Component({
  selector: 'app-playlist-manager',
  standalone: true,
  imports: [MatSidenavContainer, MatSidenav, MatSidenavContent,
    MatIcon,
    TrackLineComponent,
    NgForOf,
    CdkDropList,
    CdkDrag,
    PlaylistTableComponent, PlaylistViewComponent, NgIf, MusicLibraryComponent, MusicTableComponent
  ],
  templateUrl: './playlist-manager.component.html',
  styleUrl: './playlist-manager.component.scss'
})
export class PlaylistManagerComponent {
  public playlistDisplayService: any = inject(PlaylistDisplayService);

  public playlists: any[] = [
    {
      name: 'Hello world',
      creation_date: '2025/01/28',
      energy: 4,
      favorite: true,
      tags: ['duo'],
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

  openSidenav(playlist: Playlist | null): void {
    this.playlistDisplayService.currentPlaylistSignal.set(playlist);
    this.playlistDisplayService.viewModeSignal.set('playlist');
    this.playlistDisplayService.openSidenav();
  };

  onDrop(event: CdkDragDrop<any[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}

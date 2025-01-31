import { Component } from '@angular/core';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {MatIcon} from '@angular/material/icon';
import {TrackLineComponent} from '../track-line/track-line.component';
import {NgForOf} from '@angular/common';
import {CdkDrag, CdkDropList} from '@angular/cdk/drag-drop';
import {PlaylistTableComponent} from '../playlist-table/playlist-table.component';
import {PlaylistViewComponent} from '../playlist-view/playlist-view.component';


@Component({
  selector: 'app-playlist-manager',
  standalone: true,
  imports: [MatSidenavContainer, MatSidenav, MatSidenavContent,
    MatIcon,
    TrackLineComponent,
    NgForOf,
    CdkDropList,
    CdkDrag,
    PlaylistTableComponent, PlaylistViewComponent
  ],
  templateUrl: './playlist-manager.component.html',
  styleUrl: './playlist-manager.component.scss'
})
export class PlaylistManagerComponent {
  public playlists: any[] = [
    {
      name: 'Hello world',
      creation_date: '2025/01/28',
      energy: 4,
      favorite: true,
      tags: ['duo'],
      songList: [
        {
          index: 1,
          title: 'Show must go up'
        },
        {
          index: 2,
          title: 'Up go must show'
        }
      ]
    },
    {
      name: 'Hello world',
      creation_date: '2025/01/29',
      energy: 4,
      favorite: false,
      tags: [],
      songList: [
        {
          index: 1,
          title: 'Show must go up'
        },
        {
          index: 2,
          title: 'Up go must show'
        }
      ]
    }]

  selectedPlaylist: any | null = null;
  isSidenavOpen: boolean = false;

  openSidenav(playlist: any): void {
    this.selectedPlaylist = playlist;
    this.isSidenavOpen = true;
  };

}

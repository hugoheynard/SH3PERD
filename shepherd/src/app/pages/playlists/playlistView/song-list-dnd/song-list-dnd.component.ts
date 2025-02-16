import {Component, Input, ChangeDetectorRef, inject, OnInit} from '@angular/core';
import { CdkDragDrop, CdkDrag, CdkDropList, transferArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgForOf } from '@angular/common';
import { TrackLineComponent } from '../track-line/track-line.component';
import {PlaylistDisplayService} from '../../playlist-display.service';
import {AvailableTagsComponent} from '../available-tags/available-tags.component';

@Component({
  selector: 'app-song-list-dnd',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDropList,
    NgForOf,
    TrackLineComponent
  ],
  templateUrl: './song-list-dnd.component.html',
  styleUrl: './song-list-dnd.component.scss'
})
export class SongListDndComponent implements OnInit{
  @Input() plDisplayService!: PlaylistDisplayService;
  @Input() songList: any[] = [];
  @Input() newTag!: string;
  public  songDropListConnections: string[]=[];


  dropSong(event: CdkDragDrop<any[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.songList, event.previousIndex, event.currentIndex);
    } else {
      // Cas où on transfère entre listes différentes
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  };

  trackSong(index: number, song: any): any {
    return song._id || index;
  };


  ngOnInit(): void {
    this.generateSongDropListConnections();
    //mais si j'ajoute un titre je dois detect changes
  };

  generateSongDropListConnections(): void {
    this.songDropListConnections = this.songList.map((_: any, index: number): string => `tagDropZone-${index}`);
    this.plDisplayService.setSongDropListConnectionsSignal(this.songDropListConnections);
  };

}





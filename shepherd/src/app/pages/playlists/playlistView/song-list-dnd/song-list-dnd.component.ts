import {
  Component,
  Input,
  ChangeDetectorRef,
  inject,
  OnInit,
  effect,
  OnChanges,
  SimpleChanges,
  computed, Signal
} from '@angular/core';
import { CdkDragDrop, CdkDrag, CdkDropList, transferArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgForOf } from '@angular/common';
import { TrackLineComponent } from '../track-line/track-line.component';
import {PlaylistDisplayService} from '../../playlist-display.service';
import {AvailableTagsComponent} from '../available-tags/available-tags.component';
import {AddSlotComponent} from '../add-slot/add-slot.component';

@Component({
  selector: 'app-song-list-dnd',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDropList,
    NgForOf,
    TrackLineComponent,
    AddSlotComponent
  ],
  templateUrl: './song-list-dnd.component.html',
  styleUrl: './song-list-dnd.component.scss'
})
export class SongListDndComponent implements OnInit{
  @Input() pldServ!: PlaylistDisplayService;
  @Input() songList: any[] = [];
  @Input() newTag!: string;
  public  songDropListConnections: string[]=[];


  constructor() {
    effect((): void => {
      if (this.pldServ.addEmptySlotSignal() > 0) {
        this.addEmptySlotInSongList();
      }
    });
  };


  addEmptySlotInSongList(): void {
    this.songList.push({ tags: [] });
    this.generateSongDropListConnections();
  };

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
  };

  generateSongDropListConnections(): void {
    this.songDropListConnections = this.songList.map((_: any, index: number): string => `tagDropZone-${index}`);
    this.pldServ.setSongDropListConnectionsSignal(this.songDropListConnections);
  };

}





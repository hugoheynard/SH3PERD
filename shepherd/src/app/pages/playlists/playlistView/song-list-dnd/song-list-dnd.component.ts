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
import {DragStyleDirective} from '../../../../../Directives/drag-style.directive';
import {AbstractControl, FormArray, FormGroup} from '@angular/forms';
import {PlaylistFormService} from '../../formsServices/playlist-form.service';

@Component({
    selector: 'app-song-list-dnd',
    imports: [
        CdkDrag,
        CdkDropList,
        NgForOf,
        TrackLineComponent,
        AddSlotComponent,
        DragStyleDirective
    ],
    templateUrl: './song-list-dnd.component.html',
    styleUrl: './song-list-dnd.component.scss'
})
export class SongListDndComponent implements OnInit{
  public pldServ = inject(PlaylistDisplayService);
  public cdr= inject(ChangeDetectorRef);
  public playlistFormService: PlaylistFormService = inject(PlaylistFormService);
  public songList!: FormArray;
  @Input() newTag!: string;
  public  songDropListConnections: string[]=[];


  ngOnInit(): void {
    this.songList = this.playlistFormService.getSongList();
    this.generateSongDropListConnections();
  };

  addEmptySlotInSongList(): void {
    this.playlistFormService.addSong();
    this.generateSongDropListConnections();
  };

  /** WORKS FINE - USE AS REFERENCE*/
  dropSong(event: CdkDragDrop<AbstractControl[]>): void {
    const songList = this.playlistFormService.getSongList(); // ✅ Récupération du FormArray

    if (!songList || songList.length === 0) return;

    const items = songList.controls as FormGroup[];

    if (event.previousContainer === event.container) {
      moveItemInArray(items, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data as FormGroup[], // ✅ Cast
        event.container.data as FormGroup[], // ✅ Cast
        event.previousIndex,
        event.currentIndex
      );
    }

    this.playlistFormService.updateFormArray(songList, items);

    console.log('FormArray après update est dans le bon ordre:', this.songList?.value);
    console.log('items après update est dans le bon ordre:', items);
  };





  trackSong(index: number, song: AbstractControl): any {
    return song.get('_id')?.value || index;
  };


  generateSongDropListConnections(): void {
    this.songDropListConnections = this.songList.controls.map(
      (_: AbstractControl, index: number): string => `tagDropZone-${index}`
    );

    this.pldServ.setSongDropListConnectionsSignal(this.songDropListConnections);
  }


}





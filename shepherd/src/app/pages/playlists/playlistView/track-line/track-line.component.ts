import {AfterViewInit, ChangeDetectorRef, Component, inject, Input, OnInit} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from '@angular/material/button';
import {NgForOf, NgIf} from '@angular/common';
import {MatInput} from '@angular/material/input';
import {MatChip, MatChipsModule, MatChipSet} from '@angular/material/chips';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {PlaylistDisplayService} from '../../playlist-display.service';

@Component({
  selector: 'track-line',
  standalone: true,
  imports: [
    MatIcon,
    MatIconButton,
    NgIf,
    MatInput,
    MatChipSet,
    MatChipsModule,
    CdkDropList,
    MatChip,
    CdkDrag,
    NgForOf
  ],
  templateUrl: './track-line.component.html',
  styleUrl: './track-line.component.scss'
})
export class TrackLineComponent implements OnInit{
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  //service from the parent because of dynamic calling of component
  @Input() plDisplayService!: PlaylistDisplayService;
  @Input() songList: any = [];
  @Input() song: any = {};
  @Input() tagDropZoneId: string ='';
  @Input() connectedDropLists: string[] = [];
  public expandedTrack: boolean = false;
  public additionalPerformers: boolean = true;

  readonly compatiblesPerformers: any =[
    {name: 'Jesse'},
    {name: 'Anna'},
  ];

 toggleExpand(): void {
   this.expandedTrack = !this.expandedTrack;
 };

 ngOnInit(): void {
 };

 onTagDropped(event: CdkDragDrop<string[]>): void {
   const targetContainerId = event.container.id;
   const targetSong = this.songList.find((song: any): boolean => `tagDropZone-${this.songList.indexOf(song)}` === targetContainerId);

   if (!targetSong) {
     console.error("❌ Target song introuvable !");
     return;
   }

   const { tag, fromSong } = event.item.data;
   console.log("🔄 Déplacement du tag:", tag, "de", fromSong.title, "vers", targetSong.title);

   if (event.previousContainer === event.container) {
     moveItemInArray(targetSong.tags, event.previousIndex, event.currentIndex);
   } else {
     transferArrayItem(fromSong.tags, targetSong.tags, event.previousIndex, event.currentIndex);
   }
 }
}

import {
  //ChangeDetectorRef,
  Component,
  //inject,
  Input,
  type OnInit,
} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from '@angular/material/button';
import {NgForOf, NgIf} from '@angular/common';
import {MatChip, MatChipsModule, MatChipSet} from '@angular/material/chips';
import {CdkDrag, type CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {PlaylistDisplayService} from '../../playlist-display.service';
import {OpenMusicLibButtonComponent} from '../open-music-lib-button/open-music-lib-button.component';
import {TagStyleDirective} from '../../../../../Directives/tag-style.directive';
import {DragStyleDirective} from '../../../../../Directives/drag-style.directive';

@Component({
    selector: 'track-line',
    imports: [
        MatIcon,
        MatIconButton,
        NgIf,
        MatChipSet,
        MatChipsModule,
        CdkDropList,
        MatChip,
        CdkDrag,
        NgForOf,
        OpenMusicLibButtonComponent,
        TagStyleDirective,
        DragStyleDirective
    ],
    templateUrl: './track-line.component.html',
    standalone: true,
    styleUrl: './track-line.component.scss'
})
export class TrackLineComponent implements OnInit {
  //private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  //service from the parent because of dynamic calling of component
  @Input() pldServ!: PlaylistDisplayService;
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

 getConnections() : string[] {
   return this.pldServ.songDropListConnectionsSignal();
 };

  ngOnInit(): void {
    console.log(this.songList);
  }


  onTagDropped(event: CdkDragDrop<string[]>): void {
   const { tag, source, fromSong } = event.item.data;

   // Trouver le song cible
   const targetContainerId = event.container.id;
   const targetSong = this.songList.find((_: any, index: number): boolean =>
     `tagDropZone-${index}` === targetContainerId
   );

   if (!targetSong) {
     console.error("❌ Target song introuvable !");
     return;
   }

   console.log(`✅ Tag "${tag}" déplacé depuis "${source}" vers "${targetSong.label}"`);

   if (source === "trackLine") {
     if (event.previousContainer === event.container) {
       moveItemInArray(targetSong.tags, event.previousIndex, event.currentIndex);
       return;
     }
     transferArrayItem(fromSong.tags, targetSong.tags, event.previousIndex, event.currentIndex);
   }

   if (source === "availableTags") {
     if (!targetSong.tags.includes(tag)) {
       targetSong.tags.push(tag);
     }
   }
 };


}

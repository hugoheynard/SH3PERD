import {Component, inject, Input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {CdkDrag, type CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';

import {FormsModule} from '@angular/forms';
import {PlaylistDisplayService} from '../../playlist-display.service';
import {TagStyleDirective} from '../../../../../Directives/tag-style.directive';

@Component({
    selector: 'available-tags',
    imports: [
    MatIcon,
    CdkDropList,
    CdkDrag,
    FormsModule,
    TagStyleDirective
],
    standalone: true,
    templateUrl: './available-tags.component.html',
    styleUrl: './available-tags.component.scss'
})
export class AvailableTagsComponent {
  private plDisplayService: PlaylistDisplayService = inject(PlaylistDisplayService);
  @Input() tagList: string[] = [];

  onDragStart(tag: string): void {
    this.plDisplayService.setSelectedTag(tag);
  };

  getSongDropListConnections(): string[] {
    return this.plDisplayService.songDropListConnectionsSignal();
  };

  dropTag(event: CdkDragDrop<string[]>): void {
    if (event.previousContainer === event.container) {
      return;
    }

    // Récupération des données
    const tag = event.previousContainer.data[event.previousIndex];

    // Suppression du tag de la source
    event.previousContainer.data.splice(event.previousIndex, 1);

    // Ajout du tag dans la destination
    event.container.data.push(tag);
  }


}

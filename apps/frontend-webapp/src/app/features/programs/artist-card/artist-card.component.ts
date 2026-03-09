import { Component, input } from '@angular/core';
import type { Artist } from '../services/program-state.service';
import { ArtistWorkloadStripComponent } from '../artist-workload-strip/artist-workload-strip.component';
import type { ArtistWorkload } from '../services/workload.service';
import { DragIconComponent } from '../drag-icon/drag-icon.component';

@Component({
  selector: 'app-artist-card',
  imports: [
    ArtistWorkloadStripComponent,
    DragIconComponent,
  ],
  templateUrl: './artist-card.component.html',
  styleUrl: './artist-card.component.scss'
})
export class ArtistCardComponent {
    workload = input.required<ArtistWorkload>();
    artist = input.required<Artist>();

    get initials() {
      return this.artist().name[0];
    }
}

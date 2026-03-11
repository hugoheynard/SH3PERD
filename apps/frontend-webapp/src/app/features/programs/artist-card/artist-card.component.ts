import { Component, input } from '@angular/core';
import { ArtistWorkloadStripComponent } from '../artist-workload-strip/artist-workload-strip.component';
import type { ArtistWorkload } from '../services/workload.service';
import { CardFrameHorizontalComponent } from '../ui-frames/card-frame/card-frame-horizontal.component';
import type { PlannerArtist } from '../program-types';

@Component({
  selector: 'ui-artist-card',
  imports: [
    ArtistWorkloadStripComponent,
    CardFrameHorizontalComponent,
  ],
  templateUrl: './artist-card.component.html',
  styleUrl: './artist-card.component.scss'
})
export class ArtistCardComponent {
    workload = input.required<ArtistWorkload>();
    artist = input.required<PlannerArtist>();

    get initials() {
      return this.artist().name[0];
    }
}

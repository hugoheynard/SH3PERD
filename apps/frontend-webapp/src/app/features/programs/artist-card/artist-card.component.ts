import { Component, effect, input } from '@angular/core';
import type { Artist } from '../services/program-state.service';
import { ArtistWorkloadStripComponent } from '../artist-workload-strip/artist-workload-strip.component';
import type { ArtistWorkload } from '../services/workload.service';

@Component({
  selector: 'app-artist-card',
  imports: [
    ArtistWorkloadStripComponent,
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

  constructor() {
    effect(() => {
      console.log('workload changed', this.artist().name, this.workload());
    });
  }
}

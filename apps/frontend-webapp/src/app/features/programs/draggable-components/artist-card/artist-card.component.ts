import { Component, input } from '@angular/core';
import { CardFrameHorizontalComponent } from '../../ui-frames/card-frame/card-frame-horizontal.component';
import type { PlannerArtist } from '../../program-types';


/**
 * UI card displaying basic information about an artist.
 *
 * This component is a **presentational container** responsible only for
 * rendering the artist identity (avatar, name, role). Additional content
 * such as workload indicators can be injected using the `artist-extra`
 * content projection slot.
 *
 * The component is intentionally kept **stateless and reusable** so it can
 * be used in multiple contexts:
 *
 * - Planner side panels
 * - Drag & drop previews
 * - Lists or dashboards
 *
 * Content projection:
 *
 * ```html
 * <app-artist-card [artist]="artist">
 *
 *   <app-artist-workload-strip
 *     artist-extra
 *     [segments]="workload.segments"
 *     [globalScore]="78">
 *   </app-artist-workload-strip>
 *
 * </app-artist-card>
 * ```
 *
 * Slots:
 *
 * - `[artist-extra]` — Optional content displayed below the artist metadata
 *   (typically workload indicators or status information).
 *
 * Inputs:
 *
 * - `artist` — The artist model used to render avatar, name and role.
 *
 * Design notes:
 *
 * - The component should **not depend on planner state or selectors**.
 * - Any dynamic or computed data (workload, availability, etc.) should
 *   be provided by the parent via content projection.
 */
@Component({
  selector: 'ui-artist-card',
  imports: [
    CardFrameHorizontalComponent,
  ],
  templateUrl: './artist-card.component.html',
  styleUrl: './artist-card.component.scss'
})
export class ArtistCardComponent {
    artist = input.required<PlannerArtist>();

    get initials() {
      return this.artist().name[0];
    };
}

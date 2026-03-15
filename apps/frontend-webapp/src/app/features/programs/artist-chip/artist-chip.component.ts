import { Component, input, output } from '@angular/core';
import type { PlannerArtist } from '../program-types';


/**
 * UI component representing a single artist inside a performance slot.
 *
 * The component displays a compact "chip" containing artist information
 * and optionally allows the user to remove the artist from the slot.
 *
 * It is designed to be a purely presentational component:
 * - It receives the artist data via an `input` signal.
 * - It emits an event when the user requests removal.
 * - It does not perform any state mutation itself.
 *
 * Typical usage:
 *
 * ```html
 * <app-artist-chip
 *   [artist]="artist"
 *   (remove)="removeArtist($event)">
 * </app-artist-chip>
 * ```
 *
 * The parent component is responsible for handling the removal logic
 * (for example updating the planner state).
 */
@Component({
  selector: 'app-artist-chip',
  imports: [],
  templateUrl: './artist-chip.component.html',
  styleUrl: './artist-chip.component.scss'
})
export class ArtistChipComponent {

  /**
   * Artist displayed in the chip.
   * Required to be input containing the planner artist model.
   */
  artist = input.required<PlannerArtist>();

  /**
   * Emits when the user clicks the remove action.
   * The emitted value is the artist id.
   */
  remove = output<string>();

  /**
   * Handles the remove action triggered from the template.
   * Emits the artist id to the parent component.
   */
  onRemove() {
    this.remove.emit(this.artist().id);
  }
}

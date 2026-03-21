import { Component, computed, inject, input, output} from '@angular/core';
import { ArtistChipComponent } from '../../../artist-chip/artist-chip.component';
import type { ArtistPerformanceSlot } from '../../../program-types';
import { PlannerResolutionService } from '../../../services/planner-resolution.service';
import { SlotSelectionService } from '../../../services/timeline-interactions/slot-selection.service';


/**
 * UI component responsible for rendering a single performance slot in the planner timeline.
 *
 * This component is a **presentational component** that displays slot information
 * and emits interaction events to its parent container (`ProgramsPageComponent`).
 *
 * Responsibilities:
 * - Render slot layout (position, height, color)
 * - Display slot information (artists, time range)
 * - Reflect selection state visually
 * - Emit user interaction events (drag start, resize, edit, remove artist)
 *
 * The component intentionally contains **no business logic or state mutations**.
 * All state updates are handled by higher-level containers and services
 * (e.g. `ProgramsPageComponent`, `SlotService`, `SlotSelectionService`).
 *
 * Layout calculations such as `top` and `height` are computed locally using
 * `PlannerResolutionService` since they are purely **visual concerns**.
 *
 * Inputs:
 * - `slot` — the slot data model used to render the UI
 * - `slotStartTime` — formatted start time for display
 * - `slotEndTime` — formatted end time for display
 *
 * Outputs:
 * - `slotPointerDown` — emitted when the slot receives a pointer down event (used to start drag/selection)
 * - `slotResizeStart` — emitted when the resize handle is pressed
 * - `editSlot` — emitted on double click to open slot editor
 * - `removeArtist` — emitted when an artist is removed from the slot
 *
 * The component also reflects UI state such as:
 * - selection (`selected` class)
 * - expansion (`expanded` class)
 * - compact rendering mode when duration is small
 *
 * Host bindings are used to efficiently update layout and visual styles
 * without adding unnecessary bindings inside the template.
 */
@Component({
  selector: 'ui-program-slot',
  imports: [
    ArtistChipComponent,
  ],
  templateUrl: './slot-planner.component.html',
  styleUrl: './slot-planner.component.scss',
  host: {
    '[style.--slot-color]': "color",
    '[attr.data-slot-id]': "slot().id",
    '[class.expanded]': 'isExpanded',
    '[class.selected]': 'isSelected',
    '[class.dragging]': 'isDragging()',
    '[style.top.px]': 'top()',
    '[style.height.px]': 'height()',

    '(pointerdown)': 'onPointerDown($event)',
    '(dblclick)': 'onDoubleClick(this.slot().id)'
  }
})
export class SlotPlannerComponent {
  private res = inject(PlannerResolutionService);
  private selection = inject(SlotSelectionService);


  /*--------------I/O----------------------------*/

  slot = input.required<ArtistPerformanceSlot>();
  slotStartTime = input<string>();
  slotEndTime = input<string>();
  top = computed(() => this.res.minuteToPx(this.slot().startMinutes));
  height = computed(() => this.res.minuteToPx(this.slot().duration));
  editSlot = output<string>();
  slotResizeStart = output<PointerEvent>();
  slotPointerDown = output<{ event: PointerEvent, slot: ArtistPerformanceSlot }>();
  removeArtist = output<{ slot_id: string, artist_id: string }>()


  /*-----------------STATE-------------------------*/
  isExpanded = false;
  isDragging = input<boolean>(false);

  get isSelected(): boolean {
    return this.selection.isSelected(this.slot().id);
  };

  get isCompact(): boolean {
    return this.slot().duration <= this.res.snapMinutes();
  }

  get color(): string {
    return this.slot().color;
  };

  toggleExpanded(event: PointerEvent) {
    event.stopPropagation(); // important pour ne pas déclencher drag
    this.isExpanded = !this.isExpanded;
  };

  /* ---------------------------------
    * EMITTERS
   ---------------------------------*/

  onResizeMouseDown(event: PointerEvent) {
    event.stopPropagation();
    this.slotResizeStart.emit(event);
  };

  onRemoveArtist(artistId: string): void {
    this.removeArtist.emit({ slot_id: this.slot().id, artist_id: artistId });
  };

  onDoubleClick(slot_id: string) {
    this.editSlot.emit(slot_id)
  };

  onPointerDown(event: PointerEvent) {
    this.slotPointerDown.emit({ event, slot: this.slot() });
  };
}

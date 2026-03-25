import { Component, computed, HostBinding, inject, input } from '@angular/core';
import { type TimelineCue } from '../../../program-types';
import { PlannerResolutionService } from '../../../services/planner-resolution.service';
import { TIMELINE_PROJECTOR } from '../../../services/timelineProjectionSystem/TimelineProjector';


/**
 * Renders a timeline cue (marker) positioned along the vertical time axis.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * This component belongs to the **Timeline Render Layer**.
 *
 * It is responsible for displaying a **cue (marker / annotation)** at a
 * specific time position within a room timeline.
 *
 * Unlike slots, cues:
 * - Do NOT participate in collision or constraint systems
 * - Do NOT affect timeline structure
 * - Are purely **visual annotations**
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Convert cue time (minutes) → pixel position (top)
 * - Render cue label and styling
 * - Expose cue type for styling (via `data-type`)
 * - Reflect selection state (optional)
 *
 * ---------------------------------------------------------------------------
 * 🎯 POSITIONING
 * ---------------------------------------------------------------------------
 *
 * The vertical position is computed using {@link PlannerResolutionService},
 * ensuring consistency with the timeline scale.
 *
 * Positioning is applied via HostBinding:
 *
 * - `style.top.px` → vertical placement
 *
 * ---------------------------------------------------------------------------
 * 🎨 STYLING
 * ---------------------------------------------------------------------------
 *
 * Cue type is exposed as a DOM attribute:
 *
 * - `data-type="technical" | "artistic" | ...`
 *
 * This allows styling via CSS:
 *
 * ```scss
 * [data-type="technical"] { color: blue; }
 * [data-type="artistic"] { color: red; }
 * ```
 *
 * ---------------------------------------------------------------------------
 * 🧩 INPUTS
 * ---------------------------------------------------------------------------
 *
 * - `cue` (required) → TimelineCue data
 * - `isSelected` (optional) → selection state for UI feedback
 *
 * ---------------------------------------------------------------------------
 * 💡 DESIGN NOTES
 * ---------------------------------------------------------------------------
 *
 * - Uses Angular signals for reactive updates
 * - No internal state (pure render component)
 * - No business logic or mutations
 * - Fully decoupled from interaction / selection systems
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This component can be extended to support:
 *
 * - Inline editing (rename cue)
 * - Drag & reposition
 * - Context menu (delete, duplicate, etc.)
 * - Multi-layer markers (stacking / grouping)
 *
 */
@Component({
  selector: 'ui-timeline-cue',
  templateUrl: './timeline-cue.component.html',
  styleUrl: './timeline-cue.component.scss',
})
export class TimelineCueComponent {
  private res = inject(PlannerResolutionService);
  private projector = inject(TIMELINE_PROJECTOR);


  @HostBinding('style.top.px') get topPx() {
    return this.top();
  }

  @HostBinding('attr.data-type') get cueType() {
    return this.type();
  }

  cue = input.required<TimelineCue>();

  previewAtMinutes = input<number | null>(null);

  isDragging = input(false);

  @HostBinding('class.is-dragging') get dragging() { return this.isDragging(); }

  /**
   * Vertical position in px (computed from minutes)
   */
  top = computed(() => {
    const preview = this.previewAtMinutes();
    const cue = this.cue();
    return this.res.minuteToPx(this.projector.project(preview ?? cue.atMinutes, cue.roomId));
  });

  /**
   * Display label of the cue
   */
  label = computed(() => this.cue().label);

  /**
   * Optional cue type for styling
   */
  type = computed(() => this.cue().type);

  /**
   * Indicates selection state
   */
  isSelected = input(false);
}

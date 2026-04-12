import { InsertLineComponent } from '../../insert-interaction-system/insert-line/insert-line.component';
import { Component, computed, inject, input } from '@angular/core';
import { InsertLineService } from '../../insert-interaction-system/state-services/insert-line.service';
import { PlannerResolutionService } from '../../../services/planner-resolution.service';
import { SlotService } from '../../../services/mutations-layer/slot.service';
import { CueService } from '../../../services/mutations-layer/cue.service';
import type { ArtistPerformanceSlot, Room } from '../../../program-types';
import { BufferService } from '../../../services/mutations-layer/buffer.service';
import { InsertActionType } from '../../insert-interaction-system/actions-services/insert-action.types';
import { NgComponentOutlet } from '@angular/common';
import { InsertRenderRegistry } from '../../insert-interaction-system/InsertElementRenderRegistry';


/**
 * Renders the insert interaction layer for a single room timeline.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * This component belongs to the **Insert Interaction Render Layer**.
 *
 * It is responsible for visualizing **insertion feedback** during user
 * interactions such as:
 *
 * - Dragging templates
 * - Creating new slots, cues, or buffers
 * - Using keyboard-driven insert modes (e.g. ALT mode)
 *
 * It acts as a **projection layer** between:
 *
 * - The interaction state ({@link InsertLineService})
 * - The visual timeline (slots, cues, buffers)
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Display the insert line (visual feedback)
 * - Render ghost previews for:
 *   - Slots
 *   - Cues
 *   - Buffers
 * - Scope rendering to the current room
 * - Convert timeline time (minutes) into pixel coordinates
 *
 * ---------------------------------------------------------------------------
 * 🧩 INSERT SYSTEM INTEGRATION
 * ---------------------------------------------------------------------------
 *
 * This component consumes the {@link InsertLineService} which provides:
 *
 * - Current insert position (`minutes`)
 * - Target room (`roomId`)
 * - Insert type (`previewType`)
 * - Multi-room support (`multiRoom`)
 *
 * Based on this state, it conditionally renders the appropriate ghost preview.
 *
 * ---------------------------------------------------------------------------
 * 👻 GHOST PREVIEW SYSTEM
 * ---------------------------------------------------------------------------
 *
 * Ghost elements are temporary, non-persistent representations of future
 * timeline elements.
 *
 * Each ghost is:
 *
 * - Created via its domain service (`SlotService`, `CueService`, `BufferService`)
 * - Rendered only when the insert context matches:
 *   - The correct type (slot, cue, buffer)
 *   - The current room
 *
 * These previews provide immediate visual feedback before committing mutations.
 *
 * ---------------------------------------------------------------------------
 * 📍 POSITIONING
 * ---------------------------------------------------------------------------
 *
 * Vertical positioning is derived from timeline minutes using
 * {@link PlannerResolutionService}.
 *
 * - `insertTopPx` → position of the insert line
 * - Ghost elements use their own time → px conversion
 *
 * ⚠️ Must stay consistent with timeline offset system (grid alignment).
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROOM SCOPING
 * ---------------------------------------------------------------------------
 *
 * The component is instantiated per room and ensures that:
 *
 * - Insert indicators are only displayed in the correct room
 * - Multi-room inserts are handled properly
 *
 * ---------------------------------------------------------------------------
 * 🎯 DESIGN PRINCIPLES
 * ---------------------------------------------------------------------------
 *
 * - No mutation logic (pure render layer)
 * - Fully reactive via Angular signals
 * - Decoupled from business logic and state mutations
 * - Scalable for additional insert types
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This layer can evolve to support:
 *
 * - Advanced ghost previews (collision-aware)
 * - Magnetic snapping visualization
 * - Multi-item insertion previews
 * - Insert animations / transitions
 *
 * ---------------------------------------------------------------------------
 * 💡 NAMING NOTE
 * ---------------------------------------------------------------------------
 *
 * The method `getInsertIndicatorForType` acts as a contextual resolver:
 *
 * - Validates insert state
 * - Ensures correct type
 * - Ensures correct room scope
 *
 * It is the core utility used to drive ghost rendering.
 *
 */
@Component({
  selector: 'ui-room-insert-layer',
  standalone: true,
  imports: [
    InsertLineComponent,
    NgComponentOutlet,
  ],
  templateUrl: './room-insert-layer.component.html',
  styleUrl: './room-insert-layer.component.scss'
})
export class RoomInsertLayerComponent {

  private insert = inject(InsertLineService);
  private res = inject(PlannerResolutionService);


  room = input.required<Room>();

  /* ---------------- INSERT ---------------- */

  indicator = computed(() => {
    const indicator = this.insert.indicator();

    if (!indicator) {
      return null;
    }

    if (!indicator.multiRoom && indicator.roomId !== this.room().id) {
      return null;
    }

    return indicator;
  });

  insertTopPx = computed(() => {
    const minutes = this.insert.minutes();
    return minutes === null
      ? null
      : this.res.minuteToPx(minutes);
  });

  isAltMode = this.insert.altMode;

  /* ---------------- GHOST SLOT ---------------- */
  private slotServ = inject(SlotService);

  ghostSlot = computed<ArtistPerformanceSlot | null>(() => {
    const indicator = this.getInsertIndicatorForType(InsertActionType.SLOT);

    if (!indicator) {
      return null;
    }

    return this.slotServ.createDefault({
      startMinutes: indicator.minutes,
      roomId: indicator.roomId,
      id: 'ghost'
    });
  });

  /* ---------------- GHOST CUE ---------------- */
  private cueServ = inject(CueService);

  ghostCue = computed(() => {
    const indicator = this.getInsertIndicatorForType(InsertActionType.CUE);

    if (!indicator) {
      return null;
    }

    return this.cueServ.createDefault({
      id: 'ghost',
      minutes: indicator.minutes,
      roomId: indicator.roomId
    });
  });


  //------------------ GHOST BUFFER ------------------//
  private buffer = inject(BufferService);

  ghostBuffer = computed(() => {
    const indicator = this.getInsertIndicatorForType(InsertActionType.BUFFER);

    if (!indicator) {
      return null;
    }

    return this.buffer.createDefault({
      id: 'ghost',
      atMinutes: indicator.minutes,
      room_id: indicator.roomId,
      delta: 5
    });
  });


  // ---------------- UTILS -----------
  getInsertIndicatorForType(t: InsertActionType) {
    const indicator = this.insert.indicator();
    const type = this.insert.previewType();

    if (!indicator || type !== t) {
      return null;
    }

    if (indicator.roomId !== this.room().id) {
      return null;
    }

    return indicator;
  }

  private renderRegistry = inject(InsertRenderRegistry);

  ghostRender = computed(() => {

    const type = this.insert.previewType();
    if (!type) return null;

    const indicator = this.getInsertIndicatorForType(type);
    if (!indicator) return null;

    const def = this.renderRegistry.get(type);
    if (!def) return null;

    const ghost = def.createGhost({
      minutes: indicator.minutes,
      roomId: indicator.roomId
    });

    return {
      component: def.component,
      inputs: def.mapInputs(ghost)
    };
  });

}

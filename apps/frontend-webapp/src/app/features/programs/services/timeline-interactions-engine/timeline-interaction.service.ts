import { inject, Injectable } from '@angular/core';
import { DragSessionService } from '../../../../core/drag-and-drop/drag-session.service';
import { SlotService } from '../mutations-layer/slot.service';
import type { ArtistPerformanceSlot } from '../../program-types';
import { InsertLineService } from '../../timeline/insert-interaction-system/state-services/insert-line.service';
import { TimelineInteractionStore } from './timeline-interaction.store';
import { SlotResizeInteractionService } from './slot-resize-interaction.service';
import { SlotDragInteractionService } from './slot-drag-interaction.service';
import { TimelineSpatialService } from '../timeline-spatial.service';


/**
 * Central orchestrator for all timeline interactions (drag, resize, template preview).
 *
 * This service coordinates user interactions within the planner timeline and delegates
 * the actual logic to specialized interaction services.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Acts as the **interaction controller layer**, connecting:
 *
 * - Pointer tracking → DragSessionService
 * - Interaction logic → SlotDragInteractionService, SlotResizeInteractionService
 * - Preview state → TimelineInteractionStore
 * - Persistent state → SlotService
 * - Visual feedback → InsertLineService
 *
 * This service contains NO business logic itself. It only:
 * - Routes pointer events
 * - Controls interaction priority
 * - Commits final state changes
 *
 * ---------------------------------------------------------------------------
 * ⚡ SUPPORTED INTERACTIONS
 * ---------------------------------------------------------------------------
 *
 * - Slot drag (single & multi)
 * - Slot resize
 * - Template drag (insert line preview only)
 *
 * ---------------------------------------------------------------------------
 * 🔁 INTERACTION FLOW
 * ---------------------------------------------------------------------------
 *
 * 1. startSlotDrag / startSlotResize
 *    → delegates to corresponding interaction service
 *
 * 2. handlePointerMove
 *    → determines active interaction
 *    → forwards move event to correct handler
 *    → ensures only one interaction runs at a time
 *
 * 3. stop
 *    → commits preview state (dragged slots) into persistent state
 *    → applies both position (startMinutes) and room changes
 *    → resets all interaction-related services
 *
 * ---------------------------------------------------------------------------
 * 🧾 COMMIT LOGIC (STOP)
 * ---------------------------------------------------------------------------
 *
 * When a drag operation is active:
 *
 * - Iterates over all preview slots from TimelineInteractionStore
 * - Applies:
 *   - updated start time (previewStart)
 *   - updated room (previewRoomId), if changed
 *
 * This ensures:
 *
 * - Multi-drag consistency
 * - Cross-room moves
 * - No state mutation during drag (only on release)
 *
 * ---------------------------------------------------------------------------
 * 🔄 RESET STRATEGY
 * ---------------------------------------------------------------------------
 *
 * All interaction state is reset via `resetAll()`:
 *
 * - Clears preview state (TimelineInteractionStore)
 * - Stops drag session (DragSessionService)
 * - Clears insert line (InsertLineService)
 * - Resets drag & resize interaction services
 *
 * This guarantees a clean state after every interaction.
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - This service is an orchestrator ONLY (no heavy logic)
 * - All spatial calculations belong to TimelineSpatialService
 * - All interaction logic belongs to dedicated sub-services
 * - State mutations occur ONLY in `stop()`
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This service is the ideal entry point for:
 *
 * - Collision engine (no overlap / push)
 * - Ghost insertion previews
 * - Magnetic snapping
 * - Advanced multiroom interactions
 *
 */
@Injectable({ providedIn: 'root' })
export class TimelineInteractionService {

  private drag = inject(DragSessionService);
  private insert = inject(InsertLineService);
  private slotServ = inject(SlotService);
  private interactionStore = inject(TimelineInteractionStore);
  private resizeInteraction = inject(SlotResizeInteractionService);
  private dragInteraction = inject(SlotDragInteractionService);
  private spatial = inject(TimelineSpatialService);


  /* ------------------ SLOT DRAG ------------------ */

  /**
   * Initiates a slot drag interaction.
   *
   * Delegates the drag initialization to SlotDragInteractionService,
   * which handles multi-selection, offset computation, and preview setup.
   *
   * @param event - Pointer event that started the drag
   * @param slot - The slot being dragged (leader of the interaction)
   */
  startSlotDrag(event: PointerEvent, slot: ArtistPerformanceSlot) {
    this.dragInteraction.start(event, slot);
  };


  /* ------------------ SLOT RESIZE ------------------ */

  /**
   * Initiates a slot resize interaction.
   *
   * Delegates resize logic to SlotResizeInteractionService.
   *
   * @param event - Pointer event that started the resize
   * @param slot - The slot being resized
   */
  startSlotResize(event: PointerEvent, slot: ArtistPerformanceSlot) {
    this.resizeInteraction.start(event, slot);
  };


  /* ------------------ POINTER MOVE ------------------ */

  /**
   * Handles global pointer move events.
   *
   * Determines which interaction is currently active and routes
   * the event to the appropriate handler.
   *
   * Priority order:
   * 1. Slot drag
   * 2. Slot resize
   * 3. Template drag (insert line only)
   *
   * Ensures that only one interaction is processed at a time.
   */
  handlePointerMove() {

    const dragSession = this.drag.current();

    const isSlotDrag = this.dragInteraction.isActive();
    const isResize = this.resizeInteraction.isActive();
    const isTemplateDrag = dragSession?.type === 'template';

    if (!isSlotDrag && !isResize && !isTemplateDrag) {
      return;
    }

    if (isSlotDrag) {
      this.dragInteraction.move();
      return;
    }

    if (isResize) {
      this.resizeInteraction.move();
      return;
    }

    if (isTemplateDrag) {
      this.updateInsertLineForTemplate();
    }
  };


  /* ------------------ STOP ------------------ */

  /**
   * Finalizes the current interaction.
   *
   * If a drag operation is active:
   * - Commits preview positions to the persistent state
   * - Updates both start time and room assignment
   *
   * Then resets all interaction-related state.
   *
   * This is the ONLY place where drag mutations are applied.
   */
  stop() {

    const dragging = this.interactionStore.draggingSlots();

    if (!dragging) {
      return;
    }

    for (const s of dragging) {

      this.slotServ.updateSlotStart(
        s.slot_id,
        s.previewStart
      );

      if (s.previewRoomId) {
        this.slotServ.updateSlotRoom(
          s.slot_id,
          s.previewRoomId
        );
      }
    }

    this.resetAll()
  };


  /* ------------- UTILS / HELPERS ---------- */

  /**
   * Updates the insert line during a template drag.
   *
   * Projects the current pointer position into timeline coordinates
   * and updates the InsertLineService accordingly.
   *
   * Clears the insert line if no valid projection is found.
   */
  private updateInsertLineForTemplate() {

    const projection = this.spatial.projectPointer(0);

    if (!projection) {
      this.insert.clear();
      return;
    }

    this.insert.set(
      projection.minutes,
      projection.room_id,
      false
    );
  }


  /**
   * Resets all interaction-related state.
   *
   * This includes:
   * - Clearing preview slots
   * - Stopping the drag session
   * - Removing insert line
   * - Resetting drag and resize interactions
   *
   * Ensures a clean state after each interaction.
   */
  private resetAll() {
    this.interactionStore.stop();
    this.drag.stop();
    this.insert.clear();
    this.dragInteraction.stop();
    this.resizeInteraction.stop();
  };
}

import { inject, Injectable } from '@angular/core';
import { DragSessionService } from './drag-session.service';
import { DropZoneRegistryService } from './drop-zone-registry.service';


/**
 * Core engine responsible for resolving drag interactions in real time.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * This service belongs to the **Drag & Drop Interaction Engine Layer**.
 *
 * It orchestrates the interaction between:
 *
 * - {@link DragSessionService} → current drag state (source of truth)
 * - {@link DropZoneRegistryService} → spatial resolution of drop targets
 *
 * It acts as the **runtime coordinator** that:
 *
 * - Tracks pointer movement during a drag session
 * - Resolves which drop zone is currently under the cursor
 * - Updates the active drop target
 * - Emits the final drop event when the drag ends
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Listen to pointer events (move / up)
 * - Resolve drop zones via spatial lookup
 * - Update drag session with current drop target
 * - Trigger drop execution when interaction completes
 *
 * ---------------------------------------------------------------------------
 * 🖱️ POINTER MOVE FLOW
 * ---------------------------------------------------------------------------
 *
 * On each pointer move:
 *
 * 1. Retrieve current drag session
 * 2. Resolve the drop zone under the cursor using:
 *    {@link DropZoneRegistryService.findZone}
 * 3. If no zone is found:
 *    - Clear current drop target
 * 4. If a zone is found:
 *    - Update drop target ONLY if it changed
 *
 * This avoids unnecessary signal updates and UI re-renders.
 *
 * ---------------------------------------------------------------------------
 * 🎯 POINTER UP FLOW (DROP)
 * ---------------------------------------------------------------------------
 *
 * When the pointer is released:
 *
 * 1. Retrieve current drag session
 * 2. Get the active drop target (if any)
 * 3. If a valid target exists:
 *    - Dispatch drop via {@link DropZoneRegistryService.emitDrop}
 * 4. Stop the drag session
 *
 * ---------------------------------------------------------------------------
 * 🔁 INTERACTION LIFECYCLE
 * ---------------------------------------------------------------------------
 *
 * DragSessionService.start()
 *        ↓
 * PointerMove → zone detection → target update
 *        ↓
 * PointerUp → emit drop → stop session
 *
 * ---------------------------------------------------------------------------
 * 🧠 DESIGN PRINCIPLES
 * ---------------------------------------------------------------------------
 *
 * - Centralized interaction logic (single engine)
 * - Stateless execution (relies on DragSessionService)
 * - Minimal side effects
 * - Optimized updates (avoids redundant state changes)
 *
 * ---------------------------------------------------------------------------
 * ⚠️ NOTES
 * ---------------------------------------------------------------------------
 *
 * - This service does NOT manage pointer listeners itself
 *   (handled externally, e.g. via directives or global listeners)
 *
 * - This service does NOT handle:
 *   - Drag preview rendering
 *   - Domain mutations
 *
 * - It only coordinates interaction flow and delegates responsibilities
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This engine can evolve to support:
 *
 * - Drag hover state (enter / leave zones)
 * - Drop validation (canDrop logic)
 * - Snap / magnetic zones
 * - Multi-target resolution strategies (priority, z-index)
 * - Gesture support (touch, multi-pointer)
 *
 */
@Injectable({
  providedIn: 'root'
})
export class DragEngineService {

  private drag = inject(DragSessionService);
  private registry = inject(DropZoneRegistryService);

  onPointerMove(event: PointerEvent) {

    const drag = this.drag.current();
    if (!drag) {
      return;
    }

    const zone = this.registry.findZone(
      event.clientX,
      event.clientY,
      drag.type
    );

    if (!zone) {
      this.drag.clearDropTarget();
      return;
    }

    // éviter des updates inutiles
    const current = this.drag.getDropTarget();

    if (current !== zone.id) {
      this.drag.setDropTarget(zone.id);
    }
  }

  onPointerUp() {

    const drag = this.drag.current();
    if (!drag) {
      return;
    }

    const target = this.drag.getDropTarget();

    if (target !== null) {
      this.registry.emitDrop(target, drag);
    }

    this.drag.stop();
  }

}

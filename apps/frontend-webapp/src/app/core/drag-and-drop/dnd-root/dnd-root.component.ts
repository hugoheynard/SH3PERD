import { Component, HostListener, inject } from '@angular/core';
import { DragSessionService } from '../drag-session.service';
import { DragEngineService } from '../drag-engine.service';


/**
 * Root component responsible for capturing global pointer events
 * and driving the Drag & Drop engine.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * This component acts as the **global interaction bridge** between:
 *
 * - The browser (pointer events)
 * - The Drag & Drop engine ({@link DragEngineService})
 * - The drag session state ({@link DragSessionService})
 *
 * It ensures that drag interactions continue to work even when the pointer
 * moves outside of the original draggable element.
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Listen to global pointer events (`pointermove`, `pointerup`)
 * - Update cursor position during an active drag session
 * - Delegate interaction logic to {@link DragEngineService}
 * - Ensure proper termination of drag sessions
 *
 * ---------------------------------------------------------------------------
 * 🖱️ POINTER FLOW
 * ---------------------------------------------------------------------------
 *
 * pointermove (global):
 *
 * 1. Check if a drag session is active
 * 2. Update pointer position in {@link DragSessionService}
 * 3. Delegate to {@link DragEngineService.onPointerMove}
 *    → resolves drop zones
 *    → updates active drop target
 *
 * pointerup (global):
 *
 * 1. Check if a drag session is active
 * 2. Delegate to {@link DragEngineService.onPointerUp}
 *    → triggers drop if a valid target exists
 *    → stops the drag session
 *
 * ---------------------------------------------------------------------------
 * 🎯 WHY GLOBAL LISTENERS
 * ---------------------------------------------------------------------------
 *
 * Drag interactions must remain active even when:
 *
 * - The pointer leaves the draggable element
 * - The pointer moves outside component boundaries
 *
 * Using `document:` listeners ensures:
 *
 * - Reliable drag tracking
 * - Consistent drop behavior
 *
 * ---------------------------------------------------------------------------
 * 🧠 DESIGN PRINCIPLES
 * ---------------------------------------------------------------------------
 *
 * - Centralized event handling (single root listener)
 * - Delegation to services (no business logic here)
 * - Minimal logic (only orchestration)
 * - Works with any draggable / drop zone in the app
 *
 * ---------------------------------------------------------------------------
 * ⚠️ NOTES
 * ---------------------------------------------------------------------------
 *
 * - This component must be mounted once at app level
 * - It should wrap or be present alongside the planner UI
 *
 * - Does NOT handle:
 *   - Drag start (handled by {@link DndDragDirective})
 *   - Drop resolution logic (handled by {@link DragEngineService})
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This root can be extended to support:
 *
 * - Global keyboard shortcuts (ESC to cancel drag)
 * - Drag overlays / portals
 * - Auto-scroll when dragging near edges
 * - Multi-pointer / touch support
 *
 * ---------------------------------------------------------------------------
 * 💡 USAGE
 * ---------------------------------------------------------------------------
 *
 * This component should be included once in the application layout:
 *
 * ```html
 * <ui-dnd-root></ui-dnd-root>
 * ```
 *
 * It does not render UI but enables the drag engine globally.
 *
 */
@Component({
  selector: 'ui-dnd-root',
  imports: [],
  templateUrl: './dnd-root.component.html',
  styleUrl: './dnd-root.component.scss'
})
export class DndRootComponent {

  private drag = inject(DragSessionService);
  private engine = inject(DragEngineService);

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {

    if (!this.drag.isDragging()) {
      return;
    }

    this.drag.updatePointer(event);
    this.engine.onPointerMove(event);
  };

  @HostListener('document:pointerup')
  onPointerUp() {

    if (!this.drag.isDragging()) {
      return;
    }

    this.engine.onPointerUp();
  }

}

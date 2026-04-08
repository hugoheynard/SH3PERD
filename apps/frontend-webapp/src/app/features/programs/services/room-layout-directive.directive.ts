import { Directive, ElementRef, inject, input, PLATFORM_ID, type OnDestroy, type OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RoomLayoutRegistry } from './room-layout-registry.service';


/**
 * Directive responsible for registering a room's layout
 * into the {@link RoomLayoutRegistry}.
 *
 * This directive attaches to a DOM element representing the **timeline surface
 * of a room** (typically the slots container) and allows the application to:
 *
 * - Map pointer coordinates (Y) to a specific room
 * - Compute relative offsets inside the room (for drag, insert line, etc.)
 * - Avoid expensive DOM queries during interactions
 *
 * ---------------------------------------------------------------------------
 * 🧠 ARCHITECTURE ROLE
 * ---------------------------------------------------------------------------
 *
 * This directive is part of the **Spatial Engine layer**.
 *
 * It bridges:
 *
 * - The **DOM (layout / bounding box)**
 * - The **RoomLayoutRegistry (in-memory spatial index)**
 *
 * By registering the element’s bounding rectangle, it enables fast and
 * deterministic hit detection during drag operations, replacing the need for
 * `document.elementFromPoint`.
 *
 * ---------------------------------------------------------------------------
 * ⚡ BEHAVIOR
 * ---------------------------------------------------------------------------
 *
 * - On init:
 *   → registers the element and its layout in the registry
 *
 * - On destroy:
 *   → unregisters the element to keep the registry clean
 *
 * ⚠️ The directive does NOT handle layout updates automatically.
 * The registry must be refreshed manually on:
 * - window resize
 * - scroll changes
 * - zoom / scale updates
 *
 * ---------------------------------------------------------------------------
 * 🎯 USAGE
 * ---------------------------------------------------------------------------
 *
 * This directive should be applied to the **timeline surface element**
 * of a room (i.e. the element representing the vertical time axis),
 * typically the same element used for:
 *
 * - drag & drop zone
 * - slot rendering container
 * - insert line positioning
 *
 * Example:
 *
 * ```html
 * <div
 *   class="slots-layer"
 *   uiRoomLayout
 *   [roomId]="room.id"
 * >
 * </div>
 * ```
 *
 * ---------------------------------------------------------------------------
 * 💡 DESIGN NOTES
 * ---------------------------------------------------------------------------
 *
 * - Uses Angular signals `input.required()` for strong typing
 * - Keeps no internal state (pure registration layer)
 * - Designed to be lightweight and scalable
 * - Enables future features like:
 *   - cross-room drag
 *   - collision detection
 *   - virtualized timelines
 *
 */
@Directive({
  selector: '[uiRoomLayout]',
  standalone: true
})
export class RoomLayoutDirective implements OnInit, OnDestroy {

  private el = inject(ElementRef<HTMLElement>);
  private registry = inject(RoomLayoutRegistry);

  /**
   * Unique identifier of the room associated with this layout.
   *
   * This ID is used as the key inside the RoomLayoutRegistry
   * to map pointer positions to a specific room.
   */
  roomId = input.required<string>();

  /**
   * Registers the element in the RoomLayoutRegistry
   * when the directive is initialized.
   */
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnInit() {
    if (this.isBrowser) {
      this.registry.register(this.roomId(), this.el.nativeElement);
    }
  }

  /**
   * Unregisters the element from the RoomLayoutRegistry
   * when the directive is destroyed.
   */
  ngOnDestroy() {
    this.registry.unregister(this.roomId());
  }
}

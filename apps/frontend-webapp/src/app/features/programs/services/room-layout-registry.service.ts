import { Injectable } from '@angular/core';


/**
 * Registry responsible for mapping room DOM elements
 * to their spatial layout (DOMRect).
 *
 * This service allows fast lookup of which room is under a given pointer,
 * without relying on costly DOM queries like `elementFromPoint`.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Part of the "Spatial Engine" layer.
 *
 * Replaces DOM-based hit detection with a deterministic layout registry.
 *
 * ---------------------------------------------------------------------------
 * ⚡ BENEFITS
 * ---------------------------------------------------------------------------
 *
 * - Avoids repeated DOM queries during pointer move
 * - Improves performance for large timelines
 * - Enables future features (virtualization, zoom, snapping)
 *
 */
@Injectable({ providedIn: 'root' })
export class RoomLayoutRegistry {

  private rooms = new Map<string, {
    el: HTMLElement;
    rect: DOMRect;
  }>();

  /**
   * Register a room element and cache its layout.
   */
  register(roomId: string, el: HTMLElement) {
    this.rooms.set(roomId, {
      el,
      rect: el.getBoundingClientRect()
    });
  }

  /**
   * Remove a room from registry.
   */
  unregister(roomId: string) {
    this.rooms.delete(roomId);
  }

  /**
   * Update all room layouts.
   *
   * ⚠️ Should be called on:
   * - resize
   * - scroll
   * - zoom changes
   */
  refresh() {
    this.rooms.forEach((entry) => {
      entry.rect = entry.el.getBoundingClientRect();
    });
  }

  /**
   * Returns the room ID at a given Y coordinate.
   */
  getRoomAt(x: number): string | null {
    for (const [id, { rect }] of this.rooms) {

      if (!rect.width) continue;

      if (x >= rect.left && x <= rect.right) {
        return id;
      }
    }
    return null;
  };

  /**
   * Returns the layout rect of a room.
   */
  getRect(roomId: string): DOMRect | null {
    return this.rooms.get(roomId)?.rect ?? null;
  }
}

import { Component, computed, input, output } from '@angular/core';
import type { InsertActionType } from '../actions-services/insert-action.types';
import type { RadialMenuItem } from '../radial-menu.types';


/**
 * Internal computed representation of a radial item.
 *
 * Adds cartesian coordinates derived from angle + radius.
 */
type RadialItemComputed = RadialMenuItem & {
  x: string;
  y: string;
};


/**
 * Radial menu component used to display insert actions.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Part of the **UI layer of the Insert Interaction System**.
 *
 * This component is responsible for:
 *
 * - Rendering actions in a circular layout
 * - Computing item positions based on angle + radius
 * - Emitting selected actions
 *
 * It does NOT:
 * - know anything about insert logic
 * - interact with application state
 *
 * ---------------------------------------------------------------------------
 * 🔄 ARCHITECTURE FLOW
 * ---------------------------------------------------------------------------
 *
 * ```
 * InsertLineComponent
 *        │
 *        ▼
 * RadialMenuComponent (this)
 *        │
 *        ▼
 * select.emit(type)
 *        │
 *        ▼
 * InsertActionService.execute(type)
 * ```
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Accept a list of radial items (immutable)
 * - Convert polar coordinates (angle) → cartesian (x/y)
 * - Render items using CSS variables
 * - Emit selected action type
 *
 * ---------------------------------------------------------------------------
 * 🎯 POSITIONING SYSTEM
 * ---------------------------------------------------------------------------
 *
 * Each item uses:
 *
 * - `angle` → defines direction
 * - `radius` → defines distance from center
 *
 * Converted using:
 *
 * ```
 * x = cos(angle) * radius
 * y = sin(angle) * radius
 * ```
 *
 * Values are exposed as strings for CSS usage.
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - `items` must be immutable (ReadonlyArray)
 * - `type` must match InsertActionType
 * - This component is purely presentational
 *
 * ---------------------------------------------------------------------------
 * 💡 DESIGN PRINCIPLES
 * ---------------------------------------------------------------------------
 *
 * - Stateless UI component
 * - Declarative rendering
 * - Signal-based computation
 * - Fully reusable
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * - Icons per item
 * - Disabled / conditional items
 * - Animations based on `open`
 * - Dynamic radius / layout
 *
 */
@Component({
  selector: 'ui-radial-menu',
  templateUrl: './radial-menu.component.html',
  styleUrl: './radial-menu.component.scss'
})
export class RadialMenuComponent {

  /* ---------------------------------------------------------------------------
   * 📦 INPUTS / OUTPUTS
   * --------------------------------------------------------------------------- */

  /**
   * Radial menu items (immutable configuration).
   */
  items = input.required<ReadonlyArray<RadialMenuItem>>();

  /**
   * Controls menu visibility / animation state.
   */
  open = input(false);

  /**
   * Emits the selected action type.
   */
  select = output<InsertActionType>();


  /* ---------------------------------------------------------------------------
   * ⚙️ CONFIG
   * --------------------------------------------------------------------------- */

  /**
   * Distance from center (in pixels).
   */
  radius = 60;


  /* ---------------------------------------------------------------------------
   * 🧠 COMPUTED STATE
   * --------------------------------------------------------------------------- */

  /**
   * Computes item positions in cartesian coordinates.
   *
   * Converts polar coordinates (angle + radius)
   * into x/y values usable by CSS variables.
   *
   * This avoids overriding CSS transform and keeps animations intact.
   */
  computedItems = computed<RadialItemComputed[]>(() => {
    return this.items().map(item => {

      const rad = (item.angle * Math.PI) / 180;

      const x = Math.cos(rad) * this.radius;
      const y = Math.sin(rad) * this.radius;

      return {
        ...item,
        x: `${x}px`,
        y: `${y}px`
      };
    });
  });


  /* ---------------------------------------------------------------------------
   * 🖱️ INTERACTIONS
   * --------------------------------------------------------------------------- */

  /**
   * Emits the selected item type.
   *
   * @param type - Selected action type
   */
  onSelect(type: InsertActionType) {
    this.select.emit(type);
  }
}

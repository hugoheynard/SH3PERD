import {
  Component,
  effect,
  HostBinding,
  inject,
  input,
  signal
} from '@angular/core';

import { RadialMenuComponent } from '../radial-menu/radial-menu.component';
import { InsertLineService } from '../state-services/insert-line.service';
import { InsertActionService } from '../actions-services/insert-action.service';
import { RADIAL_MENU_ITEM_CONFIG } from '../radial-menu.config';
import type { InsertActionType } from '../actions-services/insert-action.types';


/**
 * Visual component representing the insert line and its radial action menu.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Part of the **Insert Interaction System (UI layer)**.
 *
 * This component is responsible for:
 *
 * - Rendering the insert line at a given vertical position
 * - Displaying a contextual "+" button
 * - Opening a radial menu of insert actions
 * - Dispatching user-selected actions
 *
 * It does NOT:
 * - perform spatial calculations
 * - mutate application state directly
 *
 * All logic is delegated to:
 *
 * - {@link InsertLineService} → manages insert state (preview / locked)
 * - {@link InsertActionService} → executes actions
 *
 * ---------------------------------------------------------------------------
 * 🔄 ARCHITECTURE FLOW
 * ---------------------------------------------------------------------------
 *
 * ```
 * RoomColumnComponent
 *        │
 *        ▼
 * InsertLineComponent (this)
 *        │
 *        ▼
 * InsertActionService.execute(type)
 *        │
 *        ▼
 * InsertActionRegistry
 *        │
 *        ▼
 * Domain Services (CueService, SlotService...)
 * ```
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Position itself using a pixel-based `top` input
 * - Toggle the radial menu
 * - Lock the insert position when opening the menu
 * - Dispatch selected actions
 *
 * ---------------------------------------------------------------------------
 * 🎯 INTERACTION MODEL
 * ---------------------------------------------------------------------------
 *
 * 1. ALT mode active → insert preview follows pointer
 * 2. User clicks "+" →
 *    - insert position is locked
 *    - radial menu opens
 * 3. User selects an action →
 *    - action is executed
 *    - insert state is cleared
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - This component is purely presentational
 * - Insert position is controlled externally (via inputs)
 * - Action types must match InsertActionRegistry registrations
 *
 * ---------------------------------------------------------------------------
 * 💡 DESIGN PRINCIPLES
 * ---------------------------------------------------------------------------
 *
 * - Dumb UI component
 * - Signal-based reactivity
 * - No business logic
 * - Fully decoupled from domain layer
 *
 */
@Component({
  selector: 'ui-insert-line',
  standalone: true,
  templateUrl: './insert-line.component.html',
  styleUrl: './insert-line.component.scss',
  imports: [
    RadialMenuComponent,
  ],
})
export class InsertLineComponent {

  /* ---------------------------------------------------------------------------
   * 🔌 DEPENDENCIES
   * --------------------------------------------------------------------------- */

  private insert = inject(InsertLineService);
  private insertAction = inject(InsertActionService);

  /**
   * Radial menu configuration (UI only).
   */
  protected readonly RADIAL_MENU_ITEM_CONFIG = RADIAL_MENU_ITEM_CONFIG;


  /* ---------------------------------------------------------------------------
   * 📦 INPUTS
   * --------------------------------------------------------------------------- */

  /**
   * Vertical position (in pixels) inside the timeline container.
   */
  top = input.required<number>();

  /**
   * Optional room identifier (not currently used in this component).
   */
  roomId = input<string>();

  /**
   * Whether the "+" button should be displayed.
   */
  showButton = input(false);


  /* ---------------------------------------------------------------------------
   * 🧠 LOCAL STATE
   * --------------------------------------------------------------------------- */

  /**
   * Controls visibility of the radial menu.
   */
  menuOpen = signal(false);


  /* ---------------------------------------------------------------------------
   * ⚙️ LIFECYCLE
   * --------------------------------------------------------------------------- */

  constructor() {
    /**
     * Automatically closes the radial menu when ALT mode is disabled.
     */
    effect(() => {
      if (!this.insert.altMode()) {
        this.menuOpen.set(false);
      }
    });

    effect(() => {
      if (!this.menuOpen()) {
        this.insert.setPreviewType(null);
      }
    });
  }


  /* ---------------------------------------------------------------------------
   * 🎯 HOST BINDINGS
   * --------------------------------------------------------------------------- */

  /**
   * Applies vertical positioning to the host element.
   */
  @HostBinding('style.top.px')
  get hostTop() {
    return this.top();
  }


  /* ---------------------------------------------------------------------------
   * 🖱️ INTERACTIONS
   * --------------------------------------------------------------------------- */

  /**
   * Toggles the radial menu.
   *
   * Locks the insert position if not already locked.
   */
  toggleMenu() {

    if (!this.insert.isLocked()) {
      this.insert.lock();
    }

    this.menuOpen.update(v => !v);
  }

  /**
   * Handles selection of an insert action.
   *
   * @param type - Selected action type
   */
  handleSelect(type: InsertActionType) {

    this.menuOpen.set(false);

    this.insertAction.execute(type);
  }

  //NEW
  handleRadialButtonHover(type: InsertActionType) {
    this.insert.setPreviewType(type);
  }

  handleRadialButtonLeave() {
    this.insert.setPreviewType(null);
  }
}

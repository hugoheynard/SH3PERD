import type { RadialMenuItem } from './radial-menu.types';

/**
 * Configuration for the radial insert menu.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Part of the **UI configuration layer** for the Insert Interaction System.
 *
 * This constant defines how insert actions are **presented visually**
 * in the radial menu:
 *
 * - Which actions are available
 * - How they are labeled
 * - Where they are positioned (angle)
 *
 * It acts as a **bridge between UI and interaction system**, but contains
 * no business logic.
 *
 * ---------------------------------------------------------------------------
 * 🎯 STRUCTURE
 * ---------------------------------------------------------------------------
 *
 * Each item describes:
 *
 * - `type`  → InsertActionType (used by InsertActionService)
 * - `label` → Display label in the UI
 * - `angle` → Position in the radial layout (degrees)
 *
 * ---------------------------------------------------------------------------
 * 🔄 ARCHITECTURE FLOW
 * ---------------------------------------------------------------------------
 *
 * ```
 * RADIAL_MENU_ITEM_CONFIG
 *        │
 *        ▼
 * RadialMenuComponent (UI)
 *        │
 *        ▼
 * InsertActionService.execute(type)
 *        │
 *        ▼
 * InsertActionRegistry → handler → domain
 * ```
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - `type` MUST match a registered InsertActionType
 * - If no handler is registered → action will be ignored at runtime
 * - Angles are expressed in degrees and control visual distribution
 *
 * ---------------------------------------------------------------------------
 * 💡 DESIGN PRINCIPLES
 * ---------------------------------------------------------------------------
 *
 * - Fully declarative (no logic)
 * - Easily extendable (add/remove items)
 * - Decoupled from domain logic
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This config can evolve to support:
 *
 * - Icons (`icon`)
 * - Conditional visibility (`visible`)
 * - Permissions (`disabled`)
 * - Tooltips / descriptions
 *
 * Example:
 *
 * ```ts
 * { type: 'cue', label: 'Cue', angle: -90, icon: '⚡' }
 * ```
 *
 */
export const RADIAL_MENU_ITEM_CONFIG: ReadonlyArray<RadialMenuItem> = [
  { type: 'cue', label: 'Cue', angle: -90 },
  { type: 'buffer', label: 'Buf', angle: -30 },
  { type: 'slot', label: 'Slot', angle: 30 },
  { type: 'note', label: 'Note', angle: 90 },
] as const satisfies ReadonlyArray<RadialMenuItem>

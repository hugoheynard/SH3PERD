import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

// ─── Tab item definition ─────────────────────────────────────

export interface TabNavItem {
  /** Unique key used to identify the tab and emitted on click. */
  key: string;
  /** Display label shown inside the tab. */
  label: string;
  /**
   * Optional SVG icon displayed before the label.
   *
   * Pass the `d` attribute of a single `<path>` element (Material Icons format).
   * The component renders a 14×14 SVG with `fill="currentColor"` and `viewBox="0 0 24 24"`.
   *
   * @example
   * // Material "info" icon
   * icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 ...'
   *
   * Find icons at https://fonts.google.com/icons → copy the SVG path `d` value.
   */
  icon?: string;
  /**
   * Optional badge displayed after the label (e.g. a count).
   * Set to `undefined` or `null` to hide.
   */
  badge?: string | number;
}

// ─── Component ───────────────────────────────────────────────

/**
 * `<sh3-tab-nav>` — Reusable tab navigation bar.
 *
 * This component renders **only the tab buttons** (the navigation bar).
 * It does NOT render tab content — the parent component is responsible for
 * showing/hiding content based on the active key.
 *
 * The bar takes 100% width of its parent. The parent controls the surrounding
 * layout (e.g. sidebar + content area for vertical mode).
 *
 * **Convention: always set `activeStyle` and `direction` explicitly for readability,
 * even though defaults exist.**
 *
 * ## Inputs
 *
 * | Input        | Type                         | Default        | Description                                |
 * |------------- |------------------------------|----------------|--------------------------------------------|
 * | `tabs`       | `TabNavItem[]` (required)    | —              | The tabs to render.                        |
 * | `activeKey`  | `string` (required)          | —              | Key of the currently active tab.           |
 * | `activeStyle`| `'underline' \| 'fill'`      | `'underline'`  | How the active tab is visually indicated.  |
 * | `direction`  | `'horizontal' \| 'vertical'` | `'horizontal'` | Orientation of the button bar itself.      |
 *
 * ### `activeStyle`
 * - **`'underline'`** — Accent-colored border on the active tab.
 *   Horizontal → bottom border. Vertical → left border.
 * - **`'fill'`** — Accent-colored background pill on the active tab.
 *   Good for sidebar navigation.
 *
 * ### `direction`
 * Controls the orientation of **the button bar only**, not the page layout.
 * The parent is responsible for positioning the bar and the tab content side by side.
 *
 * - **`'horizontal'`** — Buttons in a row, each `flex: 1`, centered text, compact font.
 *   Use in: popovers, inline tab panels, detail pages.
 * - **`'vertical'`** — Buttons stacked in a column, left-aligned, larger font.
 *   Use in: settings sidebar, navigation panels.
 *   **Responsive:** automatically switches to horizontal on mobile (≤768px).
 *
 * ## Output
 *
 * | Output      | Type     | Description                        |
 * |-------------|----------|------------------------------------|
 * | `tabChange` | `string` | Emits the `key` of the clicked tab.|
 *
 * ## Usage examples
 *
 * **Horizontal underline (popover, detail page):**
 * ```html
 * <sh3-tab-nav
 *   [tabs]="[
 *     { key: 'members', label: 'Members', icon: 'M16 11c1.66...', badge: 3 },
 *     { key: 'channels', label: 'Channels', icon: 'M20 2H4c...' },
 *     { key: 'settings', label: 'Settings', icon: 'M19.14,12.94...' }
 *   ]"
 *   [activeKey]="activeTab()"
 *   activeStyle="underline"
 *   direction="horizontal"
 *   (tabChange)="activeTab.set($event)"
 * />
 * ```
 *
 * **Vertical fill (settings sidebar):**
 * The parent wraps the bar + content in a flex row.
 * The bar is just one column — the parent sizes it (e.g. `width: 180px`).
 * ```html
 * <div class="settings-layout"> <!-- display: flex -->
 *   <sh3-tab-nav
 *     [tabs]="settingsTabs"
 *     [activeKey]="activeTab()"
 *     activeStyle="fill"
 *     direction="vertical"
 *     (tabChange)="setTab($event)"
 *   />
 *   <div class="settings-content">
 *     <!-- tab content here -->
 *   </div>
 * </div>
 * ```
 *
 * **Minimal (no icons, no badges):**
 * ```html
 * <sh3-tab-nav
 *   [tabs]="[{ key: 'a', label: 'Tab A' }, { key: 'b', label: 'Tab B' }]"
 *   [activeKey]="'a'"
 *   activeStyle="underline"
 *   direction="horizontal"
 *   (tabChange)="onTab($event)"
 * />
 * ```
 */
@Component({
  selector: 'sh3-tab-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-nav.component.html',
  styleUrl: './tab-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabNavComponent {
  readonly tabs = input.required<TabNavItem[]>();
  readonly activeKey = input.required<string>();
  readonly activeStyle = input<'underline' | 'fill'>('underline');
  readonly direction = input<'horizontal' | 'vertical'>('horizontal');
  readonly tabChange = output<string>();
}

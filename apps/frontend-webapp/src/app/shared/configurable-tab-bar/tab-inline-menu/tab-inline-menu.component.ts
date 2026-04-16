import { Component, input, output, signal } from '@angular/core';
import type { TabItem, SavedTabConfig } from '../configurable-tab-bar.types';

/**
 * Inline action popover that appears next to a tab when its ⋮ menu is open.
 *
 * Three actions:
 * - **Color** — emits `colorRequested`; the parent bar owns the hidden
 *   `<input type="color">` and opens it on receipt.
 * - **Move to config** — only rendered when at least one saved config exists.
 *   Opens a fixed-position dropdown, emits `moveToConfig` on selection.
 * - **Close** — only rendered when `canClose` is true (i.e. >1 tab remaining).
 *
 * Self-contained: owns the move-dropdown open state and its pixel position.
 * Never touches the color picker DOM itself — that stays in the parent bar.
 */
@Component({
  selector: 'sh3-tab-inline-menu',
  standalone: true,
  imports: [],
  templateUrl: './tab-inline-menu.component.html',
  styleUrl: './tab-inline-menu.component.scss',
})
export class TabInlineMenuComponent {

  /* ── Inputs ────────────────────────────────────── */
  readonly tab = input.required<TabItem<unknown>>();
  readonly savedConfigs = input<SavedTabConfig<unknown>[]>([]);
  readonly canClose = input<boolean>(true);

  /* ── Outputs ───────────────────────────────────── */
  readonly colorRequested = output<string>();
  readonly moveToConfig = output<{ tab: TabItem<unknown>; targetConfigId: string }>();
  readonly closeRequested = output<string>();

  /* ── Local UI state ────────────────────────────── */
  readonly moveMenuOpen = signal(false);
  readonly moveDropdownPos = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  /* ── Handlers ──────────────────────────────────── */

  onColor(event: MouseEvent): void {
    event.stopPropagation();
    this.colorRequested.emit(this.tab().id);
  }

  onToggleMoveMenu(event: MouseEvent, btnEl: HTMLElement): void {
    event.stopPropagation();
    const opening = !this.moveMenuOpen();
    this.moveMenuOpen.set(opening);
    if (opening) {
      const rect = btnEl.getBoundingClientRect();
      this.moveDropdownPos.set({ top: rect.bottom + 4, left: rect.left });
    }
  }

  onMoveTo(targetConfigId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.moveToConfig.emit({ tab: this.tab(), targetConfigId });
    this.moveMenuOpen.set(false);
  }

  onClose(event: MouseEvent): void {
    event.stopPropagation();
    this.closeRequested.emit(this.tab().id);
  }
}

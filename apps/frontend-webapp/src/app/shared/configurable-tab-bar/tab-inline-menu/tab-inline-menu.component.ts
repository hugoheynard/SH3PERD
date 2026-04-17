import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { ButtonComponent } from '../../button/button.component';
import { ButtonIconComponent } from '../../button-icon/button-icon.component';
import { IconComponent } from '../../icon/icon.component';
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
  imports: [ButtonComponent, ButtonIconComponent, IconComponent],
  templateUrl: './tab-inline-menu.component.html',
  styleUrl: './tab-inline-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabInlineMenuComponent {
  /* ── Inputs ────────────────────────────────────── */
  readonly tab = input.required<TabItem<unknown>>();
  /**
   * Candidate target configs for the "move to" dropdown. Each config's
   * optional `locked` flag drives the per-row lock visual and output
   * routing — no separate lookup table needed.
   */
  readonly savedConfigs = input<SavedTabConfig<unknown>[]>([]);
  readonly canClose = input<boolean>(true);
  /**
   * Whether the "move to config" action is available at all. Even with saved
   * configs present, the host can gate the entire button (e.g. plan
   * downgrade leaves configs frozen but prevents mutation of them).
   */
  readonly canMoveToConfig = input<boolean>(true);
  /** i18n labels — forwarded by the orchestrator. */
  readonly colorLabel = input<string>('Color');
  readonly moveToConfigLabel = input<string>('Move to config');
  readonly moveToLabel = input<string>('Move to');
  readonly closeLabel = input<string>('Close');

  /* ── Outputs ───────────────────────────────────── */
  readonly colorRequested = output<string>();
  readonly moveToConfig = output<{ tabId: string; targetConfigId: string }>();
  readonly moveToLockedConfig = output<{
    tabId: string;
    targetConfigId: string;
  }>();
  readonly closeRequested = output<string>();

  /* ── Local UI state ────────────────────────────── */
  readonly moveMenuOpen = signal(false);
  readonly moveDropdownPos = signal<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

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

  onMoveTo(cfg: SavedTabConfig<unknown>, event: MouseEvent): void {
    event.stopPropagation();
    const payload = { tabId: this.tab().id, targetConfigId: cfg.id };
    if (cfg.locked) {
      this.moveToLockedConfig.emit(payload);
    } else {
      this.moveToConfig.emit(payload);
    }
    this.moveMenuOpen.set(false);
  }

  onClose(event: MouseEvent): void {
    event.stopPropagation();
    this.closeRequested.emit(this.tab().id);
  }
}

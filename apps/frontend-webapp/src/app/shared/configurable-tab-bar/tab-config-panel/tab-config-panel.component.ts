import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../button/button.component';
import { InputComponent } from '../../forms/input/input.component';
import { IconComponent } from '../../icon/icon.component';
import { ToastService } from '../../toast/toast.service';
import type { SavedTabConfig } from '../configurable-tab-bar.types';

/**
 * Config save/load panel rendered on the right side of the tab bar.
 *
 * Surfaces two top-level buttons — Save (or New when a config is active) and
 * Load — and the two floating panels they toggle:
 * - **Save form** — a one-field inline form that emits `configSave`.
 * - **Load menu** — the list of saved configs with per-config expand, rename,
 *   delete, and per-config-tab rename/remove/move submenu.
 *
 * All mutations are emitted as outputs for the parent bar to dispatch through
 * its TAB_HANDLERS contract. Built-in toasts for the three user-visible
 * operations (new, save, load) are triggered locally when `showToasts` is on.
 */
@Component({
  selector: 'sh3-tab-config-panel',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, IconComponent],
  templateUrl: './tab-config-panel.component.html',
  styleUrl: './tab-config-panel.component.scss',
})
export class TabConfigPanelComponent {

  private toast = inject(ToastService);

  /* ── Inputs ────────────────────────────────────── */
  readonly activeConfigId = input<string | null>(null);
  readonly savedConfigs = input<SavedTabConfig<unknown>[]>([]);
  /** Show built-in toast notifications for config operations. */
  readonly showToasts = input<boolean>(true);

  /* ── Outputs ───────────────────────────────────── */
  readonly configSave = output<string>();
  readonly configNew = output<void>();
  readonly configLoad = output<SavedTabConfig<unknown>>();
  readonly configDelete = output<string>();
  readonly configRename = output<{ configId: string; name: string }>();
  readonly configTabRemove = output<{ configId: string; tabId: string }>();
  readonly configTabRename = output<{ configId: string; tabId: string; title: string }>();
  readonly configTabMove = output<{ sourceConfigId: string; targetConfigId: string; tabId: string }>();

  /* ── Save / load UI state ──────────────────────── */
  readonly showSaveForm = signal(false);
  readonly showLoadMenu = signal(false);
  readonly saveFormName = signal('');

  /* ── Config editing state ──────────────────────── */
  readonly expandedConfigId = signal<string | null>(null);
  readonly editingConfigNameId = signal<string | null>(null);
  editConfigName = '';
  readonly editingConfigTabId = signal<{ configId: string; tabId: string } | null>(null);
  editConfigTabTitle = '';
  readonly moveMenuTabCtx = signal<{ configId: string; tabId: string } | null>(null);

  /* ── Top-level actions ─────────────────────────── */

  onNewConfig(event: MouseEvent): void {
    event.stopPropagation();
    this.showLoadMenu.set(false);
    this.showSaveForm.set(false);
    this.configNew.emit();
    if (this.showToasts()) this.toast.show('New configuration started', 'info');
  }

  toggleSaveForm(): void {
    this.showSaveForm.update(v => !v);
    this.showLoadMenu.set(false);
    this.saveFormName.set('');
  }

  toggleLoadMenu(): void {
    this.showLoadMenu.update(v => !v);
    this.showSaveForm.set(false);
  }

  submitSaveForm(): void {
    const name = this.saveFormName().trim();
    if (!name) return;
    this.configSave.emit(name);
    this.showSaveForm.set(false);
    this.saveFormName.set('');
    if (this.showToasts()) this.toast.show(`Config "${name}" saved`, 'success');
  }

  onLoadConfig(config: SavedTabConfig<unknown>): void {
    this.configLoad.emit(config);
    this.showLoadMenu.set(false);
    if (this.showToasts()) this.toast.show(`Config "${config.name}" applied`, 'success');
  }

  onDeleteConfig(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.configDelete.emit(id);
    if (this.showToasts()) this.toast.show('Config deleted', 'info');
  }

  /* ── Config editing ────────────────────────────── */

  toggleConfigExpand(configId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.expandedConfigId.update(id => id === configId ? null : configId);
  }

  startConfigRename(configId: string, name: string, event: MouseEvent): void {
    event.stopPropagation();
    this.editingConfigNameId.set(configId);
    this.editConfigName = name;
  }

  commitConfigRename(configId: string): void {
    const name = this.editConfigName.trim();
    if (name) this.configRename.emit({ configId, name });
    this.editingConfigNameId.set(null);
  }

  startConfigTabRename(configId: string, tabId: string, title: string, event: MouseEvent): void {
    event.stopPropagation();
    this.editingConfigTabId.set({ configId, tabId });
    this.editConfigTabTitle = title;
  }

  commitConfigTabRename(): void {
    const ctx = this.editingConfigTabId();
    if (!ctx) return;
    const title = this.editConfigTabTitle.trim();
    if (title) this.configTabRename.emit({ configId: ctx.configId, tabId: ctx.tabId, title });
    this.editingConfigTabId.set(null);
  }

  onRemoveTabFromConfig(configId: string, tabId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.configTabRemove.emit({ configId, tabId });
  }

  toggleMoveMenu(configId: string, tabId: string, event: MouseEvent): void {
    event.stopPropagation();
    const ctx = this.moveMenuTabCtx();
    if (ctx?.configId === configId && ctx?.tabId === tabId) {
      this.moveMenuTabCtx.set(null);
    } else {
      this.moveMenuTabCtx.set({ configId, tabId });
    }
  }

  onMoveTabToConfig(targetConfigId: string, event: MouseEvent): void {
    event.stopPropagation();
    const ctx = this.moveMenuTabCtx();
    if (!ctx) return;
    this.configTabMove.emit({ sourceConfigId: ctx.configId, targetConfigId, tabId: ctx.tabId });
    this.moveMenuTabCtx.set(null);
  }

  moveTargetConfigs(sourceConfigId: string): SavedTabConfig<unknown>[] {
    return this.savedConfigs().filter(c => c.id !== sourceConfigId);
  }
}

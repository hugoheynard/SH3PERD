import { Component, computed, ElementRef, input, output, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { InputComponent } from '../../../../shared/forms/input/input.component';
import { DndDragDirective } from '../../../../core/drag-and-drop/dndDrag.directive';
import { DndDropZoneDirective } from '../../../../core/drag-and-drop/dnd-drop-zone.directive';
import type { DragState } from '../../../../core/drag-and-drop/drag.types';
import type { MusicTab, SavedTabConfig } from '../../music-library-types';

@Component({
  selector: 'app-music-tab-bar',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, DndDragDirective, DndDropZoneDirective],
  templateUrl: './music-tab-bar.component.html',
  styleUrl: './music-tab-bar.component.scss',
})
export class MusicTabBarComponent {

  readonly tabs = input.required<MusicTab[]>();
  readonly activeTabId = input.required<string>();
  readonly activeConfigId = input<string | null>(null);
  readonly savedConfigs = input<SavedTabConfig[]>([]);

  readonly tabSelect = output<string>();
  readonly tabAdd = output<void>();
  readonly tabClose = output<string>();
  readonly tabRename = output<{ id: string; title: string }>();
  readonly tabReorder = output<{ tabId: string; newIndex: number }>();
  readonly tabColorChange = output<{ id: string; color: string }>();
  readonly searchQueryChange = output<string>();
  readonly configSave = output<string>();
  readonly configNew = output<void>();
  readonly configLoad = output<SavedTabConfig>();
  readonly configDelete = output<string>();
  readonly configRename = output<{ configId: string; name: string }>();
  readonly configTabRemove = output<{ configId: string; tabId: string }>();
  readonly configTabRename = output<{ configId: string; tabId: string; title: string }>();
  readonly configTabMove = output<{ sourceConfigId: string; targetConfigId: string; tabId: string }>();

  readonly activeSearchQuery = computed(() => {
    const tab = this.tabs().find(t => t.id === this.activeTabId());
    return tab?.searchQuery ?? '';
  });

  editingTabId = signal<string | null>(null);
  editTitle = '';
  showSaveForm = signal(false);
  showLoadMenu = signal(false);
  saveFormName = signal('');

  @ViewChild('colorInput', { static: true }) colorInputRef!: ElementRef<HTMLInputElement>;
  private colorTargetTabId: string | null = null;

  openTabMenuId = signal<string | null>(null);
  tabMoveMenuId = signal<string | null>(null);

  readonly tabMoveToConfig = output<{ tab: MusicTab; targetConfigId: string }>();

  toggleTabMenu(tabId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.tabMoveMenuId.set(null);
    this.openTabMenuId.update(id => id === tabId ? null : tabId);
  }

  moveDropdownPos = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  toggleTabMoveMenu(tabId: string, event: MouseEvent, btnEl: HTMLElement): void {
    event.stopPropagation();
    const opening = this.tabMoveMenuId() !== tabId;
    this.tabMoveMenuId.update(id => id === tabId ? null : tabId);
    if (opening) {
      const rect = btnEl.getBoundingClientRect();
      this.moveDropdownPos.set({ top: rect.bottom + 4, left: rect.left });
    }
  }

  onMoveActiveTabToConfig(tab: MusicTab, targetConfigId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.tabMoveToConfig.emit({ tab, targetConfigId });
    this.tabMoveMenuId.set(null);
    this.openTabMenuId.set(null);
  }

  onTabPointerUp(tab: MusicTab, event: PointerEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('button, input')) return;
    this.openTabMenuId.set(null);
    this.tabSelect.emit(tab.id);
  }

  onTabDblClick(tab: MusicTab, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('button, input')) return;
    this.openTabMenuId.set(null);
    this.editingTabId.set(tab.id);
    this.editTitle = tab.title;
  }

  onClose(event: MouseEvent, tabId: string): void {
    event.stopPropagation();
    this.tabClose.emit(tabId);
  }

  commitRename(tabId: string): void {
    const title = this.editTitle.trim();
    if (title) this.tabRename.emit({ id: tabId, title });
    this.editingTabId.set(null);
  }

  cancelRename(): void {
    this.editingTabId.set(null);
  }

  /* ── Color picker ── */

  openColorPicker(tabId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.colorTargetTabId = tabId;
    this.colorInputRef.nativeElement.click();
  }

  onColorSelected(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    if (this.colorTargetTabId) {
      this.tabColorChange.emit({ id: this.colorTargetTabId, color });
      this.colorTargetTabId = null;
    }
  }

  /* ── DnD reorder ── */

  onTabDrop(drag: DragState): void {
    if (drag.type !== 'tab') return;
    const tabId = drag.data.tabId;
    // Find the drop target index based on the current tab order
    // The drop resolves to the zone itself; we calculate index from pointer position
    const tabs = this.tabs();
    const currentIndex = tabs.findIndex(t => t.id === tabId);
    if (currentIndex === -1) return;
    // For simplicity, move to end if no specific position resolved
    this.tabReorder.emit({ tabId, newIndex: tabs.length - 1 });
  }

  onTabDropAtIndex(tabId: string, targetIndex: number): void {
    this.tabReorder.emit({ tabId, newIndex: targetIndex });
  }

  /* ── Config save/load ── */

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
  }

  onLoadConfig(config: SavedTabConfig): void {
    this.configLoad.emit(config);
    this.showLoadMenu.set(false);
  }

  onDeleteConfig(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.configDelete.emit(id);
  }

  /* ── Config editing ── */

  expandedConfigId = signal<string | null>(null);
  editingConfigNameId = signal<string | null>(null);
  editConfigName = '';
  editingConfigTabId = signal<{ configId: string; tabId: string } | null>(null);
  editConfigTabTitle = '';
  moveMenuTabCtx = signal<{ configId: string; tabId: string } | null>(null);

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

  moveTargetConfigs(sourceConfigId: string): SavedTabConfig[] {
    return this.savedConfigs().filter(c => c.id !== sourceConfigId);
  }
}

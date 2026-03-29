import { Component, computed, ElementRef, input, output, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { InputComponent } from '../../../../shared/forms/input/input.component';
import { DndDragDirective } from '../../../../core/drag-and-drop/dndDrag.directive';
import { DndDropZoneDirective } from '../../../../core/drag-and-drop/dnd-drop-zone.directive';
import type { DragState } from '../../../../core/drag-and-drop/drag.types';
import type { MusicSearchConfig, MusicTab, SavedTabConfig } from '../../music-library-types';

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
  readonly savedConfigs = input<SavedTabConfig[]>([]);

  readonly tabSelect = output<string>();
  readonly tabAdd = output<void>();
  readonly tabClose = output<string>();
  readonly tabRename = output<{ id: string; title: string }>();
  readonly tabReorder = output<{ tabId: string; newIndex: number }>();
  readonly tabColorChange = output<{ id: string; color: string }>();
  readonly searchQueryChange = output<string>();
  readonly configSave = output<{ name: string; searchConfig: MusicSearchConfig }>();
  readonly configLoad = output<SavedTabConfig>();
  readonly configDelete = output<string>();

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

  onClose(event: MouseEvent, tabId: string): void {
    event.stopPropagation();
    this.tabClose.emit(tabId);
  }

  startRename(tab: MusicTab, event: MouseEvent): void {
    event.stopPropagation();
    this.editingTabId.set(tab.id);
    this.editTitle = tab.title;
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
    const activeTab = this.tabs().find(t => t.id === this.activeTabId());
    if (!activeTab) return;
    this.configSave.emit({ name, searchConfig: activeTab.searchConfig });
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
}

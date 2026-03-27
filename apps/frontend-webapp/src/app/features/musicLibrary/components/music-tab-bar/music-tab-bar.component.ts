import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { InputComponent } from '../../../../shared/forms/input/input.component';
import type { MusicSearchConfig, MusicTab, SavedTabConfig } from '../../music-library-types';

@Component({
  selector: 'app-music-tab-bar',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent],
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
  readonly configSave = output<{ name: string; searchConfig: MusicSearchConfig }>();
  readonly configLoad = output<SavedTabConfig>();
  readonly configDelete = output<string>();

  editingTabId = signal<string | null>(null);
  editTitle = '';
  showSaveForm = signal(false);
  showLoadMenu = signal(false);
  saveFormName = signal('');

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

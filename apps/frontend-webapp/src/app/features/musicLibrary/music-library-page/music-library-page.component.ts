import { Component, inject, signal } from '@angular/core';
import { MusicLibrarySelectorService } from '../services/selector-layer/music-library-selector.service';
import { MusicTabMutationService } from '../services/mutations-layer/music-tab-mutation.service';
import { MusicLibraryHeaderComponent } from '../components/music-library-header/music-library-header.component';
import { MusicTabBarComponent } from '../components/music-tab-bar/music-tab-bar.component';
import { MusicLibrarySidePanelComponent } from '../components/music-library-side-panel/music-library-side-panel.component';
import { MusicReferenceCardComponent } from '../components/music-reference-card/music-reference-card.component';
import { MusicRepertoireTableComponent } from '../components/music-repertoire-table/music-repertoire-table.component';

@Component({
  selector: 'app-music-library-page',
  standalone: true,
  imports: [
    MusicLibraryHeaderComponent,
    MusicTabBarComponent,
    MusicLibrarySidePanelComponent,
    MusicReferenceCardComponent,
    MusicRepertoireTableComponent,
  ],
  templateUrl: './music-library-page.component.html',
  styleUrl: './music-library-page.component.scss',
})
export class MusicLibraryPageComponent {

  public selector = inject(MusicLibrarySelectorService);
  private tabService = inject(MusicTabMutationService);

  /** Toggle between card and table view */
  viewMode = signal<'cards' | 'table'>('cards');

  onTabSelect(id: string): void {
    this.tabService.setActiveTab(id);
  }

  onTabAdd(): void {
    this.tabService.addDefaultTab();
  }

  onTabClose(id: string): void {
    this.tabService.closeTab(id);
  }

  onSearchQueryChange(_query: string): void {
    // Future: push search query into state or filter service
  }

  toggleView(): void {
    this.viewMode.update(v => v === 'cards' ? 'table' : 'cards');
  }
}

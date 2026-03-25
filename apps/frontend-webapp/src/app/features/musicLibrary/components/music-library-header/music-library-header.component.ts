import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-music-library-header',
  standalone: true,
  imports: [],
  template: `
    <header class="header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <h1 class="header-title">Music Library</h1>
      </div>

      <div class="header-search">
        <div class="search-input-wrap">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            class="search-input"
            type="text"
            placeholder="Search references, artists, genres…"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
          />
          @if (searchQuery()) {
            <button class="search-clear" (click)="clearSearch()" type="button">×</button>
          }
        </div>
      </div>

      <div class="header-right">
        <span class="header-badge">{{ totalReferences() }} refs</span>
      </div>
    </header>
  `,
  styleUrl: './music-library-header.component.scss',
})
export class MusicLibraryHeaderComponent {

  readonly totalReferences = input<number>(0);
  readonly searchQueryChange = output<string>();

  searchQuery = signal('');

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.searchQueryChange.emit(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchQueryChange.emit('');
  }
}

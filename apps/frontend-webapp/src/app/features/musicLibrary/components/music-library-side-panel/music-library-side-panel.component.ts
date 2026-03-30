import { Component, inject, input } from '@angular/core';
import { MusicTabMutationService } from '../../services/mutations-layer/music-tab-mutation.service';
import { MusicLibrarySelectorService } from '../../services/selector-layer/music-library-selector.service';
import { MUSIC_GENRES } from '../../music-library-types';
import type { MusicDataFilter, MusicGenre, MusicTab, Rating } from '../../music-library-types';
import { RangeSliderComponent, type RangeValue } from '../../../../shared/range-slider/range-slider.component';

@Component({
  selector: 'app-music-library-side-panel',
  standalone: true,
  imports: [RangeSliderComponent],
  template: `
    <aside class="side-panel">

      <!-- ── Stats section ── -->
      <section class="panel-section">
        <h2 class="section-title">Library Stats</h2>

        <div class="quality-badge" [attr.data-level]="qualityLevel()">
          <span class="quality-value">{{ averageQuality().toFixed(1) }}</span>
          <span class="quality-label">Avg Quality</span>
        </div>

        <div class="stat-cards">
          <div class="stat-card">
            <span class="stat-value">{{ totalReferences() }}</span>
            <span class="stat-label">References</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ totalRepertoire() }}</span>
            <span class="stat-label">In Repertoire</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ averageMastery().toFixed(1) }}</span>
            <span class="stat-label">Avg Mastery</span>
          </div>
        </div>
      </section>

      <!-- ── Filter section ── -->
      @if (activeTab()) {
        <section class="panel-section">
          <div class="filter-header">
            <h2 class="section-title section-title--no-margin">Filters</h2>
            <button
              class="filter-toggle"
              [class.active]="activeTab()!.searchConfig.dataFilterActive"
              (click)="toggleFilter()"
              type="button"
            >{{ activeTab()!.searchConfig.dataFilterActive ? 'On' : 'Off' }}</button>
          </div>

          <div class="filter-rows" [class.disabled]="!activeTab()!.searchConfig.dataFilterActive">

            <div class="filter-genres">
              @for (g of allGenres; track g) {
                <button
                  class="genre-chip"
                  [class.selected]="isGenreSelected(g)"
                  (click)="toggleGenre(g)"
                  type="button"
                >{{ g }}</button>
              }
            </div>

            <div class="filter-divider"></div>

            @for (row of filterRows; track row.key) {
              <div class="filter-row">
                <span class="filter-row-label">{{ row.label }}</span>
                <div class="filter-dots">
                  @for (r of ratings; track r) {
                    <button
                      class="filter-dot"
                      [class.selected]="isRatingSelected(row.key, r)"
                      [attr.data-level]="levelOf(r)"
                      (click)="toggleRating(row.key, r)"
                      type="button"
                    >{{ r }}</button>
                  }
                </div>
              </div>
            }

            <div class="filter-divider"></div>

            <sh3-range-slider
              label="BPM"
              [min]="60" [max]="220" [step]="5"
              [value]="activeTab()!.searchConfig.dataFilter?.bpm"
              (valueChange)="onRangeChange('bpm', $event)"
            />

            <sh3-range-slider
              label="Duration"
              unit="duration"
              [min]="0" [max]="600" [step]="10"
              [value]="activeTab()!.searchConfig.dataFilter?.duration"
              (valueChange)="onRangeChange('duration', $event)"
            />
          </div>
        </section>
      }



    </aside>
  `,
  styleUrl: './music-library-side-panel.component.scss',
})
export class MusicLibrarySidePanelComponent {

  private tabMutation = inject(MusicTabMutationService);
  private selector = inject(MusicLibrarySelectorService);

  readonly totalReferences = input<number>(0);
  readonly totalRepertoire = input<number>(0);
  readonly averageMastery = input<number>(0);
  readonly averageQuality = input<number>(0);
  readonly activeTab = input<MusicTab | undefined>(undefined);

  readonly allGenres = MUSIC_GENRES;
  readonly ratings: Rating[] = [1, 2, 3, 4];

  readonly filterRows: { key: 'mastery' | 'energy' | 'effort' | 'quality'; label: string }[] = [
    { key: 'mastery', label: 'MST' },
    { key: 'energy',  label: 'NRG' },
    { key: 'effort',  label: 'EFF' },
    { key: 'quality', label: 'QLT' },
  ];

  qualityLevel(): string {
    const q = this.averageQuality();
    if (q <= 1) return 'low';
    if (q <= 2) return 'medium';
    if (q <= 3) return 'high';
    return 'max';
  }

  levelOf(r: Rating): string {
    return ['low', 'medium', 'high', 'max'][r - 1];
  }

  isGenreSelected(g: MusicGenre): boolean {
    return this.activeTab()?.searchConfig.dataFilter?.genres?.includes(g) ?? false;
  }

  toggleGenre(g: MusicGenre): void {
    const id = this.selector.activeTabId();
    if (!id) return;
    const current = this.activeTab()?.searchConfig.dataFilter?.genres ?? [];
    const updated = current.includes(g)
      ? current.filter(v => v !== g)
      : [...current, g];
    this.tabMutation.patchDataFilter(id, { genres: updated });
  }

  isRatingSelected(key: 'mastery' | 'energy' | 'effort' | 'quality', r: Rating): boolean {
    const filter = this.activeTab()?.searchConfig.dataFilter;
    return filter?.[key]?.includes(r) ?? false;
  }

  toggleFilter(): void {
    const id = this.selector.activeTabId();
    if (id) this.tabMutation.toggleDataFilter(id);
  }

  onRangeChange(key: 'bpm' | 'duration', range: RangeValue): void {
    const id = this.selector.activeTabId();
    if (!id) return;
    this.tabMutation.patchDataFilter(id, { [key]: range });
  }

  toggleRating(key: Exclude<keyof MusicDataFilter, 'genres'>, r: Rating): void {
    const id = this.selector.activeTabId();
    if (!id) return;
    const current = (this.activeTab()?.searchConfig.dataFilter?.[key] ?? []) as Rating[];
    const updated = current.includes(r)
      ? current.filter(v => v !== r)
      : [...current, r].sort() as Rating[];
    this.tabMutation.patchDataFilter(id, { [key]: updated });
  }
}

import { Component, input } from '@angular/core';
import type { MusicTab } from '../../music-library-types';

@Component({
  selector: 'app-music-library-side-panel',
  standalone: true,
  imports: [],
  template: `
    <aside class="side-panel">

      <!-- ── Stats section ── -->
      <section class="panel-section">
        <h2 class="section-title">Library Stats</h2>

        <div class="stat-cards">
          <div class="stat-card">
            <span class="stat-value">{{ totalReferences() }}</span>
            <span class="stat-label">References</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ totalRepertoire() }}</span>
            <span class="stat-label">In Repertoire</span>
          </div>
          <div class="stat-card accent">
            <span class="stat-value">{{ averageMastery() }}</span>
            <span class="stat-label">Avg Mastery</span>
          </div>
        </div>
      </section>

      <!-- ── Active tab config section ── -->
      @if (activeTab()) {
        <section class="panel-section">
          <h2 class="section-title">Active Tab</h2>

          <div class="config-block">
            <div class="config-row">
              <span class="config-key">Mode</span>
              <span class="config-val mode-badge" [attr.data-mode]="activeTab()!.searchConfig.searchMode">
                {{ activeTab()!.searchConfig.searchMode }}
              </span>
            </div>
            <div class="config-row">
              <span class="config-key">Target</span>
              <span class="config-val">{{ activeTab()!.searchConfig.target.mode }}</span>
            </div>
            <div class="config-row">
              <span class="config-key">Filter</span>
              <span class="config-val" [class.active-filter]="activeTab()!.searchConfig.dataFilterActive">
                {{ activeTab()!.searchConfig.dataFilterActive ? 'Active' : 'Off' }}
              </span>
            </div>
          </div>
        </section>
      }



    </aside>
  `,
  styleUrl: './music-library-side-panel.component.scss',
})
export class MusicLibrarySidePanelComponent {

  readonly totalReferences = input<number>(0);
  readonly totalRepertoire = input<number>(0);
  readonly averageMastery = input<number>(0);
  readonly activeTab = input<MusicTab | undefined>(undefined);
}

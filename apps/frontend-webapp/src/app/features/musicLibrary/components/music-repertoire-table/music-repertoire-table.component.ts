import { Component, inject, input } from '@angular/core';
import { MusicLibrarySelectorService } from '../../services/selector-layer/music-library-selector.service';
import type { MusicReference, MusicVersion } from '../../music-library-types';

/**
 * Table view of music references with per-version ratings.
 * Columns: Title | Original Artist | Versions
 */
@Component({
  selector: 'app-music-repertoire-table',
  standalone: true,
  imports: [],
  template: `
    <div class="table-wrap">
      <table class="ref-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Original Artist</th>
            <th>Versions</th>
            <th>Mastery</th>
            <th>Energy</th>
            <th>Effort</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          @for (ref of references(); track ref.id) {
            @let versions = getVersions(ref.id);

            @if (versions.length === 0) {
              <tr class="ref-row">
                <td class="col-title">{{ ref.title }}</td>
                <td class="col-artist">{{ ref.originalArtist }}</td>
                <td class="col-versions"><span class="no-version">no version</span></td>
                <td class="col-rating"><span class="rating-none">—</span></td>
                <td class="col-rating"><span class="rating-none">—</span></td>
                <td class="col-rating"><span class="rating-none">—</span></td>
                <td class="col-dur"><span class="rating-none">—</span></td>
              </tr>
            }

            @for (version of versions; track version.id; let first = $first) {
              <tr class="ref-row" [class.first-version]="first">
                @if (first) {
                  <td class="col-title" [attr.rowspan]="versions.length">{{ ref.title }}</td>
                  <td class="col-artist" [attr.rowspan]="versions.length">{{ ref.originalArtist }}</td>
                }
                <td class="col-versions"><span class="version-label">{{ version.label }}</span></td>
                <td class="col-rating">
                  <span class="rating-val" [attr.data-level]="ratingLevel(version.mastery)">
                    {{ version.mastery }}/4
                  </span>
                </td>
                <td class="col-rating">
                  <span class="rating-val" [attr.data-level]="ratingLevel(version.energy)">
                    {{ version.energy }}/4
                  </span>
                </td>
                <td class="col-rating">
                  <span class="rating-val" [attr.data-level]="ratingLevel(version.effort)">
                    {{ version.effort }}/4
                  </span>
                </td>
                <td class="col-dur">{{ formatDuration(version.durationSeconds) }}</td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrl: './music-repertoire-table.component.scss',
})
export class MusicRepertoireTableComponent {

  private selector = inject(MusicLibrarySelectorService);

  readonly references = input<MusicReference[]>(this.selector.activeResults());

  getVersions(referenceId: string): MusicVersion[] {
    return this.selector.versionsByReferenceId().get(referenceId) ?? [];
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  ratingLevel(rating: number): string {
    if (rating <= 1) return 'low';
    if (rating === 2) return 'medium';
    if (rating === 3) return 'high';
    return 'max';
  }
}

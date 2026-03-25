import { Component, input } from '@angular/core';
import type { MusicReference, MusicVersion, Rating } from '../../music-library-types';

@Component({
  selector: 'app-music-reference-card',
  standalone: true,
  imports: [],
  template: `
    <div class="card">

      <div class="card-header">
        <span class="card-title">{{ reference().title }}</span>
        <span class="card-artist">{{ reference().originalArtist }}</span>
      </div>

      <div class="card-versions">
        @for (version of versions(); track version.id) {
          <div class="version-row">

            <span class="version-label">{{ version.label }}</span>

            @if (version.durationSeconds) {
              <span class="version-dur">{{ formatDuration(version.durationSeconds) }}</span>
            }

            <div class="version-ratings">
              <div class="rating-group">
                <span class="rating-label">MST</span>
                <div class="rating-dots">
                  @for (dot of ratingDots; track dot) {
                    <span class="dot"
                      [class.filled]="dot <= version.mastery"
                      [attr.data-level]="ratingLevel(version.mastery)"
                    ></span>
                  }
                </div>
              </div>
              <div class="rating-group">
                <span class="rating-label">NRG</span>
                <div class="rating-dots">
                  @for (dot of ratingDots; track dot) {
                    <span class="dot"
                      [class.filled]="dot <= version.energy"
                      [attr.data-level]="ratingLevel(version.energy)"
                    ></span>
                  }
                </div>
              </div>
              <div class="rating-group">
                <span class="rating-label">EFF</span>
                <div class="rating-dots">
                  @for (dot of ratingDots; track dot) {
                    <span class="dot"
                      [class.filled]="dot <= version.effort"
                      [attr.data-level]="ratingLevel(version.effort)"
                    ></span>
                  }
                </div>
              </div>
            </div>

          </div>
        } @empty {
          <span class="no-version">no version</span>
        }
      </div>

    </div>
  `,
  styleUrl: './music-reference-card.component.scss',
})
export class MusicReferenceCardComponent {

  readonly reference = input.required<MusicReference>();
  readonly versions = input<MusicVersion[]>([]);

  readonly ratingDots = [1, 2, 3, 4] as const;

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  ratingLevel(rating: Rating): string {
    if (rating <= 1) return 'low';
    if (rating === 2) return 'medium';
    if (rating === 3) return 'high';
    return 'max';
  }
}

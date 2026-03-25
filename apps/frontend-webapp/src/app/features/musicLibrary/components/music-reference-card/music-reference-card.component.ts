import { Component, computed, input, output, signal } from '@angular/core';
import { AddVersionFormComponent } from '../add-version-form/add-version-form.component';
import type { AddVersionPayload } from '../../services/mutations-layer/music-version-mutation.service';
import type { MusicReference, MusicVersion, Rating } from '../../music-library-types';

@Component({
  selector: 'app-music-reference-card',
  standalone: true,
  imports: [AddVersionFormComponent],
  templateUrl: './music-reference-card.component.html',
  styleUrl: './music-reference-card.component.scss',
})
export class MusicReferenceCardComponent {

  readonly reference = input.required<MusicReference>();
  readonly versions  = input<MusicVersion[]>([]);
  readonly entryId   = input<string | null>(null);

  readonly versionAdded         = output<AddVersionPayload>();
  readonly trackUploadRequested = output<string>(); // version id
  readonly analyzeRequested     = output<string>(); // version id

  readonly showForm = signal(false);

  /** Average quality across versions that have an analysisResult. */
  readonly avgQuality = computed(() => {
    const analysed = this.versions().filter(v => v.analysisResult);
    if (!analysed.length) return null;
    return analysed.reduce((sum, v) => sum + v.analysisResult!.quality, 0) / analysed.length;
  });

  readonly avgQualityLevel = computed(() => {
    const q = this.avgQuality();
    if (q === null) return '';
    return this.ratingLevel(Math.round(q) as Rating);
  });

  readonly ratingDots = [1, 2, 3, 4] as const;

  onVersionSubmitted(payload: Omit<AddVersionPayload, 'entryId'>): void {
    const entryId = this.entryId();
    if (!entryId) return;
    this.versionAdded.emit({ ...payload, entryId });
    this.showForm.set(false);
  }

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

import { Component, input, output, signal } from '@angular/core';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { AddVersionFormComponent } from '../add-version-form/add-version-form.component';
import type { AddVersionPayload } from '../../services/mutations-layer/music-version-mutation.service';
import type { MusicReference, MusicVersion, Rating } from '../../music-library-types';

@Component({
  selector: 'app-music-reference-card',
  standalone: true,
  imports: [AddVersionFormComponent, ButtonComponent],
  templateUrl: './music-reference-card.component.html',
  styleUrl: './music-reference-card.component.scss',
})
export class MusicReferenceCardComponent {

  readonly reference    = input.required<MusicReference>();
  readonly versions     = input<MusicVersion[]>([]);
  readonly entryId      = input<string | null>(null);
  readonly analysingIds = input<Set<string>>(new Set());

  readonly versionAdded         = output<AddVersionPayload>();
  readonly versionDeleted       = output<string>(); // version id
  readonly entryDeleted         = output<string>(); // reference id
  readonly trackUploadRequested = output<string>(); // version id
  readonly analyzeRequested     = output<string>(); // version id

  readonly showForm = signal(false);
  readonly confirmingDeleteId = signal<string | null>(null);

  readonly ratingDots = [1, 2, 3, 4] as const;

  onVersionSubmitted(payload: Omit<AddVersionPayload, 'entryId'>): void {
    const entryId = this.entryId();
    if (!entryId) return;
    this.versionAdded.emit({ ...payload, entryId });
    this.showForm.set(false);
  }

  requestDeleteVersion(id: string): void {
    if (this.confirmingDeleteId() === id) {
      this.confirmingDeleteId.set(null);
      this.versionDeleted.emit(id);
    } else {
      this.confirmingDeleteId.set(id);
    }
  }

  requestDeleteEntry(): void {
    const key = 'entry';
    if (this.confirmingDeleteId() === key) {
      this.confirmingDeleteId.set(null);
      this.entryDeleted.emit(this.reference().id);
    } else {
      this.confirmingDeleteId.set(key);
    }
  }

  cancelDelete(): void {
    this.confirmingDeleteId.set(null);
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

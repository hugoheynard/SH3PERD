import { Component, input, output, signal } from '@angular/core';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { BadgeComponent } from '../../../../shared/badge/badge.component';
import { AddVersionFormComponent } from '../add-version-form/add-version-form.component';
import type { AddVersionPayload } from '../../services/mutations-layer/music-library-mutation.service';
import type { LibraryEntry, MusicVersion, Rating } from '../../music-library-types';
import { MusicLibrarySelectorService } from '../../services/selector-layer/music-library-selector.service';

@Component({
  selector: 'app-music-reference-card',
  standalone: true,
  imports: [AddVersionFormComponent, ButtonComponent, BadgeComponent],
  templateUrl: './music-reference-card.component.html',
  styleUrl: './music-reference-card.component.scss',
})
export class MusicReferenceCardComponent {

  readonly entry        = input.required<LibraryEntry>();
  readonly analysingIds = input<Set<string>>(new Set());

  readonly versionAdded           = output<AddVersionPayload>();
  readonly versionDeleted         = output<{ entryId: string; versionId: string }>();
  readonly entryDeleted           = output<string>();
  readonly editRequested          = output<string>();
  readonly trackUploadRequested   = output<{ entryId: string; versionId: string }>();
  readonly trackDownloadRequested = output<{ versionId: string; trackId: string }>();
  readonly favoriteChanged        = output<{ entryId: string; versionId: string; trackId: string }>();

  readonly showForm = signal(false);
  readonly confirmingDeleteId = signal<string | null>(null);
  readonly expandedVersionId = signal<string | null>(null);

  readonly ratingDots = [1, 2, 3, 4] as const;

  /* ── Track helpers ── */

  favoriteQuality(v: MusicVersion): number | undefined {
    return MusicLibrarySelectorService.favoriteQuality(v);
  }

  favoriteDuration(v: MusicVersion): number | undefined {
    return MusicLibrarySelectorService.favoriteDuration(v);
  }

  hasTrack(v: MusicVersion): boolean {
    return MusicLibrarySelectorService.hasTrack(v);
  }

  /* ── Version CRUD ── */

  onVersionSubmitted(payload: Omit<AddVersionPayload, 'entryId'>): void {
    this.versionAdded.emit({ ...payload, entryId: this.entry().id });
    this.showForm.set(false);
  }

  requestDeleteVersion(versionId: string): void {
    if (this.confirmingDeleteId() === versionId) {
      this.confirmingDeleteId.set(null);
      this.versionDeleted.emit({ entryId: this.entry().id, versionId });
    } else {
      this.confirmingDeleteId.set(versionId);
    }
  }

  requestDeleteEntry(): void {
    const key = 'entry';
    if (this.confirmingDeleteId() === key) {
      this.confirmingDeleteId.set(null);
      this.entryDeleted.emit(this.entry().id);
    } else {
      this.confirmingDeleteId.set(key);
    }
  }

  cancelDelete(): void {
    this.confirmingDeleteId.set(null);
  }

  toggleExpanded(versionId: string): void {
    this.expandedVersionId.update(current => current === versionId ? null : versionId);
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

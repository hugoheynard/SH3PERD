import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { InputComponent } from '../../../../shared/forms/input/input.component';
import { BadgeComponent } from '../../../../shared/badge/badge.component';
import { AddVersionFormComponent } from '../add-version-form/add-version-form.component';
import { Genre, MUSIC_GENRES } from '../../music-library-types';
import type { AddVersionPayload } from '../../services/mutations-layer/music-library-mutation.service';
import type { LibraryEntry, MusicGenre, MusicVersion, Rating } from '../../music-library-types';
import { MusicLibrarySelectorService } from '../../services/selector-layer/music-library-selector.service';

export type VersionEditPayload = {
  entryId: string;
  versionId: string;
  label: string;
  bpm?: number;
  genre: MusicGenre;
  mastery: Rating;
  energy: Rating;
  effort: Rating;
};

@Component({
  selector: 'app-music-repertoire-table',
  standalone: true,
  imports: [AddVersionFormComponent, FormsModule, ButtonComponent, InputComponent, BadgeComponent],
  templateUrl: './music-repertoire-table.component.html',
  styleUrl: './music-repertoire-table.component.scss',
})
export class MusicRepertoireTableComponent {

  readonly entries      = input<LibraryEntry[]>([]);
  readonly analysingIds = input<Set<string>>(new Set());

  readonly versionAdded           = output<AddVersionPayload>();
  readonly versionUpdated         = output<VersionEditPayload>();
  readonly versionDeleted         = output<{ entryId: string; versionId: string }>();
  readonly entryDeleted           = output<string>();
  readonly trackUploadRequested   = output<{ entryId: string; versionId: string }>();
  readonly trackDownloadRequested = output<{ versionId: string; trackId: string }>();
  readonly favoriteChanged        = output<{ entryId: string; versionId: string; trackId: string }>();

  readonly addingEntryId = signal<string | null>(null);
  readonly editingVersionId = signal<string | null>(null);
  readonly confirmingDeleteId = signal<string | null>(null);

  readonly genres = MUSIC_GENRES;
  readonly ratingDots = [1, 2, 3, 4] as const;

  readonly editRatingFields: { field: 'editMastery' | 'editEnergy' | 'editEffort'; label: string }[] = [
    { field: 'editMastery', label: 'MST' },
    { field: 'editEnergy',  label: 'NRG' },
    { field: 'editEffort',  label: 'EFF' },
  ];

  /* Edit state */
  editLabel    = '';
  editBpm      = '';
  editGenre: MusicGenre = Genre.Pop;
  editMastery: Rating = 1;
  editEnergy:  Rating = 1;
  editEffort:  Rating = 1;

  /* ── Add version ── */

  onVersionSubmitted(payload: Omit<AddVersionPayload, 'entryId'>, entryId: string): void {
    this.versionAdded.emit({ ...payload, entryId });
    this.addingEntryId.set(null);
  }

  /* ── Edit version ── */

  startEdit(version: MusicVersion): void {
    this.editingVersionId.set(version.id);
    this.editLabel    = version.label;
    this.editBpm      = version.bpm ? String(version.bpm) : '';
    this.editGenre    = version.genre;
    this.editMastery  = version.mastery;
    this.editEnergy   = version.energy;
    this.editEffort   = version.effort;
  }

  commitEdit(entryId: string, versionId: string): void {
    const bpm = parseInt(this.editBpm, 10);
    this.versionUpdated.emit({
      entryId,
      versionId,
      label:   this.editLabel.trim() || 'Version',
      bpm:     isNaN(bpm) ? undefined : bpm,
      genre:   this.editGenre,
      mastery: this.editMastery,
      energy:  this.editEnergy,
      effort:  this.editEffort,
    });
    this.editingVersionId.set(null);
  }

  cancelEdit(): void {
    this.editingVersionId.set(null);
  }

  setEditRating(key: 'editMastery' | 'editEnergy' | 'editEffort', val: Rating): void {
    this[key] = val;
  }

  /* ── Delete (inline confirm) ── */

  requestDeleteVersion(entryId: string, versionId: string): void {
    if (this.confirmingDeleteId() === versionId) {
      this.confirmingDeleteId.set(null);
      this.versionDeleted.emit({ entryId, versionId });
    } else {
      this.confirmingDeleteId.set(versionId);
    }
  }

  requestEntryDelete(entryId: string): void {
    const key = `entry_${entryId}`;
    if (this.confirmingDeleteId() === key) {
      this.confirmingDeleteId.set(null);
      this.entryDeleted.emit(entryId);
    } else {
      this.confirmingDeleteId.set(key);
    }
  }

  cancelDelete(): void {
    this.confirmingDeleteId.set(null);
  }

  /* ── Utils ── */

  formatDuration(seconds?: number): string {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  ratingLevel(r: number): string {
    if (r <= 1) return 'low';
    if (r === 2) return 'medium';
    if (r === 3) return 'high';
    return 'max';
  }

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

  trackCount(v: MusicVersion): number {
    return v.tracks.length;
  }
}

import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/buttons/button/button.component';
import { InputComponent } from '../../../../shared/forms/input/input.component';
import { MusicLibrarySelectorService } from '../../services/selector-layer/music-library-selector.service';
import { AddVersionFormComponent } from '../add-version-form/add-version-form.component';
import { MUSIC_GENRES } from '../../music-library-types';
import type { AddVersionPayload } from '../../services/mutations-layer/music-version-mutation.service';
import type { MusicGenre, MusicReference, MusicVersion, Rating } from '../../music-library-types';

export type VersionEditPayload = {
  versionId: string;
  label: string;
  durationSeconds?: number;
  bpm?: number;
  genre: MusicGenre;
  mastery: Rating;
  energy: Rating;
  effort: Rating;
};

@Component({
  selector: 'app-music-repertoire-table',
  standalone: true,
  imports: [AddVersionFormComponent, FormsModule, ButtonComponent, InputComponent],
  templateUrl: './music-repertoire-table.component.html',
  styleUrl: './music-repertoire-table.component.scss',
})
export class MusicRepertoireTableComponent {

  private selector = inject(MusicLibrarySelectorService);

  readonly references   = input<MusicReference[]>([]);
  readonly analysingIds = input<Set<string>>(new Set());

  readonly versionAdded         = output<AddVersionPayload>();
  readonly versionUpdated       = output<VersionEditPayload>();
  readonly trackUploadRequested = output<string>(); // version id
  readonly analyzeRequested     = output<string>(); // version id

  /** refId currently showing the add-version form row */
  readonly addingRefId = signal<string | null>(null);
  /** versionId currently in inline edit mode */
  readonly editingVersionId = signal<string | null>(null);

  readonly genres = MUSIC_GENRES;
  readonly ratingDots = [1, 2, 3, 4] as const;

  readonly editRatingFields: { field: 'editMastery' | 'editEnergy' | 'editEffort'; label: string }[] = [
    { field: 'editMastery', label: 'MST' },
    { field: 'editEnergy',  label: 'NRG' },
    { field: 'editEffort',  label: 'EFF' },
  ];

  /* Edit state */
  editLabel    = '';
  editDuration = '';
  editBpm      = '';
  editGenre: MusicGenre = 'Pop';
  editMastery: Rating = 1;
  editEnergy:  Rating = 1;
  editEffort:  Rating = 1;

  getVersions(referenceId: string): MusicVersion[] {
    return this.selector.versionsByReferenceId().get(referenceId) ?? [];
  }

  entryIdForRef(refId: string): string | null {
    return this.selector.entriesByReferenceId().get(refId)?.id ?? null;
  }

  /* ── Add version ── */

  onVersionSubmitted(payload: Omit<AddVersionPayload, 'entryId'>, refId: string): void {
    const entryId = this.entryIdForRef(refId);
    if (!entryId) return;
    this.versionAdded.emit({ ...payload, entryId });
    this.addingRefId.set(null);
  }

  /* ── Edit version ── */

  startEdit(version: MusicVersion): void {
    this.editingVersionId.set(version.id);
    this.editLabel    = version.label;
    this.editDuration = version.durationSeconds
      ? String(Math.round(version.durationSeconds / 60))
      : '';
    this.editBpm      = version.bpm ? String(version.bpm) : '';
    this.editGenre    = version.genre;
    this.editMastery  = version.mastery;
    this.editEnergy   = version.energy;
    this.editEffort   = version.effort;
  }

  commitEdit(versionId: string): void {
    const dur = parseInt(this.editDuration, 10);
    const bpm = parseInt(this.editBpm, 10);
    this.versionUpdated.emit({
      versionId,
      label:           this.editLabel.trim() || 'Version',
      durationSeconds: isNaN(dur) ? undefined : dur * 60,
      bpm:             isNaN(bpm) ? undefined : bpm,
      genre:           this.editGenre,
      mastery:         this.editMastery,
      energy:          this.editEnergy,
      effort:          this.editEffort,
    });
    this.editingVersionId.set(null);
  }

  cancelEdit(): void {
    this.editingVersionId.set(null);
  }

  setEditRating(key: 'editMastery' | 'editEnergy' | 'editEffort', val: Rating): void {
    this[key] = val;
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
}

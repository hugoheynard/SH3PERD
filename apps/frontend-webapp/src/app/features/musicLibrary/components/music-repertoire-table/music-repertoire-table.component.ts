import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { InputComponent } from '../../../../shared/forms/input/input.component';
import { BadgeComponent } from '../../../../shared/badge/badge.component';
import { AddVersionFormComponent } from '../add-version-form/add-version-form.component';
import { Genre, MUSIC_GENRES } from '../../music-library-types';
import type { AddVersionPayload } from '../../services/mutations-layer/music-library-mutation.service';
import type { LibraryEntry, MusicGenre, MusicVersion, Rating } from '../../music-library-types';
import { MusicLibrarySelectorService } from '../../services/selector-layer/music-library-selector.service';
import { AudioPlayerService } from '../../audio-player/audio-player.service';
import { toPlayableTrack } from '../../audio-player/audio-player.types';
import { WaveformThumbnailComponent } from '../../audio-player/waveform-thumbnail.component';
import { decodePeaks } from '@sh3pherd/shared-types';
import type { TMusicVersionId } from '@sh3pherd/shared-types';

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
  imports: [AddVersionFormComponent, FormsModule, ButtonComponent, InputComponent, BadgeComponent, WaveformThumbnailComponent],
  templateUrl: './music-repertoire-table.component.html',
  styleUrl: './music-repertoire-table.component.scss',
})
export class MusicRepertoireTableComponent {

  protected readonly audioPlayer = inject(AudioPlayerService);

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
    const total = Math.round(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
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

  favoriteBpm(v: MusicVersion): number | undefined {
    return MusicLibrarySelectorService.favoriteBpm(v);
  }

  favoriteKey(v: MusicVersion): string | undefined {
    return MusicLibrarySelectorService.favoriteKey(v);
  }

  hasTrack(v: MusicVersion): boolean {
    return MusicLibrarySelectorService.hasTrack(v);
  }

  trackCount(v: MusicVersion): number {
    return v.tracks.length;
  }

  /* ── Peaks / sparkline ── */

  /**
   * Returns pre-computed peaks for a version's favorite track, or null
   * if the track hasn't been analysed with the peaks feature yet.
   */
  getVersionPeaks(version: MusicVersion): Float32Array | null {
    const track = version.tracks.find(t => t.favorite) ?? version.tracks[0];
    const analysis = track?.analysisResult;
    if (!analysis?.peaks || !analysis.peakCount) return null;
    try {
      return decodePeaks(analysis.peaks, analysis.peakCount);
    } catch {
      return null;
    }
  }

  /* ── Audio player ── */

  /**
   * Plays the favorite track of a version through the global audio
   * player bar. Builds the `TPlayableTrack` payload on the fly with
   * the reference title + version label so the now-playing row has
   * meaningful metadata. If the version has no tracks, this is a
   * no-op — the button is hidden in that case anyway.
   */
  playVersion(entry: LibraryEntry, version: MusicVersion): void {
    const track = version.tracks.find(t => t.favorite) ?? version.tracks[0];
    if (!track) return;
    this.audioPlayer.playTrack(
      toPlayableTrack(track, version.id as TMusicVersionId, {
        title: entry.reference.title,
        subtitle: `${entry.reference.originalArtist} · ${version.label}`,
      }),
    );
  }

  /**
   * Plays the entire filtered set as a queue, starting at the clicked
   * version. Each entry contributes its favorite track; versions
   * without a track are skipped.
   */
  playFromHere(startEntry: LibraryEntry, startVersion: MusicVersion): void {
    const queue = this.entries()
      .flatMap(entry =>
        entry.versions.flatMap(version => {
          const track = version.tracks.find(t => t.favorite) ?? version.tracks[0];
          if (!track) return [];
          return [
            toPlayableTrack(track, version.id as TMusicVersionId, {
              title: entry.reference.title,
              subtitle: `${entry.reference.originalArtist} · ${version.label}`,
            }),
          ];
        }),
      );
    const startIndex = queue.findIndex(p => p.versionId === startVersion.id);
    this.audioPlayer.playQueue(queue, Math.max(0, startIndex));
    // Suppress unused parameter lint — kept for future affordance
    // (e.g. visually marking the starting row).
    void startEntry;
  }

  /** Whether the player is currently playing the given version's favorite track. */
  isVersionPlaying(version: MusicVersion): boolean {
    const current = this.audioPlayer.currentTrack();
    if (!current) return false;
    return current.versionId === version.id && this.audioPlayer.isPlaying();
  }
}

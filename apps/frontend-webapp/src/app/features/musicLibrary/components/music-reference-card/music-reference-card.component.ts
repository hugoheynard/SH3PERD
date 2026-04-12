import { Component, inject, input, output, signal } from '@angular/core';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { BadgeComponent } from '../../../../shared/badge/badge.component';
import { InlineConfirmComponent } from '../../../../shared/inline-confirm/inline-confirm.component';
import { RATING_DOTS, ratingLevel } from '../../../../shared/utils/rating.utils';
import { formatDuration } from '../../../../shared/utils/duration.utils';
import { AddVersionFormComponent } from '../add-version-form/add-version-form.component';
import type { AddVersionPayload } from '../../services/mutations-layer/music-library-mutation.service';
import type { LibraryEntry, MusicVersion } from '../../music-library-types';
import { MusicLibrarySelectorService } from '../../services/selector-layer/music-library-selector.service';
import { AudioPlayerService } from '../../audio-player/audio-player.service';
import { toPlayableTrack } from '../../audio-player/audio-player.types';
import type { TMusicVersionId } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-music-reference-card',
  standalone: true,
  imports: [AddVersionFormComponent, ButtonComponent, BadgeComponent, InlineConfirmComponent],
  templateUrl: './music-reference-card.component.html',
  styleUrl: './music-reference-card.component.scss',
})
export class MusicReferenceCardComponent {

  protected readonly audioPlayer = inject(AudioPlayerService);

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
  readonly expandedVersionId = signal<string | null>(null);

  readonly ratingDots = RATING_DOTS;

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

  /* ── Version CRUD ── */

  onVersionSubmitted(payload: Omit<AddVersionPayload, 'entryId'>): void {
    this.versionAdded.emit({ ...payload, entryId: this.entry().id });
    this.showForm.set(false);
  }

  confirmDeleteVersion(versionId: string): void {
    this.versionDeleted.emit({ entryId: this.entry().id, versionId });
  }

  confirmDeleteEntry(): void {
    this.entryDeleted.emit(this.entry().id);
  }

  toggleExpanded(versionId: string): void {
    this.expandedVersionId.update(current => current === versionId ? null : versionId);
  }

  readonly formatDuration = formatDuration;
  readonly ratingLevel = ratingLevel;

  /* ── Audio player ── */

  /**
   * Plays the favorite track of a version through the global audio
   * player. Mirrors the repertoire table's `playVersion` helper.
   */
  playVersion(version: MusicVersion): void {
    const track = version.tracks.find(t => t.favorite) ?? version.tracks[0];
    if (!track) return;
    const entry = this.entry();
    this.audioPlayer.playTrack(
      toPlayableTrack(track, version.id as TMusicVersionId, {
        title: entry.reference.title,
        subtitle: `${entry.reference.originalArtist} · ${version.label}`,
      }),
    );
  }

  /** True if the global player is currently playing this version's track. */
  isVersionPlaying(version: MusicVersion): boolean {
    const current = this.audioPlayer.currentTrack();
    if (!current) return false;
    return current.versionId === version.id && this.audioPlayer.isPlaying();
  }
}

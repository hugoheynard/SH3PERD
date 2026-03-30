import { inject, Injectable } from '@angular/core';
import { VersionType } from '../../music-library-types';
import { MusicLibraryStateService } from '../music-library-state.service';
import type {
  AudioAnalysisSnapshot,
  LibraryEntry,
  MusicGenre,
  MusicReference,
  MusicVersion,
  Rating,
  VersionTrack,
} from '../../music-library-types';
import type { TRepertoireEntryId, TMusicVersionId, TVersionTrackId } from '@sh3pherd/shared-types';

export type AddVersionPayload = {
  entryId: string;
  label: string;
  bpm?: number;
  genre: MusicGenre;
  mastery: Rating;
  energy: Rating;
  effort: Rating;
  notes?: string;
};

/**
 * Unified mutation service for the entry-centric music library state.
 * All mutations operate on `state.entries: LibraryEntry[]`.
 */
@Injectable({ providedIn: 'root' })
export class MusicLibraryMutationService {

  private state = inject(MusicLibraryStateService);

  /* ── Entry-level mutations ── */

  /** Add a new entry (reference + empty versions list). */
  addEntry(reference: MusicReference): LibraryEntry {
    const entry: LibraryEntry = {
      id: `repEntry_${crypto.randomUUID()}` as TRepertoireEntryId,
      reference,
      versions: [],
    };
    this.updateEntries(entries => [...entries, entry]);
    return entry;
  }

  /** Remove an entry (and all its versions) by entry id. */
  removeEntry(entryId: string): void {
    this.updateEntries(entries => entries.filter(e => e.id !== entryId));
  }

  /** Remove entry by reference id. */
  removeEntryByRefId(refId: string): void {
    this.updateEntries(entries => entries.filter(e => e.reference.id !== refId));
  }

  /* ── Version-level mutations ── */

  /** Add a version to an entry. */
  addVersion(payload: AddVersionPayload): MusicVersion {
    const version: MusicVersion = {
      id: `musicVer_${crypto.randomUUID()}` as TMusicVersionId,
      label: payload.label,
      genre: payload.genre,
      type: VersionType.Original,
      bpm: payload.bpm ?? null,
      pitch: null,
      mastery: payload.mastery,
      energy: payload.energy,
      effort: payload.effort,
      notes: payload.notes,
      tracks: [],
    };
    this.patchEntry(payload.entryId, entry => ({
      ...entry,
      versions: [...entry.versions, version],
    }));
    return version;
  }

  /** Add a version from a backend API response (already has a real id). */
  addVersionFromApi(entryId: string, version: MusicVersion): void {
    this.patchEntry(entryId, entry => ({
      ...entry,
      versions: [...entry.versions, version],
    }));
  }

  /** Update version metadata within an entry. */
  updateVersion(entryId: string, versionId: string, patch: Partial<Omit<MusicVersion, 'id' | 'tracks'>>): void {
    this.patchVersion(entryId, versionId, v => ({ ...v, ...patch }));
  }

  /** Remove a version from an entry. */
  removeVersion(entryId: string, versionId: string): void {
    this.patchEntry(entryId, entry => ({
      ...entry,
      versions: entry.versions.filter(v => v.id !== versionId),
    }));
  }

  /* ── Track-level mutations ── */

  /** Add a track to a version. First track is auto-favorite. Returns the track. */
  addTrack(entryId: string, versionId: string, fileName: string, durationSeconds?: number): VersionTrack {
    const track: VersionTrack = {
      id: `track_${crypto.randomUUID()}` as TVersionTrackId,
      fileName,
      durationSeconds,
      uploadedAt: Date.now(),
      favorite: false,
    };

    this.patchVersion(entryId, versionId, version => {
      const isFirst = version.tracks.length === 0;
      return {
        ...version,
        tracks: [...version.tracks, { ...track, favorite: isFirst }],
      };
    });

    return track;
  }

  /** Set a track as favorite (unsets all others). */
  setFavoriteTrack(entryId: string, versionId: string, trackId: string): void {
    this.patchVersion(entryId, versionId, version => ({
      ...version,
      tracks: version.tracks.map(t => ({ ...t, favorite: t.id === trackId })),
    }));
  }

  /** Store analysis result on a specific track. */
  saveTrackAnalysis(entryId: string, versionId: string, trackId: string, snapshot: AudioAnalysisSnapshot): void {
    this.patchVersion(entryId, versionId, version => ({
      ...version,
      tracks: version.tracks.map(t =>
        t.id === trackId ? { ...t, analysisResult: snapshot } : t,
      ),
    }));
  }

  /* ── Private helpers ── */

  private updateEntries(updater: (entries: LibraryEntry[]) => LibraryEntry[]): void {
    this.state.updateState(state => ({
      ...state,
      entries: updater(state.entries),
    }));
  }

  private patchEntry(entryId: string, updater: (entry: LibraryEntry) => LibraryEntry): void {
    this.updateEntries(entries =>
      entries.map(e => e.id === entryId ? updater(e) : e),
    );
  }

  private patchVersion(entryId: string, versionId: string, updater: (v: MusicVersion) => MusicVersion): void {
    this.patchEntry(entryId, entry => ({
      ...entry,
      versions: entry.versions.map(v => v.id === versionId ? updater(v) : v),
    }));
  }
}

import { Injectable } from '@angular/core';
import { BaseMusicItemCRUD } from './BaseMusicItemCRUD';
import type { AudioAnalysisSnapshot, MusicGenre, MusicVersion, Rating } from '../../music-library-types';

export type AddVersionPayload = {
  entryId: string;
  label: string;
  durationSeconds?: number;
  bpm?: number;
  genre: MusicGenre;
  mastery: Rating;
  energy: Rating;
  effort: Rating;
  notes?: string;
};

@Injectable({ providedIn: 'root' })
export class MusicVersionMutationService extends BaseMusicItemCRUD<'versions'> {

  constructor() {
    super('versions');
  }

  protected createDefault(_input: unknown): MusicVersion {
    return {
      id: crypto.randomUUID(),
      entryId: '',
      label: '',
      genre: 'Pop',
      mastery: 1,
      energy: 1,
      effort: 1,
      trackUploaded: false,
    };
  }

  addVersion(payload: AddVersionPayload): MusicVersion {
    const version: MusicVersion = {
      id: crypto.randomUUID(),
      trackUploaded: false,
      ...payload,
    };
    this.add(version);
    return version;
  }

  updateVersion(id: string, patch: Partial<Omit<MusicVersion, 'id' | 'entryId'>>): void {
    this.patch(id, item => ({ ...item, ...patch } as MusicVersion));
  }

  /** Mark the track as uploaded (e.g. after a successful file upload). */
  markTrackUploaded(id: string): void {
    this.patch(id, item => ({ ...item, trackUploaded: true } as MusicVersion));
  }

  /** Store the analysis result snapshot after a successful analysis run. */
  saveAnalysis(id: string, snapshot: AudioAnalysisSnapshot): void {
    this.patch(id, item => ({ ...item, analysisResult: snapshot } as MusicVersion));
  }

  removeVersion(id: string): void {
    this.state.updateState(state => ({
      ...state,
      versions: state.versions.filter(v => v.id !== id),
    }));
  }
}

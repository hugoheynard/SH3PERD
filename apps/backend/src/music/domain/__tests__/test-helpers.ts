import type {
  TUserId,
  TMusicReferenceId,
  TMusicVersionId,
  TRepertoireEntryId,
  TVersionTrackId,
  TVersionTrackDomainModel,
  TAudioAnalysisSnapshot,
  TMusicRating,
  TMusicVersionDomainModel,
  TMusicReferenceDomainModel,
  TMusicRepertoireEntryDomainModel,
} from '@sh3pherd/shared-types';
import { Genre, VersionType } from '@sh3pherd/shared-types';
import type { TEntityInput } from '../../../utils/entities/Entity.js';

export const GENRE = Genre;
export const VERSION_TYPE = VersionType;
import { MusicVersionEntity } from '../entities/MusicVersionEntity.js';
import { MusicReferenceEntity } from '../entities/MusicReferenceEntity.js';
import { RepertoireEntryEntity } from '../entities/RepertoireEntryEntity.js';
import { RepertoireEntryAggregate } from '../RepertoireEntryAggregate.js';

// ─── Typed ID helpers ────────────────────────────────────

export const userId = (n = 1) => `user_test-${n}` as TUserId;
export const refId = (n = 1) => `musicRef_test-${n}` as TMusicReferenceId;
export const versionId = (n = 1) => `musicVer_test-${n}` as TMusicVersionId;
export const trackId = (n = 1) => `track_test-${n}` as TVersionTrackId;
export const entryId = (n = 1) => `repEntry_test-${n}` as TRepertoireEntryId;

// ─── Factory helpers ─────────────────────────────────────

export function makeTrack(overrides: Partial<TVersionTrackDomainModel> = {}): TVersionTrackDomainModel {
  return {
    id: trackId(Math.random()),
    fileName: 'test.mp3',
    uploadedAt: Date.now(),
    favorite: false,
    ...overrides,
  };
}

export function makeAnalyzedTrack(id: TVersionTrackId): TVersionTrackDomainModel {
  return makeTrack({
    id,
    favorite: true,
    s3Key: `tracks/test/${id}/test.mp3`,
    analysisResult: makeAnalysis(),
  });
}

export function makeAnalysis(overrides: Partial<TAudioAnalysisSnapshot> = {}): TAudioAnalysisSnapshot {
  return {
    integratedLUFS: -14,
    loudnessRange: 7,
    truePeakdBTP: -1,
    SNRdB: 40,
    clippingRatio: 0,
    bpm: 120,
    key: 'C',
    keyScale: 'major',
    keyStrength: 0.9,
    durationSeconds: 180,
    sampleRate: 44100,
    quality: 3 as TMusicRating,
    ...overrides,
  };
}

export function makeVersion(overrides: Partial<TEntityInput<TMusicVersionDomainModel>> = {}): MusicVersionEntity {
  return new MusicVersionEntity({
    owner_id: userId(),
    musicReference_id: refId(),
    label: 'Test version',
    genre: GENRE.Pop,
    type: VERSION_TYPE.Original,
    bpm: null,
    pitch: null,
    mastery: 3 as TMusicRating,
    energy: 3 as TMusicRating,
    effort: 2 as TMusicRating,
    tracks: [],
    ...overrides,
  });
}

export function makeReference(overrides: Partial<TEntityInput<TMusicReferenceDomainModel>> = {}): MusicReferenceEntity {
  return new MusicReferenceEntity({
    title: 'Test Song',
    artist: 'Test Artist',
    owner_id: userId(),
    ...overrides,
  });
}

export function makeEntry(overrides: Partial<TEntityInput<TMusicRepertoireEntryDomainModel>> = {}): RepertoireEntryEntity {
  return new RepertoireEntryEntity({
    musicReference_id: refId(),
    owner_id: userId(),
    ...overrides,
  });
}

export function makeAggregate(options: {
  owner?: TUserId;
  versions?: MusicVersionEntity[];
} = {}): RepertoireEntryAggregate {
  const owner = options.owner ?? userId();
  const entry = makeEntry({ owner_id: owner });
  const reference = makeReference({ owner_id: owner });
  const versions = options.versions ?? [];
  return new RepertoireEntryAggregate(entry, reference, versions);
}

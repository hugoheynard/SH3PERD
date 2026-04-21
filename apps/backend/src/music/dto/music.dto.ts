import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { ApiModel } from '../../utils/swagger/api-model.swagger.util.js';
import {
  SCreateMusicReferencePayload,
  SCreateRepertoireEntryPayload,
} from '@sh3pherd/shared-types';

// ─── Shared enum values (for Swagger docs) ───────────────

const GENRES = ['pop', 'rock', 'jazz', 'edm', 'soul-disco', 'ethnic', 'various'] as const;
const VERSION_TYPES = ['original', 'cover', 'remix', 'acoustic'] as const;
const RATINGS = [1, 2, 3, 4] as const;
const DERIVATION_TYPES = ['pitch_shift'] as const;
const PROCESSING_TYPES = ['master'] as const;
const KEY_SCALES = ['major', 'minor'] as const;

// ─── Analysis ─────────────────────────────────────────────

@ApiModel()
export class AudioAnalysisPayload {
  @ApiProperty({ example: -10.34, description: 'Integrated loudness (ITU-R BS.1770)' })
  integratedLUFS!: number;
  @ApiProperty({ example: 3.01, description: 'Loudness range in LU' }) loudnessRange!: number;
  @ApiProperty({ example: -1.57, description: 'True peak in dBTP' }) truePeakdBTP!: number;
  @ApiProperty({ example: 29.51, description: 'Signal-to-noise ratio in dB' }) SNRdB!: number;
  @ApiProperty({ example: 0, description: 'Ratio of clipped samples (0–1)' })
  clippingRatio!: number;
  @ApiProperty({ example: 97, description: 'Detected BPM' }) bpm!: number;
  @ApiProperty({ example: 'F', description: 'Detected musical key' }) key!: string;
  @ApiProperty({ example: 'major', enum: KEY_SCALES, description: 'Major or minor' })
  keyScale!: string;
  @ApiProperty({ example: 0.831, description: 'Key detection confidence (0–1)' })
  keyStrength!: number;
  @ApiProperty({ example: 25.34, description: 'Duration in seconds' }) durationSeconds!: number;
  @ApiProperty({ example: 44100, description: 'Sample rate in Hz' }) sampleRate!: number;
  @ApiProperty({ example: 3, enum: RATINGS, description: 'Audio quality rating 1–4' })
  quality!: number;
}

// ─── Track ────────────────────────────────────────────────

@ApiModel()
export class VersionTrackPayload {
  @ApiProperty({ example: 'track_abc-123', description: 'Track ID (prefixed)' }) id!: string;
  @ApiProperty({ example: 'guitar_dry.mp3' }) fileName!: string;
  @ApiProperty({ required: false, example: 25.34 }) durationSeconds?: number;
  @ApiProperty({ example: 1774963976520, description: 'Unix timestamp ms' }) uploadedAt!: number;
  @ApiProperty({ required: false, type: () => AudioAnalysisPayload })
  analysisResult?: AudioAnalysisPayload;
  @ApiProperty({ example: true, description: 'Favorite track is used for version-level metrics' })
  favorite!: boolean;
  @ApiProperty({
    required: false,
    example: 'track_xyz-456',
    description: 'Source track this was derived from',
  })
  parentTrackId?: string;
  @ApiProperty({
    required: false,
    enum: PROCESSING_TYPES,
    description: 'How this track was processed from its parent',
  })
  processingType?: string;
  @ApiProperty({ required: false, example: 'tracks/user_abc/ver_123/track_456/file.mp3' })
  s3Key?: string;
}

// ─── Version ──────────────────────────────────────────────

@ApiModel()
export class MusicVersionPayload {
  @ApiProperty({ example: 'musicVer_abc-123', description: 'Version ID (prefixed)' }) id!: string;
  @ApiProperty({ example: 'musicRef_xyz-456', description: 'Music reference ID (prefixed)' })
  musicReference_id!: string;
  @ApiProperty({ example: 'userCredential_abc-123', description: 'Owner user ID (prefixed)' })
  owner_id!: string;
  @ApiProperty({ example: 'Acoustic cover' }) label!: string;
  @ApiProperty({ example: 'pop', enum: GENRES }) genre!: string;
  @ApiProperty({ example: 'cover', enum: VERSION_TYPES }) type!: string;
  @ApiProperty({ nullable: true, example: 120, description: 'User-defined BPM (null if not set)' })
  bpm!: number | null;
  @ApiProperty({
    nullable: true,
    example: null,
    description: 'User-defined pitch (null if not set)',
  })
  pitch!: number | null;
  @ApiProperty({ required: false, example: 'Great for set opener' }) notes?: string;
  @ApiProperty({ enum: RATINGS, example: 3, description: 'Mastery rating 1–4' }) mastery!: number;
  @ApiProperty({ enum: RATINGS, example: 3, description: 'Energy rating 1–4' }) energy!: number;
  @ApiProperty({ enum: RATINGS, example: 2, description: 'Effort rating 1–4' }) effort!: number;
  @ApiProperty({ type: () => [VersionTrackPayload] }) tracks!: VersionTrackPayload[];
  @ApiProperty({
    required: false,
    example: 'musicVer_parent-123',
    description: 'Source version ID (for derived versions)',
  })
  parentVersionId?: string;
  @ApiProperty({
    required: false,
    enum: DERIVATION_TYPES,
    description: 'How this version was derived from its parent',
  })
  derivationType?: string;
}

// ─── Reference ────────────────────────────────────────────

@ApiModel()
export class MusicReferencePayload {
  @ApiProperty({ example: 'musicRef_abc-123', description: 'Music reference ID (prefixed)' })
  id!: string;
  @ApiProperty({ example: 'bohemian rhapsody', description: 'Normalized (lowercased + trimmed)' })
  title!: string;
  @ApiProperty({ example: 'queen', description: 'Normalized (lowercased + trimmed)' })
  artist!: string;
  @ApiProperty({
    description:
      'Contribution marker (discriminated union). type="user" carries the contributor id; type="system" carries the import source and is used for crawler-seeded references.',
    oneOf: [
      {
        type: 'object',
        required: ['type', 'id'],
        properties: {
          type: { type: 'string', enum: ['user'] },
          id: { type: 'string', example: 'userCredential_abc-123' },
        },
      },
      {
        type: 'object',
        required: ['type', 'source'],
        properties: {
          type: { type: 'string', enum: ['system'] },
          source: { type: 'string', enum: ['musicbrainz', 'spotify', 'seed'] },
        },
      },
    ],
  })
  creator!:
    | { type: 'user'; id: string }
    | { type: 'system'; source: 'musicbrainz' | 'spotify' | 'seed' };
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    example: '2026-04-21T10:16:11.000Z',
    description: 'Timestamp of the community contribution (ISO 8601)',
  })
  created_at!: Date;
}

// Request body for POST /music/references — Zod-derived from shared-types
@ApiModel()
export class CreateMusicReferencePayload extends createZodDto(SCreateMusicReferencePayload) {}

@ApiModel()
export class CreateMusicReferenceRequestDTO {
  @ApiProperty({ type: () => CreateMusicReferencePayload })
  payload!: CreateMusicReferencePayload;
}

// ─── Repertoire Entry ─────────────────────────────────────

@ApiModel()
export class RepertoireEntryPayload {
  @ApiProperty({ example: 'repEntry_abc-123', description: 'Repertoire entry ID (prefixed)' })
  id!: string;
  @ApiProperty({ example: 'musicRef_xyz-456', description: 'Music reference ID (prefixed)' })
  musicReference_id!: string;
  @ApiProperty({ example: 'userCredential_abc-123', description: 'Owner user ID (prefixed)' })
  owner_id!: string;
}

// Request body for POST /music/repertoire — Zod-derived from shared-types
@ApiModel()
export class CreateRepertoireEntryPayload extends createZodDto(SCreateRepertoireEntryPayload) {}

@ApiModel()
export class CreateRepertoireEntryRequestDTO {
  @ApiProperty({ type: () => CreateRepertoireEntryPayload })
  payload!: CreateRepertoireEntryPayload;
}

@ApiModel()
export class RepertoireEntryDeletedPayload {
  @ApiProperty({
    example: true,
    description: 'True when the entry was deleted, false if already gone',
  })
  deleted!: boolean;
}

// ─── Library View Model ───────────────────────────────────

@ApiModel()
export class ReferenceViewPayload {
  @ApiProperty({ example: 'musicRef_abc-123', description: 'Music reference ID (prefixed)' })
  id!: string;
  @ApiProperty({ example: 'Bohemian Rhapsody' }) title!: string;
  @ApiProperty({ example: 'Queen' }) originalArtist!: string;
}

@ApiModel()
export class VersionViewPayload {
  @ApiProperty({ example: 'musicVer_abc-123', description: 'Version ID (prefixed)' }) id!: string;
  @ApiProperty({ example: 'Acoustic cover' }) label!: string;
  @ApiProperty({ example: 'pop', enum: GENRES }) genre!: string;
  @ApiProperty({ example: 'cover', enum: VERSION_TYPES }) type!: string;
  @ApiProperty({ nullable: true, example: 120 }) bpm!: number | null;
  @ApiProperty({ nullable: true, example: null }) pitch!: number | null;
  @ApiProperty({ required: false }) notes?: string;
  @ApiProperty({ enum: RATINGS, example: 3, description: 'Mastery rating 1–4' }) mastery!: number;
  @ApiProperty({ enum: RATINGS, example: 3, description: 'Energy rating 1–4' }) energy!: number;
  @ApiProperty({ enum: RATINGS, example: 2, description: 'Effort rating 1–4' }) effort!: number;
  @ApiProperty({ type: () => [VersionTrackPayload] }) tracks!: VersionTrackPayload[];
  @ApiProperty({
    required: false,
    example: 'musicVer_parent-123',
    description: 'Source version ID (prefixed)',
  })
  parentVersionId?: string;
  @ApiProperty({ required: false, enum: DERIVATION_TYPES }) derivationType?: string;
}

@ApiModel()
export class RepertoireEntryViewModelPayload {
  @ApiProperty({ example: 'repEntry_abc-123', description: 'Repertoire entry ID (prefixed)' })
  id!: string;
  @ApiProperty({ type: () => ReferenceViewPayload }) reference!: ReferenceViewPayload;
  @ApiProperty({ type: () => [VersionViewPayload] }) versions!: VersionViewPayload[];
}

@ApiModel()
export class UserMusicLibraryViewModelPayload {
  @ApiProperty({ type: () => [RepertoireEntryViewModelPayload] })
  entries!: RepertoireEntryViewModelPayload[];
}

// ─── Cross Library View Model ─────────────────────────────

@ApiModel()
export class CrossMemberPayload {
  @ApiProperty({ example: 'userCredential_abc-123', description: 'Member user ID (prefixed)' })
  userId!: string;
  @ApiProperty({ example: 'Hugo Heynard' }) displayName!: string;
  @ApiProperty({ example: 'HH' }) avatarInitials!: string;
}

@ApiModel()
export class CrossMemberVersionItemPayload {
  @ApiProperty({ example: 'musicVer_abc-123', description: 'Version ID (prefixed)' }) id!: string;
  @ApiProperty({ example: 'Acoustic cover' }) label!: string;
  @ApiProperty({ nullable: true, example: 120 }) bpm!: number | null;
  @ApiProperty({ nullable: true, example: 'F' }) key!: string | null;
  @ApiProperty({ enum: RATINGS, example: 3 }) mastery!: number;
  @ApiProperty({ enum: RATINGS, example: 3 }) energy!: number;
  @ApiProperty({ enum: RATINGS, example: 2 }) effort!: number;
  @ApiProperty({ type: () => [VersionTrackPayload] }) tracks!: VersionTrackPayload[];
}

@ApiModel()
export class CrossMemberVersionPayload {
  @ApiProperty({ example: true }) hasVersion!: boolean;
  @ApiProperty({ type: () => [CrossMemberVersionItemPayload] })
  versions!: CrossMemberVersionItemPayload[];
}

@ApiModel()
export class CrossReferenceResultPayload {
  @ApiProperty({ example: 'musicRef_abc-123', description: 'Music reference ID (prefixed)' })
  referenceId!: string;
  @ApiProperty({ example: 'Bohemian Rhapsody' }) title!: string;
  @ApiProperty({ example: 'Queen' }) originalArtist!: string;
  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/CrossMemberVersionPayload' },
    description: 'Map of userId to member version data',
  })
  members!: Record<string, CrossMemberVersionPayload>;
  @ApiProperty({
    example: 4,
    description: 'Number of members who have this song in their repertoire',
  })
  compatibleCount!: number;
}

@ApiModel()
export class CrossSearchResultPayload {
  @ApiProperty({ example: 'company_abc-123', description: 'Company ID (prefixed)' })
  companyId!: string;
  @ApiProperty({ type: () => [CrossMemberPayload] }) members!: CrossMemberPayload[];
  @ApiProperty({ type: () => [CrossReferenceResultPayload] })
  results!: CrossReferenceResultPayload[];
  @ApiProperty({ example: 42, description: 'Total unique references across all members' })
  totalReferences!: number;
}

// ─── Track Download ───────────────────────────────────────

@ApiModel()
export class TrackDownloadUrlPayload {
  @ApiProperty({
    example: 'https://r2.cloudflarestorage.com/...',
    description: 'Presigned download URL (expires after 1h)',
  })
  url!: string;
}

// ─── Mastering Target Specs ───────────────────────────────

@ApiModel()
export class MasteringTargetSpecsPayload {
  @ApiProperty({ example: -14, description: 'Target integrated loudness in LUFS' })
  targetLUFS!: number;
  @ApiProperty({ example: -1, description: 'Target true peak in dBTP' }) targetTP!: number;
  @ApiProperty({ example: 8, description: 'Target loudness range in LU' }) targetLRA!: number;
}

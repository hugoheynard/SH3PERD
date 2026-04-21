import { ApiProperty } from '@nestjs/swagger';
import { ApiModel } from '../../utils/swagger/api-model.swagger.util.js';
import { PlaylistColors } from '@sh3pherd/shared-types';

// ─── Show (domain envelope, returned by mutation endpoints) ────

@ApiModel()
export class ShowPayload {
  @ApiProperty({ example: 'show_abc-123' }) id!: string;
  @ApiProperty({ example: 'userCredential_abc-123' }) owner_id!: string;
  @ApiProperty({ example: 'Sunset Gig' }) name!: string;
  @ApiProperty({ required: false, example: 'Saint-Tropez 2026' }) description?: string;
  @ApiProperty({ example: 'indigo', enum: PlaylistColors }) color!: string;
  @ApiProperty({ example: 1776000000000 }) createdAt!: number;
  @ApiProperty({ example: 1776000000000 }) updatedAt!: number;
  @ApiProperty({ required: false, example: 1776100000000 }) lastPlayedAt?: number;
  @ApiProperty({ required: false, example: 5400 }) totalDurationTargetSeconds?: number;
}

// ─── Section target (discriminated) ─────────────────────

@ApiModel()
export class ShowSectionTargetPayload {
  @ApiProperty({ enum: ['duration', 'track_count'], example: 'duration' })
  mode!: 'duration' | 'track_count';
  @ApiProperty({ required: false, example: 2700 }) duration_s?: number;
  @ApiProperty({ required: false, example: 10 }) track_count?: number;
}

// ─── Common rating series fields ────────────────────────

class RatingSeriesFields {
  @ApiProperty({ example: 12 }) trackCount!: number;
  @ApiProperty({ example: 2483 }) totalDurationSeconds!: number;
  @ApiProperty({ type: Number, nullable: true, example: 3.2 }) meanMastery!: number | null;
  @ApiProperty({ type: Number, nullable: true, example: 2.8 }) meanEnergy!: number | null;
  @ApiProperty({ type: Number, nullable: true, example: 3.0 }) meanEffort!: number | null;
  @ApiProperty({ type: Number, nullable: true, example: 3.5 }) meanQuality!: number | null;
  @ApiProperty({ type: [Number], example: [3, 4, 2, 3] }) masterySeries!: (number | null)[];
  @ApiProperty({ type: [Number], example: [2, 3, 3, 4] }) energySeries!: (number | null)[];
  @ApiProperty({ type: [Number], example: [3, 3, 2, 3] }) effortSeries!: (number | null)[];
  @ApiProperty({ type: [Number], example: [3, null, 4, 3] }) qualitySeries!: (number | null)[];
  @ApiProperty({ type: [Number], example: [180, 240, 210, 195] }) durationSeries!: number[];
}

// ─── Summary (list view) ────────────────────────────────

@ApiModel()
export class ShowSummaryPayload extends RatingSeriesFields {
  @ApiProperty({ example: 'show_abc-123' }) id!: string;
  @ApiProperty({ example: 'Sunset Gig' }) name!: string;
  @ApiProperty({ required: false, example: 'Saint-Tropez 2026' }) description?: string;
  @ApiProperty({ example: 'indigo', enum: PlaylistColors }) color!: string;
  @ApiProperty({ example: 1776000000000 }) createdAt!: number;
  @ApiProperty({ example: 1776000000000 }) updatedAt!: number;
  @ApiProperty({ required: false, example: 1776100000000 }) lastPlayedAt?: number;
  @ApiProperty({ example: 3 }) sectionCount!: number;
  @ApiProperty({ required: false, example: 5400 }) totalDurationTargetSeconds?: number;
}

// ─── Detail / Section / Item views ──────────────────────

@ApiModel()
export class ShowSectionItemVersionView {
  @ApiProperty({ enum: ['version'] }) kind!: 'version';
  @ApiProperty({ example: 'showItem_abc' }) id!: string;
  @ApiProperty({ example: 0 }) position!: number;
  @ApiProperty({
    type: 'object',
    additionalProperties: false,
    properties: {
      id: { type: 'string', example: 'musicVer_xyz' },
      reference_id: { type: 'string', example: 'musicRef_xyz' },
      label: { type: 'string', example: 'Live 2024' },
      title: { type: 'string', example: 'Bohemian Rhapsody' },
      originalArtist: { type: 'string', example: 'Queen' },
      favoriteTrackId: { type: 'string', nullable: true },
      durationSeconds: { type: 'number', nullable: true, example: 354 },
    },
  })
  version!: Record<string, unknown>;
}

@ApiModel()
export class ShowSectionItemPlaylistView {
  @ApiProperty({ enum: ['playlist'] }) kind!: 'playlist';
  @ApiProperty({ example: 'showItem_abc' }) id!: string;
  @ApiProperty({ example: 0 }) position!: number;
  @ApiProperty({
    type: 'object',
    additionalProperties: false,
    properties: {
      id: { type: 'string', example: 'playlist_xyz' },
      name: { type: 'string', example: 'Warm-up playlist' },
      color: { type: 'string', example: 'amber' },
      trackCount: { type: 'number', example: 12 },
    },
  })
  playlist!: Record<string, unknown>;
}

@ApiModel()
export class ShowSectionViewPayload extends RatingSeriesFields {
  @ApiProperty({ example: 'showSection_abc' }) id!: string;
  @ApiProperty({ example: 'Main set' }) name!: string;
  @ApiProperty({ example: 0 }) position!: number;
  @ApiProperty({ required: false, type: () => ShowSectionTargetPayload })
  target?: ShowSectionTargetPayload;
  @ApiProperty({ required: false, example: 1776100000000 }) lastPlayedAt?: number;
  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        { $ref: '#/components/schemas/ShowSectionItemVersionView' },
        { $ref: '#/components/schemas/ShowSectionItemPlaylistView' },
      ],
    },
  })
  items!: (ShowSectionItemVersionView | ShowSectionItemPlaylistView)[];
}

@ApiModel()
export class ShowDetailPayload extends RatingSeriesFields {
  @ApiProperty({ example: 'show_abc-123' }) id!: string;
  @ApiProperty({ example: 'Sunset Gig' }) name!: string;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty({ example: 'indigo', enum: PlaylistColors }) color!: string;
  @ApiProperty({ example: 1776000000000 }) createdAt!: number;
  @ApiProperty({ example: 1776000000000 }) updatedAt!: number;
  @ApiProperty({ required: false }) lastPlayedAt?: number;
  @ApiProperty({ example: 3 }) sectionCount!: number;
  @ApiProperty({ required: false, example: 5400 }) totalDurationTargetSeconds?: number;
  @ApiProperty({ type: () => [ShowSectionViewPayload] }) sections!: ShowSectionViewPayload[];
}

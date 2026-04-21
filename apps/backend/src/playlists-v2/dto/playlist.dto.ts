import { ApiProperty } from '@nestjs/swagger';
import { ApiModel } from '../../utils/swagger/api-model.swagger.util.js';
import { PlaylistColors } from '@sh3pherd/shared-types';

// ─── Playlist ────────────────────────────────────────────

@ApiModel()
export class PlaylistPayload {
  @ApiProperty({ example: 'playlist_abc-123', description: 'Playlist ID (prefixed)' }) id!: string;
  @ApiProperty({ example: 'userCredential_abc-123', description: 'Owner user ID (prefixed)' })
  owner_id!: string;
  @ApiProperty({ example: 'Friday Night Set' }) name!: string;
  @ApiProperty({ required: false, example: 'Chill vibes for Friday gig' }) description?: string;
  @ApiProperty({ example: 'indigo', enum: PlaylistColors }) color!: string;
  @ApiProperty({ example: 1774963976520, description: 'Unix timestamp ms' }) createdAt!: number;
}

// ─── Playlist Summary (list view) ────────────────────────

@ApiModel()
export class PlaylistSummaryPayload {
  @ApiProperty({ example: 'playlist_abc-123', description: 'Playlist ID (prefixed)' }) id!: string;
  @ApiProperty({ example: 'Friday Night Set' }) name!: string;
  @ApiProperty({ required: false, example: 'Chill vibes for Friday gig' }) description?: string;
  @ApiProperty({ example: 'indigo', enum: PlaylistColors }) color!: string;
  @ApiProperty({ example: 1774963976520, description: 'Unix timestamp ms' }) createdAt!: number;
  @ApiProperty({ example: 12, description: 'Number of tracks in the playlist' })
  trackCount!: number;
  @ApiProperty({
    example: 2483,
    description:
      'Sum of favorite-track durations across the playlist, in seconds. Tracks without a resolved version / favorite contribute 0.',
  })
  totalDurationSeconds!: number;
  @ApiProperty({
    type: Number,
    nullable: true,
    example: 3.2,
    description:
      'Mean mastery rating across resolved versions. `null` when no version could be resolved.',
  })
  meanMastery!: number | null;
  @ApiProperty({
    type: Number,
    nullable: true,
    example: 2.8,
    description: 'Mean energy rating across resolved versions.',
  })
  meanEnergy!: number | null;
  @ApiProperty({
    type: Number,
    nullable: true,
    example: 3.0,
    description: 'Mean effort rating across resolved versions.',
  })
  meanEffort!: number | null;
  @ApiProperty({
    type: Number,
    nullable: true,
    example: 3.5,
    description:
      "Mean quality rating from each version's favorite-track audio analysis. `null` when no favorite track carries an analysis snapshot.",
  })
  meanQuality!: number | null;

  @ApiProperty({
    type: [Number],
    example: [3, 4, 2, 3],
    description:
      'Mastery rating per playlist track in position order (tracks whose version cannot be resolved are skipped entirely). Used to draw a shape-of-the-playlist sparkline alongside the mean.',
  })
  masterySeries!: (number | null)[];

  @ApiProperty({
    type: [Number],
    example: [2, 3, 3, 4],
    description: 'Energy rating per playlist track in position order.',
  })
  energySeries!: (number | null)[];

  @ApiProperty({
    type: [Number],
    example: [3, 3, 2, 3],
    description: 'Effort rating per playlist track in position order.',
  })
  effortSeries!: (number | null)[];

  @ApiProperty({
    type: [Number],
    example: [3, null, 4, 3],
    description:
      "Quality rating per playlist track in position order; `null` where the track's favorite hasn't been audio-analysed yet.",
  })
  qualitySeries!: (number | null)[];
}

// ─── Playlist Track View (resolved) ─────────────────────

@ApiModel()
export class PlaylistTrackViewPayload {
  @ApiProperty({ example: 'plTrack_abc-123', description: 'Playlist track ID (prefixed)' })
  id!: string;
  @ApiProperty({ example: 0, description: 'Position in the playlist (0-based)' }) position!: number;
  @ApiProperty({ required: false, example: 'Great opener' }) notes?: string;
  @ApiProperty({ example: 'musicRef_xyz-456', description: 'Music reference ID (prefixed)' })
  referenceId!: string;
  @ApiProperty({ example: 'musicVer_xyz-456', description: 'Music version ID (prefixed)' })
  versionId!: string;
  @ApiProperty({ example: 'Bohemian Rhapsody' }) title!: string;
  @ApiProperty({ example: 'Queen' }) originalArtist!: string;
  @ApiProperty({ example: 'Acoustic cover' }) versionLabel!: string;
}

// ─── Playlist Detail View ────────────────────────────────

@ApiModel()
export class PlaylistDetailPayload {
  @ApiProperty({ example: 'playlist_abc-123', description: 'Playlist ID (prefixed)' }) id!: string;
  @ApiProperty({ example: 'Friday Night Set' }) name!: string;
  @ApiProperty({ required: false, example: 'Chill vibes for Friday gig' }) description?: string;
  @ApiProperty({ example: 'indigo', enum: PlaylistColors }) color!: string;
  @ApiProperty({ example: 1774963976520, description: 'Unix timestamp ms' }) createdAt!: number;
  @ApiProperty({ type: () => [PlaylistTrackViewPayload] }) tracks!: PlaylistTrackViewPayload[];
}

// ─── Playlist Track (raw domain) ─────────────────────────

@ApiModel()
export class PlaylistTrackPayload {
  @ApiProperty({ example: 'plTrack_abc-123', description: 'Playlist track ID (prefixed)' })
  id!: string;
  @ApiProperty({ example: 'playlist_abc-123', description: 'Playlist ID (prefixed)' })
  playlistId!: string;
  @ApiProperty({ example: 'musicRef_xyz-456', description: 'Music reference ID (prefixed)' })
  referenceId!: string;
  @ApiProperty({ example: 'musicVer_xyz-456', description: 'Music version ID (prefixed)' })
  versionId!: string;
  @ApiProperty({ example: 0, description: 'Position in the playlist (0-based)' }) position!: number;
  @ApiProperty({ required: false, example: 'Great opener' }) notes?: string;
}

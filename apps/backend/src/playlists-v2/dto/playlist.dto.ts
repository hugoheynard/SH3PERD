import { ApiProperty } from '@nestjs/swagger';
import { ApiModel } from '../../utils/swagger/api-model.swagger.util.js';
import { PlaylistColors } from '@sh3pherd/shared-types';

// ─── Playlist ────────────────────────────────────────────

@ApiModel()
export class PlaylistPayload {
  @ApiProperty({ example: 'playlist_abc-123', description: 'Playlist ID (prefixed)' }) id!: string;
  @ApiProperty({ example: 'user_abc-123', description: 'Owner user ID (prefixed)' })
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

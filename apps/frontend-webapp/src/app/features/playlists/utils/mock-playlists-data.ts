import type { Playlist, PlaylistTrack } from '../playlist-types';

export const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 'pl_001' as any,
    owner_id: 'user_001' as any,
    name: 'Opening Set',
    description: 'High-energy openers to kick off the night',
    color: 'indigo',
    createdAt: new Date('2026-01-10T18:00:00Z').getTime(),
  },
  {
    id: 'pl_002' as any,
    owner_id: 'user_001' as any,
    name: 'Main Stage Warmup',
    description: 'Building the energy before the headline act',
    color: 'emerald',
    createdAt: new Date('2026-01-15T10:00:00Z').getTime(),
  },
  {
    id: 'pl_003' as any,
    owner_id: 'user_001' as any,
    name: 'Late Night Vibes',
    description: 'Chill and groove for the late hours',
    color: 'violet',
    createdAt: new Date('2026-02-01T22:00:00Z').getTime(),
  },
  {
    id: 'pl_004' as any,
    owner_id: 'user_001' as any,
    name: 'Closing Set',
    description: 'Memorable finishers to end on a high',
    color: 'rose',
    createdAt: new Date('2026-02-14T20:00:00Z').getTime(),
  },
];

export const MOCK_PLAYLIST_TRACKS: PlaylistTrack[] = [
  // Opening Set
  { id: 'trk_001' as any, playlistId: 'pl_001' as any, referenceId: 'ref_008' as any, versionId: 'v_000' as any, position: 1, notes: 'Strong intro' },
  { id: 'trk_002' as any, playlistId: 'pl_001' as any, referenceId: 'ref_003' as any, versionId: 'v_000' as any, position: 2 },
  { id: 'trk_003' as any, playlistId: 'pl_001' as any, referenceId: 'ref_006' as any, versionId: 'v_000' as any, position: 3, notes: 'Crowd pleaser' },

  // Main Stage Warmup
  { id: 'trk_004' as any, playlistId: 'pl_002' as any, referenceId: 'ref_002' as any, versionId: 'v_004' as any, position: 1 },
  { id: 'trk_005' as any, playlistId: 'pl_002' as any, referenceId: 'ref_004' as any, versionId: 'v_006' as any, position: 2 },
  { id: 'trk_006' as any, playlistId: 'pl_002' as any, referenceId: 'ref_007' as any, versionId: 'v_007' as any, position: 3, notes: 'Extended outro' },
  { id: 'trk_007' as any, playlistId: 'pl_002' as any, referenceId: 'ref_001' as any, versionId: 'v_001' as any, position: 4 },

  // Late Night Vibes
  { id: 'trk_008' as any, playlistId: 'pl_003' as any, referenceId: 'ref_010' as any, versionId: 'v_009' as any, position: 1 },
  { id: 'trk_009' as any, playlistId: 'pl_003' as any, referenceId: 'ref_005' as any, versionId: 'v_000' as any, position: 2, notes: 'Slow it down' },
  { id: 'trk_010' as any, playlistId: 'pl_003' as any, referenceId: 'ref_009' as any, versionId: 'v_000' as any, position: 3 },

  // Closing Set
  { id: 'trk_011' as any, playlistId: 'pl_004' as any, referenceId: 'ref_001' as any, versionId: 'v_002' as any, position: 1 },
  { id: 'trk_012' as any, playlistId: 'pl_004' as any, referenceId: 'ref_007' as any, versionId: 'v_008' as any, position: 2, notes: 'Fan favourite' },
  { id: 'trk_013' as any, playlistId: 'pl_004' as any, referenceId: 'ref_003' as any, versionId: 'v_000' as any, position: 3 },
  { id: 'trk_014' as any, playlistId: 'pl_004' as any, referenceId: 'ref_008' as any, versionId: 'v_000' as any, position: 4, notes: 'Big finish' },
];

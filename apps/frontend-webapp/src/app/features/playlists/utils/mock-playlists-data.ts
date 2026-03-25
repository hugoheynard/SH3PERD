import type { Playlist, PlaylistTrack } from '../playlist-types';

export const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 'pl_001',
    name: 'Opening Set',
    description: 'High-energy openers to kick off the night',
    color: 'indigo',
    createdAt: '2026-01-10T18:00:00Z',
  },
  {
    id: 'pl_002',
    name: 'Main Stage Warmup',
    description: 'Building the energy before the headline act',
    color: 'emerald',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'pl_003',
    name: 'Late Night Vibes',
    description: 'Chill and groove for the late hours',
    color: 'violet',
    createdAt: '2026-02-01T22:00:00Z',
  },
  {
    id: 'pl_004',
    name: 'Closing Set',
    description: 'Memorable finishers to end on a high',
    color: 'rose',
    createdAt: '2026-02-14T20:00:00Z',
  },
];

export const MOCK_PLAYLIST_TRACKS: PlaylistTrack[] = [
  // Opening Set
  { id: 'trk_001', playlistId: 'pl_001', referenceId: 'ref_008', versionId: undefined,  position: 1, notes: 'Strong intro' },
  { id: 'trk_002', playlistId: 'pl_001', referenceId: 'ref_003', versionId: undefined,  position: 2 },
  { id: 'trk_003', playlistId: 'pl_001', referenceId: 'ref_006', versionId: undefined,  position: 3, notes: 'Crowd pleaser' },

  // Main Stage Warmup
  { id: 'trk_004', playlistId: 'pl_002', referenceId: 'ref_002', versionId: 'v_004',    position: 1 },
  { id: 'trk_005', playlistId: 'pl_002', referenceId: 'ref_004', versionId: 'v_006',    position: 2 },
  { id: 'trk_006', playlistId: 'pl_002', referenceId: 'ref_007', versionId: 'v_007',    position: 3, notes: 'Extended outro' },
  { id: 'trk_007', playlistId: 'pl_002', referenceId: 'ref_001', versionId: 'v_001',    position: 4 },

  // Late Night Vibes
  { id: 'trk_008', playlistId: 'pl_003', referenceId: 'ref_010', versionId: 'v_009',    position: 1 },
  { id: 'trk_009', playlistId: 'pl_003', referenceId: 'ref_005', versionId: undefined,  position: 2, notes: 'Slow it down' },
  { id: 'trk_010', playlistId: 'pl_003', referenceId: 'ref_009', versionId: undefined,  position: 3 },

  // Closing Set
  { id: 'trk_011', playlistId: 'pl_004', referenceId: 'ref_001', versionId: 'v_002',    position: 1 },
  { id: 'trk_012', playlistId: 'pl_004', referenceId: 'ref_007', versionId: 'v_008',    position: 2, notes: 'Fan favourite' },
  { id: 'trk_013', playlistId: 'pl_004', referenceId: 'ref_003', versionId: undefined,  position: 3 },
  { id: 'trk_014', playlistId: 'pl_004', referenceId: 'ref_008', versionId: undefined,  position: 4, notes: 'Big finish' },
];

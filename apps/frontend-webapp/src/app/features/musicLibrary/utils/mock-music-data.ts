import type { MusicReference, RepertoireEntry, MusicVersion } from '../music-library-types';

export const MOCK_REFERENCES: MusicReference[] = [
  { id: 'ref_001', title: 'Bohemian Rhapsody',    originalArtist: 'Queen'             },
  { id: 'ref_002', title: 'Superstition',          originalArtist: 'Stevie Wonder'     },
  { id: 'ref_003', title: "Sweet Child O' Mine",   originalArtist: "Guns N' Roses"     },
  { id: 'ref_004', title: 'Billie Jean',            originalArtist: 'Michael Jackson'   },
  { id: 'ref_005', title: 'No Woman No Cry',        originalArtist: 'Bob Marley'        },
  { id: 'ref_006', title: 'Lose Yourself',          originalArtist: 'Eminem'            },
  { id: 'ref_007', title: 'Hotel California',       originalArtist: 'Eagles'            },
  { id: 'ref_008', title: 'Blinding Lights',        originalArtist: 'The Weeknd'        },
  { id: 'ref_009', title: 'October',                originalArtist: 'U2'                },
  { id: 'ref_010', title: 'Redbone',                originalArtist: 'Childish Gambino'  },
];

export const MOCK_REPERTOIRE: RepertoireEntry[] = [
  { id: 'entry_001', referenceId: 'ref_001', userId: 'user_me' },
  { id: 'entry_002', referenceId: 'ref_002', userId: 'user_me' },
  { id: 'entry_003', referenceId: 'ref_004', userId: 'user_me' },
  { id: 'entry_004', referenceId: 'ref_007', userId: 'user_me' },
  { id: 'entry_005', referenceId: 'ref_010', userId: 'user_me' },
];

export const MOCK_VERSIONS: MusicVersion[] = [
  // Bohemian Rhapsody — 3 versions
  { id: 'v_001', entryId: 'entry_001', label: 'Original key',   durationSeconds: 354, mastery: 3, energy: 4, effort: 4 },
  { id: 'v_002', entryId: 'entry_001', label: 'Pitch -2',        durationSeconds: 354, mastery: 4, energy: 3, effort: 3 },
  { id: 'v_003', entryId: 'entry_001', label: 'Acoustic cover',  durationSeconds: 280, mastery: 2, energy: 2, effort: 3 },

  // Superstition — 2 versions
  { id: 'v_004', entryId: 'entry_002', label: 'Original',        durationSeconds: 245, mastery: 4, energy: 4, effort: 2 },
  { id: 'v_005', entryId: 'entry_002', label: 'Stripped / slow', durationSeconds: 260, mastery: 3, energy: 2, effort: 2 },

  // Billie Jean — 1 version
  { id: 'v_006', entryId: 'entry_003', label: 'Original key',    durationSeconds: 294, mastery: 2, energy: 4, effort: 4 },

  // Hotel California — 2 versions
  { id: 'v_007', entryId: 'entry_004', label: 'Full arrangement', durationSeconds: 391, mastery: 4, energy: 2, effort: 2 },
  { id: 'v_008', entryId: 'entry_004', label: 'Pitch +1',         durationSeconds: 391, mastery: 3, energy: 2, effort: 3 },

  // Redbone — 1 version
  { id: 'v_009', entryId: 'entry_005', label: 'Original',         durationSeconds: 325, mastery: 3, energy: 3, effort: 3 },
];

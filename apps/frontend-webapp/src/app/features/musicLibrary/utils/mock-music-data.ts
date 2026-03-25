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

  // ── Bohemian Rhapsody ──────────────────────────────────────────────────────
  // ✅ track uploaded + analysed (quality 4 — reference-quality recording)
  {
    id: 'v_001', entryId: 'entry_001', label: 'Original key',
    durationSeconds: 354, bpm: 72, genre: 'Rock',
    mastery: 3, energy: 4, effort: 4,
    trackUploaded: true,
    analysisResult: {
      integratedLUFS: -14.2, loudnessRange: 9.8, truePeakdBTP: -1.1,
      SNRdB: 62, clippingRatio: 0,
      quality: 4,
    },
  },
  // ✅ track uploaded + analysed (quality 3 — decent but slightly hot mix)
  {
    id: 'v_002', entryId: 'entry_001', label: 'Pitch -2',
    durationSeconds: 354, bpm: 72, genre: 'Rock',
    mastery: 4, energy: 3, effort: 3,
    trackUploaded: true,
    analysisResult: {
      integratedLUFS: -11.5, loudnessRange: 6.2, truePeakdBTP: -0.4,
      SNRdB: 44, clippingRatio: 0.0008,
      quality: 3,
    },
  },
  // ❌ no track uploaded yet
  {
    id: 'v_003', entryId: 'entry_001', label: 'Acoustic cover',
    durationSeconds: 280, bpm: 68, genre: 'Folk/Acoustic',
    mastery: 2, energy: 2, effort: 3,
    trackUploaded: false,
  },

  // ── Superstition ───────────────────────────────────────────────────────────
  // ✅ track uploaded + analysed (quality 4 — clean, well-mastered)
  {
    id: 'v_004', entryId: 'entry_002', label: 'Original',
    durationSeconds: 245, bpm: 100, genre: 'Jazz/Soul',
    mastery: 4, energy: 4, effort: 2,
    trackUploaded: true,
    analysisResult: {
      integratedLUFS: -15.1, loudnessRange: 11.3, truePeakdBTP: -1.8,
      SNRdB: 68, clippingRatio: 0,
      quality: 4,
    },
  },
  // 🔵 track uploaded, not yet analysed
  {
    id: 'v_005', entryId: 'entry_002', label: 'Stripped / slow',
    durationSeconds: 260, bpm: 80, genre: 'Jazz/Soul',
    mastery: 3, energy: 2, effort: 2,
    trackUploaded: true,
  },

  // ── Billie Jean ────────────────────────────────────────────────────────────
  // ❌ no track uploaded yet
  {
    id: 'v_006', entryId: 'entry_003', label: 'Original key',
    durationSeconds: 294, bpm: 117, genre: 'Pop',
    mastery: 2, energy: 4, effort: 4,
    trackUploaded: false,
  },

  // ── Hotel California ───────────────────────────────────────────────────────
  // ✅ track uploaded + analysed (quality 3 — LRA a bit narrow, slightly compressed)
  {
    id: 'v_007', entryId: 'entry_004', label: 'Full arrangement',
    durationSeconds: 391, bpm: 75, genre: 'Rock',
    mastery: 4, energy: 2, effort: 2,
    trackUploaded: true,
    analysisResult: {
      integratedLUFS: -12.8, loudnessRange: 5.1, truePeakdBTP: -0.7,
      SNRdB: 38, clippingRatio: 0.002,
      quality: 3,
    },
  },
  // 🔵 track uploaded, not yet analysed
  {
    id: 'v_008', entryId: 'entry_004', label: 'Pitch +1',
    durationSeconds: 391, bpm: 75, genre: 'Folk/Acoustic',
    mastery: 3, energy: 2, effort: 3,
    trackUploaded: true,
  },

  // ── Redbone ────────────────────────────────────────────────────────────────
  // ✅ track uploaded + analysed (quality 2 — clipping detected, low SNR)
  {
    id: 'v_009', entryId: 'entry_005', label: 'Original',
    durationSeconds: 325, bpm: 88, genre: 'R&B',
    mastery: 3, energy: 3, effort: 3,
    trackUploaded: true,
    analysisResult: {
      integratedLUFS: -8.3, loudnessRange: 3.2, truePeakdBTP: 0.3,
      SNRdB: 22, clippingRatio: 0.031,
      quality: 2,
    },
  },
];

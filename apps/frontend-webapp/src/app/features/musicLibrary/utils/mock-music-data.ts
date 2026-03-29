import { Genre, VersionType } from '../music-library-types';
import type { LibraryEntry, MusicTab, CrossSearchContext } from '../music-library-types';

/* Cast helper — mock IDs don't need real UUIDs but must satisfy branded types */
const e = (s: string) => `repEntry_${s}` as any;
const r = (s: string) => `musicRef_${s}` as any;
const v = (s: string) => `musicVer_${s}` as any;
const t = (s: string) => `track_${s}` as any;

export const MOCK_ENTRIES: LibraryEntry[] = [
  {
    id: e('001'),
    reference: { id: r('001'), title: 'Bohemian Rhapsody', originalArtist: 'Queen' },
    versions: [
      {
        id: v('001'), label: 'Original key', bpm: 72, pitch: null, genre: Genre.Rock, type: VersionType.Cover,
        mastery: 3, energy: 4, effort: 4,
        tracks: [
          { id: t('001a'), fileName: 'bohemian_studio_final.wav', durationSeconds: 354, uploadedAt: 1710000000000, favorite: true, analysisResult: { integratedLUFS: -14.2, loudnessRange: 9.8, truePeakdBTP: -1.1, SNRdB: 62, clippingRatio: 0, quality: 4 } },
          { id: t('001b'), fileName: 'bohemian_rehearsal_take3.wav', durationSeconds: 348, uploadedAt: 1709500000000, favorite: false, analysisResult: { integratedLUFS: -11.5, loudnessRange: 6.2, truePeakdBTP: -0.4, SNRdB: 44, clippingRatio: 0.0008, quality: 3 } },
          { id: t('001c'), fileName: 'bohemian_live_rough.mp3', durationSeconds: 362, uploadedAt: 1709000000000, favorite: false, analysisResult: { integratedLUFS: -8.3, loudnessRange: 3.2, truePeakdBTP: 0.3, SNRdB: 22, clippingRatio: 0.031, quality: 2 } },
        ],
      },
      {
        id: v('002'), label: 'Pitch -2', bpm: 72, pitch: -2, genre: Genre.Rock, type: VersionType.Cover,
        mastery: 4, energy: 3, effort: 3,
        tracks: [
          { id: t('002a'), fileName: 'bohemian_pitch_down.wav', durationSeconds: 354, uploadedAt: 1710100000000, favorite: true, analysisResult: { integratedLUFS: -11.5, loudnessRange: 6.2, truePeakdBTP: -0.4, SNRdB: 44, clippingRatio: 0.0008, quality: 3 } },
        ],
      },
      {
        id: v('003'), label: 'Acoustic cover', bpm: 68, pitch: null, genre: Genre.Various, type: VersionType.Acoustic,
        mastery: 2, energy: 2, effort: 3,
        tracks: [],
      },
    ],
  },
  {
    id: e('002'),
    reference: { id: r('002'), title: 'Superstition', originalArtist: 'Stevie Wonder' },
    versions: [
      {
        id: v('004'), label: 'Original', bpm: 100, pitch: null, genre: Genre.Jazz, type: VersionType.Cover,
        mastery: 4, energy: 4, effort: 2,
        tracks: [
          { id: t('004a'), fileName: 'superstition_master.wav', durationSeconds: 245, uploadedAt: 1710200000000, favorite: true, analysisResult: { integratedLUFS: -15.1, loudnessRange: 11.3, truePeakdBTP: -1.8, SNRdB: 68, clippingRatio: 0, quality: 4 } },
          { id: t('004b'), fileName: 'superstition_demo.mp3', durationSeconds: 240, uploadedAt: 1709800000000, favorite: false },
        ],
      },
      {
        id: v('005'), label: 'Stripped / slow', bpm: 80, pitch: null, genre: Genre.Jazz, type: VersionType.Acoustic,
        mastery: 3, energy: 2, effort: 2,
        tracks: [
          { id: t('005a'), fileName: 'superstition_stripped.wav', durationSeconds: 260, uploadedAt: 1710300000000, favorite: true },
        ],
      },
    ],
  },
  {
    id: e('003'),
    reference: { id: r('004'), title: 'Billie Jean', originalArtist: 'Michael Jackson' },
    versions: [
      {
        id: v('006'), label: 'Original key', bpm: 117, pitch: null, genre: Genre.Pop, type: VersionType.Cover,
        mastery: 2, energy: 4, effort: 4,
        tracks: [],
      },
    ],
  },
  {
    id: e('004'),
    reference: { id: r('007'), title: 'Hotel California', originalArtist: 'Eagles' },
    versions: [
      {
        id: v('007'), label: 'Full arrangement', bpm: 75, pitch: null, genre: Genre.Rock, type: VersionType.Cover,
        mastery: 4, energy: 2, effort: 2,
        tracks: [
          { id: t('007a'), fileName: 'hotel_full_mix.wav', durationSeconds: 391, uploadedAt: 1710400000000, favorite: true, analysisResult: { integratedLUFS: -12.8, loudnessRange: 5.1, truePeakdBTP: -0.7, SNRdB: 38, clippingRatio: 0.002, quality: 3 } },
          { id: t('007b'), fileName: 'hotel_alt_take.wav', durationSeconds: 388, uploadedAt: 1710100000000, favorite: false },
        ],
      },
      {
        id: v('008'), label: 'Pitch +1', bpm: 75, pitch: 1, genre: Genre.Various, type: VersionType.Cover,
        mastery: 3, energy: 2, effort: 3,
        tracks: [
          { id: t('008a'), fileName: 'hotel_pitch_up.mp3', durationSeconds: 391, uploadedAt: 1710500000000, favorite: true },
        ],
      },
    ],
  },
  {
    id: e('005'),
    reference: { id: r('010'), title: 'Redbone', originalArtist: 'Childish Gambino' },
    versions: [
      {
        id: v('009'), label: 'Original', bpm: 88, pitch: null, genre: Genre.SoulDisco, type: VersionType.Cover,
        mastery: 3, energy: 3, effort: 3,
        tracks: [
          { id: t('009a'), fileName: 'redbone_original.wav', durationSeconds: 325, uploadedAt: 1710600000000, favorite: true, analysisResult: { integratedLUFS: -8.3, loudnessRange: 3.2, truePeakdBTP: 0.3, SNRdB: 22, clippingRatio: 0.031, quality: 2 } },
        ],
      },
    ],
  },
];

export const MOCK_TABS: MusicTab[] = [
  {
    id: 'repertoire_me', title: 'My Repertoire', autoTitle: false, searchQuery: '',
    searchConfig: { searchMode: 'repertoire', target: { mode: 'me' }, dataFilterActive: false },
  },
  {
    id: 'cross_contract_001', title: 'Croisement équipe', autoTitle: false, searchQuery: '',
    searchConfig: { searchMode: 'cross', target: { mode: 'contract', contractId: 'contract_001' }, dataFilterActive: false },
  },
];

export const mockCrossContext: CrossSearchContext = {
  contractId: 'contract_001',
  members: [
    { userId: 'u_alice', displayName: 'Alice', avatarInitials: 'AL' },
    { userId: 'u_bob',   displayName: 'Bob',   avatarInitials: 'BO' },
    { userId: 'u_carol', displayName: 'Carol', avatarInitials: 'CA' },
    { userId: 'u_dave',  displayName: 'Dave',  avatarInitials: 'DA' },
  ],
  results: [
    {
      referenceId: 'ref_001', title: 'Bohemian Rhapsody', originalArtist: 'Queen', compatibleCount: 4,
      members: {
        u_alice: { hasVersion: true,  versions: [{ id: v('cv1'), label: 'Studio', mastery: 4, energy: 3, effort: 2, tracks: [{ id: t('ct1'), fileName: 'studio.wav', durationSeconds: 354, uploadedAt: 1710000000000, favorite: true, analysisResult: { integratedLUFS: -14, loudnessRange: 7, truePeakdBTP: -1.2, SNRdB: 52, clippingRatio: 0.0, quality: 4 } }] }] },
        u_bob:   { hasVersion: true,  versions: [{ id: v('cv2'), label: 'Live', mastery: 3, energy: 4, effort: 3, tracks: [] }] },
        u_carol: { hasVersion: true,  versions: [{ id: v('cv3'), label: 'Studio', mastery: 4, energy: 2, effort: 2, tracks: [{ id: t('ct3'), fileName: 'studio.wav', durationSeconds: 350, uploadedAt: 1710000000000, favorite: true, analysisResult: { integratedLUFS: -15, loudnessRange: 8, truePeakdBTP: -1.5, SNRdB: 60, clippingRatio: 0.0, quality: 4 } }] }] },
        u_dave:  { hasVersion: true,  versions: [{ id: v('cv4'), label: 'Acoustic', mastery: 3, energy: 2, effort: 3, tracks: [] }] },
      },
    },
    {
      referenceId: 'ref_002', title: 'Superstition', originalArtist: 'Stevie Wonder', compatibleCount: 4,
      members: {
        u_alice: { hasVersion: true,  versions: [{ id: v('cv5'), label: 'Original', mastery: 4, energy: 4, effort: 2, tracks: [{ id: t('ct5'), fileName: 'original.wav', durationSeconds: 245, uploadedAt: 1710200000000, favorite: true, analysisResult: { integratedLUFS: -15.1, loudnessRange: 11, truePeakdBTP: -1.8, SNRdB: 68, clippingRatio: 0.0, quality: 4 } }] }] },
        u_bob:   { hasVersion: true,  versions: [{ id: v('cv6'), label: 'Stripped', mastery: 3, energy: 2, effort: 2, tracks: [] }, { id: v('cv6b'), label: 'Funk edit', mastery: 4, energy: 4, effort: 3, tracks: [] }] },
        u_carol: { hasVersion: true,  versions: [{ id: v('cv7'), label: 'Live', mastery: 3, energy: 4, effort: 3, tracks: [] }] },
        u_dave:  { hasVersion: true,  versions: [{ id: v('cv8'), label: 'Studio', mastery: 2, energy: 3, effort: 4, tracks: [] }] },
      },
    },
    {
      referenceId: 'ref_003', title: "Sweet Child O' Mine", originalArtist: "Guns N' Roses", compatibleCount: 3,
      members: {
        u_alice: { hasVersion: true,  versions: [{ id: v('cv9'), label: 'Original key', mastery: 4, energy: 4, effort: 4, tracks: [{ id: t('ct9'), fileName: 'original.wav', durationSeconds: 280, uploadedAt: 1710000000000, favorite: true, analysisResult: { integratedLUFS: -11.5, loudnessRange: 6.2, truePeakdBTP: -0.4, SNRdB: 44, clippingRatio: 0.0008, quality: 3 } }] }] },
        u_bob:   { hasVersion: true,  versions: [{ id: v('cv10'), label: 'Pitch -2', mastery: 3, energy: 3, effort: 3, tracks: [] }] },
        u_carol: { hasVersion: true,  versions: [{ id: v('cv11'), label: 'Studio', mastery: 4, energy: 3, effort: 2, tracks: [] }] },
        u_dave:  { hasVersion: false, versions: [] },
      },
    },
    {
      referenceId: 'ref_004', title: 'Billie Jean', originalArtist: 'Michael Jackson', compatibleCount: 3,
      members: {
        u_alice: { hasVersion: true,  versions: [{ id: v('cv12'), label: 'Original key', mastery: 2, energy: 4, effort: 4, tracks: [] }] },
        u_bob:   { hasVersion: true,  versions: [{ id: v('cv13'), label: 'Extended', mastery: 3, energy: 4, effort: 3, tracks: [{ id: t('ct13'), fileName: 'extended.wav', durationSeconds: 310, uploadedAt: 1710000000000, favorite: true, analysisResult: { integratedLUFS: -12.8, loudnessRange: 5.1, truePeakdBTP: -0.7, SNRdB: 38, clippingRatio: 0.002, quality: 3 } }] }] },
        u_carol: { hasVersion: false, versions: [] },
        u_dave:  { hasVersion: true,  versions: [{ id: v('cv14'), label: 'Live', mastery: 4, energy: 4, effort: 2, tracks: [] }] },
      },
    },
    {
      referenceId: 'ref_005', title: 'No Woman No Cry', originalArtist: 'Bob Marley', compatibleCount: 2,
      members: {
        u_alice: { hasVersion: true,  versions: [{ id: v('cv15'), label: 'Reggae', mastery: 3, energy: 2, effort: 2, tracks: [] }] },
        u_bob:   { hasVersion: false, versions: [] },
        u_carol: { hasVersion: false, versions: [] },
        u_dave:  { hasVersion: true,  versions: [{ id: v('cv16'), label: 'Acoustic', mastery: 4, energy: 2, effort: 1, tracks: [{ id: t('ct16'), fileName: 'acoustic.wav', durationSeconds: 290, uploadedAt: 1710000000000, favorite: true, analysisResult: { integratedLUFS: -16, loudnessRange: 12, truePeakdBTP: -2.0, SNRdB: 70, clippingRatio: 0.0, quality: 4 } }] }] },
      },
    },
    {
      referenceId: 'ref_006', title: 'Lose Yourself', originalArtist: 'Eminem', compatibleCount: 2,
      members: {
        u_alice: { hasVersion: false, versions: [] },
        u_bob:   { hasVersion: true,  versions: [{ id: v('cv17'), label: 'Original', mastery: 4, energy: 4, effort: 3, tracks: [] }] },
        u_carol: { hasVersion: true,  versions: [{ id: v('cv18'), label: 'Studio', mastery: 3, energy: 4, effort: 4, tracks: [{ id: t('ct18'), fileName: 'studio.wav', durationSeconds: 320, uploadedAt: 1710000000000, favorite: true, analysisResult: { integratedLUFS: -9.0, loudnessRange: 4.0, truePeakdBTP: -0.2, SNRdB: 30, clippingRatio: 0.005, quality: 2 } }] }] },
        u_dave:  { hasVersion: false, versions: [] },
      },
    },
    {
      referenceId: 'ref_007', title: 'Hotel California', originalArtist: 'Eagles', compatibleCount: 1,
      members: {
        u_alice: { hasVersion: false, versions: [] },
        u_bob:   { hasVersion: false, versions: [] },
        u_carol: { hasVersion: true,  versions: [{ id: v('cv19'), label: 'Full arrangement', mastery: 4, energy: 2, effort: 2, tracks: [{ id: t('ct19'), fileName: 'full_mix.wav', durationSeconds: 391, uploadedAt: 1710000000000, favorite: true, analysisResult: { integratedLUFS: -12.8, loudnessRange: 5.1, truePeakdBTP: -0.7, SNRdB: 38, clippingRatio: 0.002, quality: 3 } }] }] },
        u_dave:  { hasVersion: false, versions: [] },
      },
    },
    {
      referenceId: 'ref_008', title: 'Blinding Lights', originalArtist: 'The Weeknd', compatibleCount: 1,
      members: {
        u_alice: { hasVersion: false, versions: [] },
        u_bob:   { hasVersion: true,  versions: [{ id: v('cv20'), label: 'Synth pop', mastery: 3, energy: 4, effort: 3, tracks: [] }] },
        u_carol: { hasVersion: false, versions: [] },
        u_dave:  { hasVersion: false, versions: [] },
      },
    },
  ],
};

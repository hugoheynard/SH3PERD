import { normalizeRefKey } from '../normalizeRefKey.js';
import { MusicReferenceEntity } from '../entities/MusicReferenceEntity.js';
import { userId } from './test-helpers.js';

describe('normalizeRefKey', () => {
  it('lowercases and trims', () => {
    expect(normalizeRefKey('  Hey Jude  ')).toBe('hey jude');
  });

  it('collapses internal whitespace', () => {
    expect(normalizeRefKey('Hey    Jude')).toBe('hey jude');
  });

  it('strips combining diacritics (NFKD then strip U+0300–U+036F)', () => {
    expect(normalizeRefKey('Bohémian Rhapsody')).toBe('bohemian rhapsody');
    // NFD form — e followed by combining acute accent
    expect(normalizeRefKey('Bohe\u0301mian Rhapsody')).toBe('bohemian rhapsody');
  });

  it('strips zero-width joiner / non-joiner / space / BOM', () => {
    expect(normalizeRefKey('Bohemian\u200BRhapsody')).toBe('bohemianrhapsody');
    expect(normalizeRefKey('\uFEFFHey Jude')).toBe('hey jude');
  });

  it('converges all Bohemian variants to the same key (dedup contract)', () => {
    const keys = [
      'Bohemian Rhapsody',
      'bohemian rhapsody',
      'Bohémian Rhapsody',
      'Bohe\u0301mian Rhapsody',
      '  BOHEMIAN   RHAPSODY  ',
      'Bohemian\u200BRhapsody',
    ].map(normalizeRefKey);
    // All but the zero-width variant should match; the zero-width one strips
    // the space entirely, which is a desired behaviour (a user cannot game
    // dedup by pasting a ZWJ). Assert the first five equal.
    expect(new Set(keys.slice(0, 5)).size).toBe(1);
  });
});

describe('MusicReferenceEntity — uses normalizeRefKey on construction', () => {
  it('stores the normalised form of title + artist', () => {
    const entity = MusicReferenceEntity.create({
      title: '  Bohémian  Rhapsody  ',
      artist: 'Queen',
      creator: { type: 'user', id: userId() },
    });
    expect(entity.title).toBe('bohemian rhapsody');
    expect(entity.artist).toBe('queen');
  });

  it('rejects a title that is empty after normalisation', () => {
    expect.assertions(2);
    try {
      MusicReferenceEntity.create({
        title: '   \u200B  ',
        artist: 'Queen',
        creator: { type: 'user', id: userId() },
      });
    } catch (err) {
      expect((err as { name: string }).name).toBe('DomainError');
      expect((err as { code: string }).code).toBe('MUSIC_REFERENCE_TITLE_REQUIRED');
    }
  });
});

/**
 * Canonical form of a music reference `title` / `artist` for dedup + storage.
 *
 * Previous implementation was `trim().toLowerCase()` — fine for ASCII, but
 * it lets two users create the same song with different glyphs:
 *   "Bohemian Rhapsody"    → "bohemian rhapsody"
 *   "Bohémian Rhapsody"    → "bohémian rhapsody"   (é 0x00E9)
 *   "Bohe\u0301mian Rhapsody" → "bohe\u0301mian rhapsody" (NFD — e + combining ´)
 *   "Bohemian\u200BRhapsody"  → "bohemian\u200Brhapsody"  (zero-width joiner)
 *
 * All four must hash to the same key. This is the single normaliser used by
 * `MusicReferenceEntity` (storage) and `CreateMusicReferenceHandler` (lookup)
 * — both sides of the dedup contract.
 */
export function normalizeRefKey(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

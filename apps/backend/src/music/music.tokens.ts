/**
 * Music module DI tokens.
 *
 * Repository tokens are in nestTokens.ts (global).
 * Storage token is in infra/storage/storage.tokens.ts (module-scoped).
 *
 * Legacy use-case tokens below are kept for reference during migration
 * but are no longer used — all logic now runs through CQRS handlers.
 */

// ── Legacy (unused, kept for reference) ──
// export const MUSIC_REPERTOIRE_USE_CASES = Symbol('MUSIC_REPERTOIRE_USE_CASES');
// export const MUSIC_VERSIONS_USE_CASES = Symbol('MUSIC_VERSIONS_USE_CASES');
// export const MUSIC_REFERENCES_USE_CASES = Symbol('MUSIC_REFERENCES_USE_CASES');
// export const MUSIC_LIBRARY_USE_CASES = Symbol('MUSIC_LIBRARY_USE_CASES');

# Music Library Feature — TODO

## Critical (before lock)

### Tests

- [ ] Integration test: upload → analysis → result in DB (real Mongo + mocked
      audio-processor via the TCP transport's in-memory harness)

### Seed Script

- [ ] Script to load reference JSONs (`seed/musicRef_init_seed/*.json`) via API
- [ ] Idempotent (skip duplicates by title + artist)
- [ ] CLI command: `npm run seed:music-refs`

---

## Architecture Improvements

### Split state service

`MusicLibraryStateService` is still too large — data state, HTTP load, tab
config persistence, debounced save all live on the same class.

- [ ] Extract tab persistence into `MusicTabPersistenceService`
- [ ] Keep `MusicLibraryStateService` for data only (entries, versions, tracks)

### Error boundaries

- [ ] Retry mechanism on transient `GET /library/me` failures (exponential
      backoff, capped)
- [ ] Loading skeleton while the initial fetch is in flight — current UX is a
      blank grid

### Tighten typing

- [ ] Replace the `_handlers` mutable workaround with a proper DI pattern
- [ ] Replace the hardcoded `'repertoire_me'` tab id with a generated UUID
      (risk of collision with a future seed reference using the same slug)

### Pagination

- [ ] Add `limit` / `offset` query params to `GET /library/me`
- [ ] Frontend: lazy load on scroll or explicit "load more"
- [ ] Only required once a user exceeds ~200 entries

---

## Features (post-lock)

### Mastering UI

- [ ] Progress indicator while the microservice processes (currently the modal
      just shows a spinner with no ETA / stage breakdown)

### Pitch Shift

- [ ] Pitch-shift modal component — semitone selector +/- 12
- [ ] Button in card + table views

### Contract Audio Specs Warning

- [ ] If the user is in a contract context with audio reference specs (min
      LUFS, format, sample rate), show a warning on upload / analysis when the
      track does not meet the contract's audio requirements
- [ ] Warning copy: "Your track is below your current contract audio
      requirements"
- [ ] Requires: contract audio specs model in `shared-types` + backend check
      after analysis

### Playlist follow-ups

- [ ] Add `playlist_count` + `playlist_search_tab` keys to `PLAN_QUOTAS`.
      `PlaylistsTabMutationService` already has the quota-override hooks wired;
      only the values are missing.
- [ ] Add-at-position for `music-track` drops — currently appends then the user
      reorders. Either extend `AddPlaylistTrackCommand` with an optional
      `position`, or chain `addTrack` + `moveTrack` after `addTrack` resolves.
- [ ] Playlist tab-config persistence — mirror the music library's
      `SaveMusicTabConfigsCommand` so tabs survive a reload.
      `scheduleTabSave()` is a no-op today.
- [ ] Analytics events on playlist commands (`playlist_created`,
      `playlist_deleted`, `playlist_track_added`, `playlist_track_removed`,
      `playlist_track_reordered`). Pattern in `sh3-analytics-events.md`.
- [ ] Add-playlist popover — replace the "+ New playlist" auto-namer (creates
      `Playlist N` with indigo color) with a real popover that takes name +
      color + optional description.
- [ ] Per-card Compare multi-select — current toolbar Compare button picks the
      first 2-3 filtered playlists. Add checkboxes on cards + a Compare CTA
      that appears when ≥ 2 are selected.

### Search Cross-Reference

- [ ] `searchMode: 'cross'` queries seed references + other users' shared refs
- [ ] "Add to my repertoire" action from cross search results

### Rekordbox Export

- [ ] Backend endpoint: `GET /playlists/:id/export/rekordbox` → XML
- [ ] Frontend: "Export to Rekordbox" button on playlist detail

---

## Architecture Decisions (for reference)

### Why reference != entry?

A **reference** is the canonical song (shared across all users). An **entry**
is the link between a user and a reference ("this song is in my repertoire").
Lets multiple users share the same reference data (title, artist) without
duplication.

### Why auto-sync saved configs?

When `activeConfigId` is set, mutations to active tabs are mirrored to the
saved config. Avoids the "forgot to save" problem — the mental model is "I am
editing this config", not "I am editing a copy I need to save back".

### Why Essentia for analysis?

Essentia.js is the JS port of the reference audio analysis library (used by
Spotify). It provides BPM + key detection + spectral analysis in a single
WASM package. More accurate than lightweight alternatives (`music-tempo`,
`pitchfinder`).

### Why a separate microservice for audio processing?

Audio analysis (Essentia WASM + ffmpeg) is CPU-intensive and has system
dependencies (ffmpeg). Isolating it in a microservice keeps the main backend
lightweight and allows independent scaling. Communication via NestJS TCP
transport + event bus.

### Why R2 over S3?

Zero egress fees (users stream audio), S3-compatible API (same SDK), simpler
setup (no IAM policies), cheaper storage.

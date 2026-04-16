# Music Library Feature — TODO

## Critical (before lock)

### Tests
- [ ] Unit tests for `TabMutationService` (~20 public mutations)
- [ ] Unit tests for backend CQRS handlers (Create/Update/Delete version, Upload/Master track)
- [ ] Unit tests for `MusicLibrarySelectorService` (filter logic, fuzzy search)
- [ ] Integration test: upload → analysis → result in DB

### Audio Player
- [x] Inline player component with presigned URL streaming
- [x] Play/pause/seek controls (Space / ← / → / N / P / M shortcuts)
- [x] Waveform visualization via pre-computed peaks (`load(url, peaks)`)
- [x] Player state shared across components (`AudioPlayerService` signal singleton)

### Seed Script
- [ ] Script to load reference JSONs (`seed/musicRef_init_seed/*.json`) via API
- [ ] Idempotent (skip duplicates by title+artist)
- [ ] CLI command: `npm run seed:music-refs`

---

## Architecture Improvements

### Split state service
`MusicLibraryStateService` is too large — handles data state, HTTP load, tab config persistence, debounce save.
- [ ] Extract tab persistence into `MusicTabPersistenceService`
- [ ] Keep `MusicLibraryStateService` for data only (entries, versions, tracks)

### Error boundaries
- [ ] Toast/fallback UI when `GET /library/me` fails
- [ ] Retry mechanism on transient failures
- [ ] Loading skeleton while data fetches

### Tab bar component split — ✅ done
Parent `configurable-tab-bar.component.ts` is now a thin orchestrator (~130 TS + ~65 HTML); three standalone children live in subfolders.
- [x] Extract `TabStripComponent` (the `@for` loop with inline rename, DnD)
- [x] Extract `TabConfigPanelComponent` (load dropdown with expand/rename/move/delete)
- [x] Extract `TabInlineMenuComponent` (the three-dot menu with color, move-to, close)

### Tighten typing
- [ ] Replace `_handlers` mutable workaround with proper DI pattern
- [ ] Remove `as any` casts in tab `dispatch()`
- [ ] Replace hardcoded tab ID `'repertoire_me'` with generated UUID

### Pagination
- [ ] Add `limit/offset` query params to `GET /library/me`
- [ ] Frontend: lazy load on scroll or explicit "load more"
- [ ] Only needed when a user exceeds ~200 entries

---

## Features (post-lock)

### Mastering UI
- [x] "Master" button on table view (row actions)
- [x] "Master" button on card view (version actions)
- [x] Mastering modal with target specs (presets: Streaming -14 LUFS, Club -8 LUFS, custom)
- [x] Mastered track appears as child track with `processingType: 'master'` (`MasterTrackCommand`)
- [x] Refresh local state after mastering completes (`onMasteringClosed` → `refreshEntries()`)
- [ ] Progress indicator while microservice processes

### Pitch Shift
- [x] Implement `pitchShift()` in audio-processor (ffmpeg asetrate)
- [x] Backend command creates new version with `derivationType: 'pitch_shift'` (`PitchShiftVersionCommand`)
- [ ] Pitch-shift modal component (UI — semitone selector +/- 12)
- [ ] Button in card + table view

### Contract Audio Specs Warning
- [ ] If user is in a contract context with audio reference specs (e.g. min LUFS, format, sample rate), show a warning on upload/analysis when the track doesn't meet the contract's audio requirements
- [ ] Warning: "Your track is below your current contract audio requirements"
- [ ] Requires: contract audio specs model in shared-types + backend check after analysis

### Drag & Drop to Playlist
- [ ] Right side panel with playlist list
- [ ] Drag music card → drop on playlist name
- [ ] Adds version (favorite track) to playlist at end position

### Search Cross-Reference
- [ ] `searchMode: 'cross'` queries seed references + other users' shared refs
- [ ] "Add to my repertoire" action from cross search results

### Rekordbox Export
- [ ] Backend endpoint: `GET /playlists/:id/export/rekordbox` → XML
- [ ] Frontend: "Export to Rekordbox" button on playlist detail

---

## Architecture Decisions (for reference)

### Why reference != entry?
A **reference** is the canonical song (shared across all users). An **entry** is the link between a user and a reference ("this song is in my repertoire"). This allows multiple users to share the same reference data (title, artist) without duplication.

### Why auto-sync saved configs?
When `activeConfigId` is set, mutations to active tabs are mirrored to the saved config. This avoids the "forgot to save" problem. The mental model is "I'm editing this config" not "I'm editing a copy that I need to save back".

### Why Essentia for analysis?
Essentia.js is the JS port of the reference audio analysis library (used by Spotify). It provides BPM + key detection + spectral analysis in a single WASM package. More accurate than lightweight alternatives (`music-tempo`, `pitchfinder`).

### Why separate microservice for audio processing?
Audio analysis (Essentia WASM + ffmpeg) is CPU-intensive and has system dependencies (ffmpeg). Isolating it in a microservice keeps the main backend lightweight and allows independent scaling. Communication via NestJS TCP transport + event bus.

### Why R2 over S3?
Zero egress fees (users stream audio), S3-compatible API (same SDK), simpler setup (no IAM policies), cheaper storage.

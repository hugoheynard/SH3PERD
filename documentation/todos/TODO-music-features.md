# Music Library Feature — TODO

## Critical (before lock)

### Tests
- [ ] Unit tests for `TabMutationService` (~20 public mutations)
- [ ] Unit tests for backend CQRS handlers (Create/Update/Delete version, Upload/Master track)
- [ ] Unit tests for `MusicLibrarySelectorService` (filter logic, fuzzy search)
- [ ] Integration test: upload → analysis → result in DB

### Audio Player ✅
- [x] Inline player component with presigned URL streaming (wavesurfer.js)
- [x] Play/pause/seek controls
- [x] Waveform visualization using peaks from analysis
- [x] Player state shared across components (current track, playing/paused)

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

### Tab bar component split
`configurable-tab-bar.component.ts` is ~300 TS + ~230 HTML.
- [ ] Extract `TabStripComponent` (the `@for` loop with inline rename, DnD)
- [ ] Extract `ConfigPanelComponent` (load dropdown with expand/rename/move/delete)
- [ ] Extract `TabInlineMenuComponent` (the three-dot menu with color, move-to, close)

### Tighten typing
- [ ] Replace `_handlers` mutable workaround with proper DI pattern
- [ ] Remove `as any` casts in tab `dispatch()`
- [ ] Replace hardcoded tab ID `'repertoire_me'` with generated UUID

### Pagination
- [ ] Add `limit/offset` query params to `GET /library/me`
- [ ] Frontend: lazy load on scroll or explicit "load more"
- [ ] Only needed when a user exceeds ~200 entries

---

## Backend Infrastructure ✅

### Quota Enforcement (2026-04-14)
- [x] `CreateMusicVersionHandler` → `track_version` quota (ensureAllowed + recordUsage)
- [x] `SaveMusicTabConfigsHandler` → `search_tab` quota (delta check: new count > existing count)
- [x] All other music handlers already had quota checks (repertoire_entry, track_upload, master_standard, master_ai, pitch_shift, storage_bytes)

### Analytics Event Tracking (2026-04-14)
- [x] `CreateRepertoireEntryHandler` → `repertoire_entry_created` (entry_id, reference_id)
- [x] `UploadTrackHandler` → `track_uploaded` (version_id, track_id, file_name, file_size_bytes, duration_seconds, format)
- [x] `TrackUploadedHandler` (event) → `track_analysed` (raw audio values: bpm, key, key_scale, lufs, snr, clipping, etc.)
- [x] `MasterTrackHandler` → `track_mastered` (version_id, track_id, target_lufs, target_tp)
- [x] `AiMasterTrackHandler` → `track_ai_mastered` (version_id, track_id, reference_track_id, target_lufs)
- [x] `PitchShiftVersionHandler` → `track_pitch_shifted` (version_id, track_id, semitones, original_key)
- [x] `MusicHandlersModule` imports `AnalyticsModule` for DI

---

## Features (post-lock)

### Mastering UI
- [ ] "Master" button on track card/detail
- [ ] Target specs form (presets: Streaming -14 LUFS, Club -8 LUFS, custom)
- [ ] Progress indicator while microservice processes
- [ ] Mastered track appears as child track with `processingType: 'master'`

### Pitch Shift
- [ ] Implement `pitchShift()` in audio-processor (ffmpeg asetrate or rubberband)
- [ ] UI: semitone selector (+/- 12)
- [ ] Creates new version with `derivationType: 'pitch_shift'`

### Tempo Change
- [ ] Implement tempo change in audio-processor
- [ ] UI: BPM target selector
- [ ] Creates new version with `derivationType: 'tempo_change'`

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

# Music Library Feature — TODO

## Critical (before lock)

### Tests

- [ ] Unit tests for `TabMutationService` (~20 public mutations)
- [x] Unit tests for backend CQRS handlers — Upload/Master/AiMaster/PitchShift,
      Create/Update/Delete version, Create/Delete repertoire entry,
      Save/Delete tab configs, Create reference, Set favorite, Delete track
- [ ] Unit tests for `MusicLibrarySelectorService` (filter logic, fuzzy search)
- [ ] Integration test: upload → analysis → result in DB

### Audio Player ✅

- [x] Inline player component with presigned URL streaming (wavesurfer.js)
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

### Tab bar quota gating — ✅ done

Plan-aware quotas on tabs + saved configs, enforced at the UI _and_ the mutation service via a single source of truth.

- [x] `MusicTabQuotaChecker` service — `canAddTab` / `canAddConfig` / `canMoveToConfig` + `savedConfigsWithLock`
- [x] `MusicTabMutationService` overrides gate `addDefaultTab`, `saveTabConfig`, `moveActiveTabToConfig`, `moveTabToConfig` via the checker (defense-in-depth alongside the UI lock)
- [x] Tab bar API: agnostic `tabLocked` / `configLocked` / `SavedTabConfig.locked` — parent computes, bar renders
- [x] Plan-aware upgrade popovers: tab-limit / config-creation-limit (Pro) / feature-not-included (Free)
- [x] Null-plan fallback (`/quota/me` race window) → treated as most-restrictive, service gates close the gap before the UI lock catches up
- [x] Full architecture walkthrough with diagrams in [`configurable-tab-bar/README.md`](../../apps/frontend-webapp/src/app/shared/configurable-tab-bar/README.md)

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

### Drag & Drop to Playlist — ✅ shipped

- [x] Right side panel hosts the playlist detail view (replaces the
      earlier "drag onto a list item" design). Opened from a card
      click via `LayoutService.setRightPanel` so it persists across
      route changes — the user can browse `/app/musicLibrary` while
      the drop target stays in view.
- [x] Drag a version from `music-reference-card` → drop on the
      tracklist in the side panel → `AddPlaylistTrack` command fires,
      the detail re-fetches with resolved title + artist + version
      label. See `sh3-playlists.md` § Drag & drop.
- [x] Per-version granularity (each `.version-block` is its own drag
      source, not the whole card) — payload carries `referenceId +
  versionId + title + artist` for the preview chip.

### Playlist reorder + drop-position feedback — ✅ shipped

- [x] Each track row in `playlist-detail` is a drag source of type
      `playlist-track`; dropping back onto the tracklist calls
      `ReorderPlaylistTrackCommand` via `TrackMutationService.moveTrack`
      (signature takes explicit `playlistId` so the API call fires
      whether or not the flat-tracks slice is populated).
- [x] Cursor-driven insertion bar — horizontal accent line with end
      caps + soft pulse, positioned from
      `DragSessionService.cursor()` + per-row bounding rects. Shows
      for both `music-track` and `playlist-track` drags so the drop
      affordance is unambiguous.
- [x] `draggingTrackId` computed marks the source row with a
      `.dragging` class (0.35 opacity + saturate 0.6 + faint indigo
      wash) so the ghost-stays-behind reading is obvious.
- [x] Per-card sparkline series stay in sync with the track order
      after a reorder (`PlaylistsStateService.reorderSummarySeries`).

### Playlist follow-ups

- [ ] Add `playlist_count` + `playlist_search_tab` keys to
      `PLAN_QUOTAS`. `PlaylistsTabMutationService` has the quota-override
      hooks wired; just missing the values.
- [ ] Add-at-position for `music-track` drops — currently appends then
      the user reorders. Either extend `AddPlaylistTrackCommand` with
      an optional `position`, or chain `addTrack` + `moveTrack` after
      `addTrack` returns an observable.
- [ ] Playlist tab-config persistence — mirror the music library's
      `SaveMusicTabConfigsCommand` so tabs survive a reload.
      `scheduleTabSave()` is a no-op today.
- [ ] Analytics events on playlist commands (`playlist_created`,
      `playlist_deleted`, `playlist_track_added`,
      `playlist_track_removed`, `playlist_track_reordered`). Pattern
      in `sh3-analytics-events.md`.
- [ ] Add-playlist popover — replace the "+ New playlist" auto-namer
      (creates `Playlist N` with indigo color) with a real popover
      that takes name + color + optional description.
- [ ] Per-card Compare multi-select — current toolbar Compare button
      picks the first 2-3 filtered playlists. Add checkboxes on cards + a Compare CTA that appears when ≥ 2 are selected.

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

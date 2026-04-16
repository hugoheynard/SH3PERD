# SH3PHERD — Music Audio Player

Focused TODO for the inline audio player feature track. Covers the
current state, the CORS baseline fix, and the **"quality ultimate"**
plan: pre-computed waveform peaks piped end-to-end so the player
never downloads a full audio file to draw a waveform.

---

## Current state (2026-04-16)

### Shipped
- Global `AudioPlayerService` — signal-based singleton, queue cursor,
  play/pause/next/prev/seek/volume/loop/mute, URL cache with 55 min
  TTL and load-token anti-race.
- `AudioPlayerBarComponent` — docked bar at the bottom of the main
  layout, wavesurfer instance via dynamic import (SSR-safe), four
  `effect()` that sync URL / status / volume / seek, loudness + clipping
  markers from the analysis snapshot.
- `AudioMarkerService` — pixel-accurate clipping regions (merge-adjacent
  buckets) + sliding-RMS loudest window derived from the decoded peaks,
  with a snapshot fallback for legacy tracks (see
  `audio-marker.service.spec.ts`).
- Pre-computed peaks end-to-end: processor extracts ~2000 peak buckets
  during analysis, `encodePeaks` / `decodePeaks` helpers in
  `@sh3pherd/shared-types`, `WavesurferAdapterService` passes them via
  `load(url, peaks)` for instant waveform without a CORS fetch.
- `WaveformThumbnailComponent` sparkline wired in both
  `music-repertoire-table` and `music-reference-card` — static canvas
  preview from the favorite track's peaks, falls back to the track-count
  badge when peaks are unavailable.
- `backfill-track-peaks.mjs` migration script ready in
  `apps/backend/src/migrations/` to populate peaks on existing tracks
  (not yet run against prod — see "Known blocker" below).
- Play buttons wired on `music-repertoire-table` and
  `music-reference-card`.
- Transport keyboard shortcuts (Space / ← / → / N / P / M).
- Responsive layout (hides metadata <900 px, times <540 px).

### Known blocker — peaks backfill

R2 CORS is configured and playback works end-to-end. The peaks pipeline
is code-complete on every layer (processor extraction, shared-types
helpers, `<audio>`-first wavesurfer load, sparklines, markers), so any
**newly analysed** track already benefits.

The open blocker is the **one-off backfill** for tracks uploaded before
the peaks feature shipped:

- [ ] Run `apps/backend/src/migrations/backfill-track-peaks.mjs` against
      prod. The script iterates `music_versions`, re-dispatches
      `ANALYZE_TRACK` for every track missing `analysisResult.peaks`,
      rate-limits to 4 concurrent jobs, and is idempotent — safe to run
      twice.

Until the backfill completes, older tracks fall back to the snapshot
marker path and don't get a sparkline. The player still plays them via
the `<audio>` element — no user-visible regression.

---

## Quality ultimate — pre-computed waveform peaks

### Goal

Eliminate the "wavesurfer fetches the whole audio file to compute the
waveform" cost. Instead, extract a compact peak array during the
analysis step (which already downloads + decodes the audio), persist
it with the track, and pass it to wavesurfer via `load(url, peaks)`.

### Benefits

- **Instant waveform**. The bar paints the shape before a single
  audio byte hits the browser.
- **No CORS fetch required**. wavesurfer uses the `<audio>` element
  for playback, which doesn't trigger cross-origin checks. Even if R2
  CORS is misconfigured, the player keeps working — CORS becomes
  an optimization, not a blocker.
- **Bandwidth win**. Browsing the library without hitting play means
  zero audio downloads. With pre-computed peaks, we can draw
  **sparkline thumbnails** in the table / cards for free.
- **Pixel-accurate markers**. With real peaks we can color individual
  bars (clipping in red, loudest window highlighted) instead of a
  full-width stripe guessed from summary stats.
- **Persistent**. Peaks are stored once, reused on every playback by
  every user. No re-compute on each session.

### Storage plan

2000 peaks per track at good resolution, `Float32` → 8 KB per track.
For 10k tracks that's 80 MB — acceptable in MongoDB but worth
compressing. Options in increasing complexity:

1. **`number[]` of floats** in the track document (simplest, 8 KB/track).
2. **`Int16` packed + base64 string** (~4 KB/track, ~50 % savings).
3. **Separate `track_peaks` collection** keyed by `track_id`, fetched
   lazily by the frontend (keeps the library query lean).
4. **Sidecar object in R2** — `tracks/.../track_XYZ.peaks.json`,
   fetched on demand.

**Pick #2 for v1**: Int16-packed base64 embedded in the track. Good
compression, no extra collection, no second round trip. The `number[]`
is decoded client-side in `toPlayableTrack`.

### Work items

#### Shared types
- [x] `peaks: string` (base64 Int16) + `peakCount: number` on
      `TAudioAnalysisSnapshot` (optional for backwards compatibility).
- [x] `SAudioAnalysisSnapshot` Zod schema with optional
      `peaks` + `peakCount`.
- [x] `encodePeaks(floats: Float32Array): string` and
      `decodePeaks(encoded: string, count: number): Float32Array`
      helpers in shared-types.

#### Audio processor microservice
- [x] `analyze.ts` downsamples the decoded buffer to a 2000-bucket
      peak array (max absolute value per bucket).
- [x] Peaks are encoded via `encodePeaks` and returned inside the
      `TAudioAnalysisSnapshot` alongside the existing LUFS / BPM / key
      fields.
- [x] Synthetic sine-wave unit test asserts the envelope round-trips
      within tolerance.

#### Backend persistence
- [x] `TrackUploadedHandler` passes the snapshot through unchanged —
      peaks ride along.
- [x] `GetUserMusicLibraryQuery.toVersionView` preserves the peaks
      fields inside `analysisResult`.
- [x] `MusicVersionRepository.toDomain` / `toRecord` handle the base64
      string as-is.

#### Migration for existing tracks
- [x] `apps/backend/src/migrations/backfill-track-peaks.mjs` iterates
      `music_versions`, re-dispatches `ANALYZE_TRACK` for every track
      missing peaks, rate-limits to 4 concurrent jobs, and logs
      progress. Idempotent.
- [ ] Run the migration against prod (no code work left — operational).

#### Frontend
- [x] `TPlayableTrack.peaks?: Float32Array` decoded in
      `toPlayableTrack()` via the shared `decodePeaks` helper.
- [x] `WavesurferAdapterService.load(url, [Array.from(peaks)])` when
      peaks are present, otherwise the legacy fetch-based path.
- [x] `AudioMarkerService` re-derives markers from the decoded peaks.

#### Sparkline thumbnails
- [x] `WaveformThumbnailComponent` — retina-aware canvas rendering a
      static waveform from a `Float32Array`, with a pure
      `paintWaveform()` helper (unit-tested).
- [x] Wired in `music-repertoire-table` (replaces the track-count badge
      when peaks are available) and in `music-reference-card` (60×14
      strip next to the version label).

#### Marker improvements
- [x] `AudioMarkerService.buildMarkersFromPeaks()` tags individual
      buckets above `CLIP_THRESHOLD = 0.98`, merges adjacent clipped
      samples into one marker, and drops the whole set when the total
      clip ratio stays under `CLIP_MIN_RATIO`.
- [x] Loudest window detected via sliding RMS over ~5 % of the track.

#### Observability
- [ ] Telemetry: log the extract time and peak byte size for each
      upload so we can spot regressions.
- [ ] Health check: a periodic cron that finds tracks still missing
      peaks and reports them to the owner.
- [x] Error handling: peak extraction failure does not break the rest
      of the analysis — LUFS / BPM / key still succeed and the player
      falls back to the `<audio>`-only path.

---

## Acceptance criteria

- [x] Upload a new track → peaks stored, bar paints the waveform with
      zero R2 round trip after the presigned URL is fetched.
- [x] Open an older track (pre-migration) → falls back to the existing
      fetch-based path without error.
- [ ] Run the backfill migration → all existing tracks gain peaks.
      *(Migration script ready; awaiting an ops slot to run against prod.)*
- [x] Disable R2 CORS temporarily → playback still works for tracks
      with peaks (the `<audio>` element doesn't need CORS).
- [x] Table / cards show sparkline thumbnails for every version that
      has at least one analyzed track.
- [x] Clipping markers appear only over the actual clipped samples,
      not as a full-width stripe.
- [x] No regression on LUFS / BPM / key values in existing tracks.

---

## Estimated effort

| Step | Effort |
|------|--------|
| Shared-types helpers + schema | 0.5 day |
| Audio processor peak extraction + test | 0.5 day |
| Backend pass-through + types | 0.25 day |
| Migration script for existing tracks | 0.5 day |
| Frontend peak integration in player | 0.5 day |
| Sparkline component + wiring | 0.75 day |
| Marker rewrite with real peaks | 0.5 day |
| Observability + acceptance validation | 0.5 day |
| **Total** | **~4 days** |

Lower if we skip the sparkline + marker rewrite for v1 (~2.5 days core
path). Those two are the real visible wins though, so I'd keep them.

---

## Why this is "quality ultimate"

- **Architectural**: peaks are computed **once** in the right place
  (microservice with the decoded audio buffer already in memory),
  persisted forever, reused by every client. No duplicate work.
- **Bandwidth**: 4 KB of peaks replaces 8 MB of audio for users
  browsing the library without playing — 2000× cheaper.
- **Reliability**: playback stops depending on CORS at all. The
  player becomes robust against bucket config drift.
- **Fidelity**: markers become pixel-perfect instead of guessed
  from summary stats.
- **Reusable**: the same peak array powers playback waveforms,
  sparkline thumbnails, setlist transition previews, and eventually
  (Tier 4 in `sh3-music-library.md`) the auto-tagging embeddings
  use the same analysis snapshot structure.

---

## Related docs

- `sh3-music-library.md` — full music library roadmap, where this
  feature sits as a blocker for #3 (play stats), #5 (setlist
  builder preview), and #10 (auto-tagging via embeddings).

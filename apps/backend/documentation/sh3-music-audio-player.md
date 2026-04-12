# SH3PHERD — Music Audio Player

Focused TODO for the inline audio player feature track. Covers the
current state, the CORS baseline fix, and the **"quality ultimate"**
plan: pre-computed waveform peaks piped end-to-end so the player
never downloads a full audio file to draw a waveform.

---

## Current state (2026-04-11)

### Shipped
- Global `AudioPlayerService` — signal-based singleton, queue cursor,
  play/pause/next/prev/seek/volume/loop/mute, URL cache with 55 min
  TTL and load-token anti-race.
- `AudioPlayerBarComponent` — docked bar at the bottom of the main
  layout, wavesurfer instance via dynamic import (SSR-safe), four
  `effect()` that sync URL / status / volume / seek, loudness + clipping
  markers from the analysis snapshot.
- Play buttons wired on `music-repertoire-table` and
  `music-reference-card`.
- Transport keyboard shortcuts (Space / ← / → / N / P / M).
- Responsive layout (hides metadata <900 px, times <540 px).

### Known blocker: CORS on the R2 bucket
wavesurfer fetches the audio file as a Blob to compute the waveform.
Since the R2 bucket is a different origin from `localhost:4200`,
Chrome blocks the fetch without an `Access-Control-Allow-Origin`
header. The audio element itself can play the URL (it has a permissive
CORS model) but wavesurfer never gets to draw.

**Baseline fix (prerequisite for anything else):**

- [ ] Configure CORS policy on the R2 bucket via the Cloudflare R2
      dashboard (Settings → CORS Policy). Minimum config:

      ```json
      [
        {
          "AllowedOrigins": ["http://localhost:4200", "https://<prod-domain>"],
          "AllowedMethods": ["GET", "HEAD"],
          "AllowedHeaders": ["*"],
          "ExposeHeaders": [
            "Content-Length",
            "Content-Type",
            "Content-Range",
            "Accept-Ranges",
            "ETag"
          ],
          "MaxAgeSeconds": 3600
        }
      ]
      ```

  `ExposeHeaders` is mandatory — without `Accept-Ranges` and
  `Content-Range`, seeking past the initial buffer breaks.

Once this is done, the current player works end-to-end. But it still
downloads every full audio file before showing a waveform. That's
wasteful and the main reason to do the "quality ultimate" track below.

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
- [ ] Add `peaks: string` (base64 Int16) and `peakCount: number` to
      `TAudioAnalysisSnapshot` in
      `packages/shared-types/src/music-tracks.ts`. Mark as optional
      for backwards compatibility.
- [ ] Update `SAudioAnalysisSnapshot` Zod schema with optional
      `peaks` + `peakCount`.
- [ ] Expose two helpers in shared-types:
      - `encodePeaks(floats: Float32Array): string` — normalises to
        [-1, 1], scales to Int16 range, packs to `Uint8Array`, base64.
      - `decodePeaks(encoded: string, count: number): Float32Array` —
        reverse operation.

#### Audio processor microservice
- [ ] In `apps/audio-processor/src/core/analyze.ts`, after Essentia
      loads the audio buffer, compute a downsampled peak array:
      1. Determine `bucketSize = floor(samples.length / TARGET_PEAKS)`
         (TARGET_PEAKS = 2000).
      2. For each bucket, walk samples and record the max absolute
         value (peak amplitude).
      3. Return as a `Float32Array` of length TARGET_PEAKS.
- [ ] Encode with the shared `encodePeaks` helper and include in the
      returned `TAudioAnalysisSnapshot`.
- [ ] Add a unit test with a synthetic sine wave input that asserts
      the decoded peaks match the expected envelope within tolerance.

#### Backend persistence
- [ ] `TrackUploadedHandler` already calls `aggregate.setTrackAnalysis`
      with the full snapshot — no change needed, peaks ride along.
- [ ] `GetUserMusicLibraryQuery.toVersionView` — make sure the peaks
      fields are passed through (they live inside `analysisResult`
      already, confirm the projection doesn't strip them).
- [ ] Repository mapper: check `MusicVersionRepository.toDomain` /
      `toRecord` — base64 string round-trips fine, nothing to adapt.

#### Migration for existing tracks
- [ ] Write `apps/backend/src/migrations/backfill-track-peaks.mjs`:
      1. Iterate every `music_versions` doc.
      2. For each track whose `analysisResult.peaks` is absent,
         dispatch a re-analysis TCP message to the audio processor
         (reuse `AUDIO_PROCESSOR` client, pattern
         `ANALYZE_TRACK`).
      3. Save the returned snapshot back to the version.
      4. Rate-limit to 4 concurrent jobs to avoid swamping the
         processor.
- [ ] Make the script idempotent: running twice is a no-op for tracks
      that already have peaks.
- [ ] Log progress (`N/total tracks enriched`) and dump a summary at
      the end.

#### Frontend
- [ ] `audio-player.types.ts`: add `peaks?: Float32Array` to
      `TPlayableTrack` and decode it in `toPlayableTrack()` using
      the shared `decodePeaks` helper.
- [ ] `audio-player-bar.component.ts`:
      - When loading a new track, pass peaks to `wavesurfer.load(url, peaks)`.
        The `load` signature supports `(url, peaks, duration?, channelData?)`.
      - If `peaks` are absent (legacy track), fall back to the current
        fetch-based path.
      - Set `duration` from the analysis snapshot when available so
        the timeline is accurate before any audio byte is loaded.
- [ ] Verify the `notifyReady` callback still fires in peak-fed mode
      — wavesurfer still emits `ready` after the audio element loads
      its metadata, which should be quick since it only reads the
      file header.

#### Bonus — sparkline thumbnails
- [ ] New `WaveformThumbnailComponent`: 60×20 px canvas that draws a
      tiny static waveform from a `Float32Array`. Purely visual, no
      audio.
- [ ] Use in:
      - `music-repertoire-table` — replace or augment the `track-count`
        badge with a thumbnail when the version has tracks.
      - `music-reference-card` — small strip below the version label.
- [ ] Caching: the thumbnail is cheap enough to render on every change
      detection, but we can memoize per track id if the table grows.

#### Marker improvements
- [ ] Once peaks are available, extend `buildMarkers()` in the bar
      component to walk the peaks array and tag individual buckets
      where `abs(peak) > CLIP_THRESHOLD` (0.98 or 0.99 depending on
      how aggressive we want to flag).
- [ ] Render one marker per clipped region (merge adjacent clips
      within a small window) instead of a single full-width stripe.
- [ ] Same idea for the "loudest window" marker — use a rolling RMS
      over the peaks to find the real loudest N seconds.

#### Observability
- [ ] Telemetry: log the extract time and peak byte size for each
      upload so we can spot regressions.
- [ ] Health check: a periodic cron that finds tracks still missing
      peaks and reports them to the owner.
- [ ] Error handling: if peak extraction fails, the rest of the
      analysis (LUFS, BPM, key) must still succeed — the feature
      should degrade gracefully.

---

## Acceptance criteria

- [ ] Upload a new track → peaks stored, bar paints the waveform with
      zero R2 round trip after the presigned URL is fetched.
- [ ] Open an older track (pre-migration) → falls back to the existing
      fetch-based path without error.
- [ ] Run the backfill migration → all existing tracks gain peaks.
- [ ] Disable R2 CORS temporarily → playback still works for tracks
      with peaks (the `<audio>` element doesn't need CORS).
- [ ] Table / cards show sparkline thumbnails for every version that
      has at least one analyzed track.
- [ ] Clipping markers appear only over the actual clipped samples,
      not as a full-width stripe.
- [ ] No regression on LUFS / BPM / key values in existing tracks.

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

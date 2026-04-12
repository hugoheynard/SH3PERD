# SH3PHERD — Music Library

Feature TODO for the Music Library module. Consolidates the audit
from 2026-04-11 and the proposed roadmap, ordered by ROI.

## Audit recap

### What works well
- DDD-correct backend: `MusicReferenceEntity`, `MusicVersionEntity`,
  `RepertoireEntryEntity`, aggregate root + `MusicPolicy`.
- CQRS with 13 commands, 5 queries, 1 event handler.
- `audio-processor` microservice (TCP): Essentia BPM/key, ITU-R BS.1770
  loudness analysis, mastering via loudnorm pass-2, ffmpeg pitch-shift.
- Frontend with layered services: selectors, mutations, api. Tab
  system with configurable search modes, filters by genre + BPM +
  duration + ratings.
- Upload flow wired to async analysis via event bus.

### What's missing or partial
- No inline audio playback — tracks can be downloaded but not played
  in-app, no waveform, no queue, no practice-mode player.
- Cross-search UI is built but the backend endpoint is missing;
  `mockCrossContext` fills the state in dev.
- `shared` / `match` search modes are declared but not implemented.
- References carry only title + artist — no album, year, cover art,
  ISRC, MusicBrainz id.
- No tags, no setlists, no link with Playlists V2.
- No play stats, no last-played, no practice log, no streaks.
- Versions are personal — no sharing, no fork, no node-scoping, no
  contract-level library.
- Policy is restrictive: 1 master per version, 2 tracks per version,
  no stems, no instrumental/voice-only separation.
- No external metadata import (Spotify, Deezer, MusicBrainz).
- No acoustic matching between versions (key-compatible, BPM-close).

---

## Roadmap — ordered by ROI

### Tier 1 — High impact, data and infra already in place

#### 1. Inline audio player with waveform
- [ ] Install `wavesurfer.js` (lightweight, no framework lock-in).
- [ ] `AudioPlayerService` — global signal-based state (current track,
      queue, playing, position, volume, loop mode).
- [ ] `AudioPlayerComponent` — docked bar at the bottom of the app
      (Spotify/SoundCloud pattern). Waveform, play/pause, seek, prev/next,
      volume, track metadata row.
- [ ] Play buttons wired into `music-repertoire-table` and
      `music-reference-card`.
- [ ] Queue builder: play all favorites of the current tab / filtered
      set, play a version's favorite track.
- [ ] Loudness markers on the waveform using `TAudioAnalysisSnapshot`
      (clipping zones in red, true-peak warnings, loudest segment
      highlighted).
- [ ] Keyboard shortcuts: Space (play/pause), ← → (seek ±5 s),
      M (mute), N (next), P (previous).
- [ ] Mobile-friendly touch controls (min-40px tap targets, swipe).

#### 2. Metadata enrichment via MusicBrainz / Spotify
- [ ] New `MusicMetadataService` in the backend that looks up
      `title + artist` against MusicBrainz (free, no auth) and, as a
      fallback, Spotify (OAuth client credentials).
- [ ] Enrich `MusicReferenceEntity` with optional fields: `album`,
      `releaseYear`, `coverArtUrl`, `isrc`, `musicBrainzId`.
- [ ] Deduplication via `musicBrainzId` when available (stronger than
      lowercase title/artist).
- [ ] Backfill migration for existing references.
- [ ] Cover art shown on cards + table + player.

#### 3. Personal play stats & practice log
- [ ] New collection `music_plays` with one doc per playback session:
      `{ user_id, version_id, track_id, started_at, duration_played }`.
- [ ] Emit `TrackPlayedEvent` from the player when a track reaches
      ≥30 s or ≥25 % of its duration (avoids noise from scrubbing).
- [ ] Query: `last_played`, `play_count`, `total_practice_time`.
- [ ] "Stale tracks" view: versions not played in >30 days, sorted
      by mastery rating (high-rated stale first).
- [ ] Practice streak: consecutive days with at least 1 valid play
      (stored + displayed in side panel).
- [ ] Heatmap calendar (GitHub-style) of practice days.

---

### Tier 2 — Product differentiators

#### 4. Cross search backend
- [ ] `GetContractCrossLibraryQuery` — joins repertoire entries of all
      contract members (or orgchart node members) and returns a
      reference × user matrix.
- [ ] Compatibility score per (reference, user-set) based on BPM
      variance, key compatibility (circle of fifths), LUFS delta.
- [ ] `GET /protected/music/cross?contractId=...&filter=...` endpoint
      that replaces `mockCrossContext` in the state service.
- [ ] Wire the already-built `MusicCrossTableComponent` to the real
      data.
- [ ] Cache strategy: response is expensive, TTL 1 min per contract.

#### 5. Smart setlist builder
- [ ] Harmonic mixing: given a list of versions, compute valid
      transitions using circle-of-fifths key compatibility.
- [ ] Energy curve targeting: user picks a shape (linear ramp, peak-
      middle, wave) and the builder selects + orders versions matching
      the shape via `energy` rating + LUFS.
- [ ] Duration target: "50 min concert" → LP solver on `durationSeconds`.
- [ ] Constraints: "no two consecutive songs in the same key",
      "minor key at least every 3 songs", "no BPM delta >15 between
      adjacent songs".
- [ ] Export to Playlists V2 as a new setlist.
- [ ] Manual override on the generated order (drag to reorder,
      lock a position).

#### 6. AI mastering via DeepAFx-ST (autodiff)
- [ ] Integrate Adobe's DeepAFx-ST (autodiff mode) as a Python worker
      alongside the existing Node.js audio-processor.
- [ ] Two-stage pipeline: DeepAFx-ST (intelligent EQ + compression) →
      ffmpeg loudnorm (LUFS/LRA calibration to user target).
- [ ] Three mastering modes in the UI: Standard (loudnorm only),
      AI Master (reference-based), AI Master Full Auto (preset + -14 LUFS).
- [ ] Expose the predicted EQ curve + compressor settings to the user
      ("here's what the AI did").
- [ ] Ship 3-5 built-in reference presets (streaming, vinyl, broadcast).
- [ ] See dedicated doc: `sh3-music-mastering.md`

#### 7. Key / tempo transposition suggestions
- [ ] Transposition presets: "Vocalist preferred key" (user profile
      setting), "Broadcast-ready" (-23 LUFS), "Streaming" (-14 LUFS).
- [ ] UI on each version: "Pitch-shift this version to X" (dropdown).
- [ ] Time-stretch support in the audio-processor microservice
      (currently pitch-shift only). ffmpeg `rubberband` filter.
- [ ] Auto-mastering presets per target platform.

---

### Tier 3 — Integration with the rest of the platform

#### 8. Node-scoped music libraries
- [ ] Optional `node_id` on `RepertoireEntry` OR a `node_repertoire`
      junction collection that shares references between node members.
- [ ] Add `node` target mode on the search config alongside `me`,
      `contract`, etc.
- [ ] Permission: `P.Music.Library.Read` already covers, just needs to
      be node-scoped in the query handler.
- [ ] UI: selector in the side panel lets the user switch between
      "my repertoire", "node repertoire", "contract repertoire".

#### 9. Music → Playlist V2 bridge
- [ ] `PlaylistTrack` can reference either a raw file OR a
      `MusicVersion` id.
- [ ] When the reference is a `MusicVersion`, the playlist item auto-
      pulls the favorite track from the version.
- [ ] Setlist mode on playlists: shows BPM/key/LUFS of each item,
      computes transition quality between adjacent items.
- [ ] Bulk-add "all versions of tab X" into a playlist.

#### 10. Contract-scoped library sharing
- [ ] Version-level sharing: a version is visible to a `contract_id`
      (in addition to its `owner_id`).
- [ ] Fork action: create a new version copy on the forker's side,
      with `parentVersionId` linking back to the original.
- [ ] "Forks of this version" list on the original.
- [ ] Notification when someone forks your version.

---

### Tier 4 — AI / automation

#### 11. Auto-tagging and recommendation
- [ ] Integrate MusicNN (or Discogs-effnet) inside the audio-processor
      to extract mood + instrument tags + genre probability at upload
      time.
- [ ] Store embeddings (128- or 256-dim) on the track for similarity
      search.
- [ ] MongoDB Atlas Vector Search index on the embedding field.
- [ ] "Similar tracks" suggestion on each version.
- [ ] Semantic search: "melancholic minor-key songs around 90 BPM" →
      embedding of the query → ANN lookup.

#### 12. Lyrics + chord sheets + sync
- [ ] Lyrics fetch via Genius / Musixmatch API at reference creation.
- [ ] Chord sheet fetch (Ultimate Guitar scraping or Chordify API).
- [ ] Store as markdown on the reference.
- [ ] Auto-sync lyrics/chords ↔ audio using the beat grid from the
      analysis result.
- [ ] Practice mode: inline lyrics scroll, chords pop at the right
      timing above the waveform.
- [ ] Transposition of chord sheets when the version is pitch-shifted.

#### 13. Practice assistant (Claude-powered)
- [ ] Daily agent run that analyzes a user's library + play stats +
      ratings and generates a practice report:
    - Stale high-rated songs to revisit
    - Weak areas (keys/genres with consistently low mastery)
    - Band compatibility notes vs contract members
    - Suggested setlists for upcoming events (via calendar integration)
- [ ] Delivery: in-app feed, optional weekly email, optional Slack DM
      to the owner via the existing Slack integration.

---

## Parallel tracks

- [ ] Frontend: split the massive `music-library-page.component.ts`
      (260 lines, 15 event handlers) into smaller orchestration units —
      moving the track upload / download / favorite logic into a
      dedicated `TrackInteractionService`.
- [ ] Backend: unit tests for `MusicPolicy` limits (10 versions,
      2 tracks, 1 master, 3 derivations).
- [ ] Backend: unit tests for `RepertoireEntryAggregate` dirty
      tracking.
- [ ] Audio-processor: concurrent analysis queue (current setup runs
      analysis sequentially per message).
- [ ] Replace the `mockCrossContext` sentinel with an explicit empty
      state so tests don't leak mock data.

---

## Current priority

**Completed: Tier 1 / #1 — Inline audio player with waveform.** ✅
Player docked bar, wavesurfer, queue, keyboard shortcuts, play
buttons in table + cards. See `sh3-music-audio-player.md`.

**In progress: Tier 1 / #1 supplement — Pre-computed peaks.** 🔄
Shared types helpers, processor extraction, frontend decode + sparkline
thumbnails, pixel-accurate markers. Code written, pending commit.

**Next up: Tier 2 / #6 — AI mastering via DeepAFx-ST.**
See dedicated doc: `sh3-music-mastering.md`.

---

## Related docs
- `sh3-music-audio-player.md` — audio player layer (peaks pipeline,
  sparklines, markers, CORS R2 config)
- `sh3-music-mastering.md` — AI mastering architecture (DeepAFx-ST
  autodiff, two-stage pipeline, reference presets, UX)
- `sh3-orgchart.md` — orgchart roadmap (where node-scoped libraries
  connect to this module)
- `sh3-orgchart-export.md` / `sh3-orgchart-print.md` — previous feature
  track

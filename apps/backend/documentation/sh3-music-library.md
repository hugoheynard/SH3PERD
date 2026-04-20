# SH3PHERD — Music Library

Feature roadmap for the Music Library module. Updated 2026-04-16.

---

## Current state

### What's shipped ✅

| Feature                       | Status | Details                                                                                                                                                                                                          |
| ----------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DDD backend**               | ✅     | `MusicReferenceEntity`, `MusicVersionEntity`, `RepertoireEntryEntity`, `RepertoireEntryAggregate`, `MusicPolicy`                                                                                                 |
| **CQRS**                      | ✅     | 14 commands, 6 queries, 1 event handler                                                                                                                                                                          |
| **Audio processor**           | ✅     | Essentia BPM/key, ITU-R BS.1770 loudness, mastering (loudnorm), pitch-shift (ffmpeg asetrate), AI mastering (DeepAFx-ST subprocess)                                                                              |
| **Inline audio player**       | ✅     | Docked bar, wavesurfer.js, queue, keyboard shortcuts (Space/←/→/N/P/M), play buttons in table + cards                                                                                                            |
| **Pre-computed peaks**        | ✅     | Peak extraction in processor, base64 Int16 encode/decode in shared-types, instant waveform via `load(url, peaks)`, sparkline thumbnails, pixel-accurate clipping markers                                         |
| **Mastering UI**              | ✅     | Modal with 3 modes (Standard/AI/Full Auto), EQ curve SVG, compressor display, LUFS target presets, before/after comparison                                                                                       |
| **AI mastering backend**      | ✅     | Python DeepAFx-ST worker, TS subprocess bridge, `AiMasterTrackCommand`, `POST /:trackId/ai-master` endpoint                                                                                                      |
| **Pitch-shift**               | ✅     | `pitchShift()` implemented (was a stub), `PitchShiftVersionCommand`                                                                                                                                              |
| **Platform contract**         | ✅     | `PlatformContractEntity`, `@PlatformScoped()` decorator, `PlatformContractContextGuard`, created at registration (plan_free)                                                                                     |
| **Quota service**             | ✅     | `QuotaService` with `ensureAllowed()` + `recordUsage()`, `PLAN_QUOTAS` config, 402 errors, wired in 5 handlers                                                                                                   |
| **Cross library backend**     | ✅     | `GetCompanyCrossLibraryQuery`, `GET /companies/:id/cross-library`, `@ContractScoped`                                                                                                                             |
| **Cross library frontend**    | ✅     | `MusicLibraryStateService.loadCrossLibrary()` resolves `companyId` from the active contract and calls `GET /companies/:id/cross-library`. `MusicCrossTableComponent` renders the real matrix. Mock data removed. |
| **Waveform sparkline**        | ✅     | `WaveformThumbnailComponent` wired in `music-repertoire-table` and `music-reference-card` — paints a 60×14 static strip from the analysis peaks.                                                                 |
| **Audio marker pipeline**     | ✅     | `AudioMarkerService` — pixel-accurate clipping regions + sliding-RMS loudest window from peaks, snapshot fallback for legacy tracks (38 unit tests).                                                             |
| **Music controllers cleanup** | ✅     | All 7 controllers: `@PlatformScoped()` + `@RequirePermission()`, zero `any`, explicit `execute<C,R>` types                                                                                                       |
| **Controller split**          | ✅     | `MusicTrackController` (CRUD) + `MusicTrackProcessingController` (mastering/pitch-shift)                                                                                                                         |
| **Shared utils**              | ✅     | `rating.utils.ts`, `duration.utils.ts`, `InlineConfirmComponent` extracted to shared                                                                                                                             |
| **Unit tests (processor)**    | ✅     | 38 tests: analyze (computeQuality, blockLoudness, truePeakLinear, mixToMono, peaks), pitch-shift (computeShiftedRate), ai-master (subprocess mock)                                                               |
| **Unit tests (quota)**        | ✅     | 11 tests: allow/block/unlimited/unavailable/amount/record/summary                                                                                                                                                |
| **E2E tests**                 | ✅     | 24 tests: auth (18) + workspace (6), MongoMemoryServer, entity-based factories                                                                                                                                   |
| **Analytics coverage**        | ✅     | All 14 music commands emit `analytics_events` (create/update/delete refs, versions, tracks, entries, favorites, tab configs). See `sh3-analytics-events.md`.                                                     |

### What's partially done 🔄

| Feature                     | Status | What remains                                                                                                                                                                                                                             |
| --------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AI mastering end-to-end** | 🔄     | Backend + frontend UI done. Need to install the DeepAFx-ST checkpoint + Python deps to test on real audio.                                                                                                                               |
| **Peaks on real data**      | 🔄     | Code complete on the whole pipeline (processor extraction, shared-types helpers, player waveform, sparklines in table + card, markers). Run the `backfill-track-peaks.mjs` migration on existing tracks to populate peaks retroactively. |

### What's not started ❌

| Feature                                   | Status |
| ----------------------------------------- | ------ |
| Metadata enrichment (MusicBrainz/Spotify) | ❌     |
| Personal play stats + practice log        | ❌     |
| Smart setlist builder                     | ❌     |
| Key/tempo transposition suggestions UI    | ❌     |
| Node-scoped music libraries               | ❌     |
| Music → Playlist V2 bridge                | ❌     |
| Contract-scoped library sharing + forks   | ❌     |
| Auto-tagging + recommendation (MusicNN)   | ❌     |
| Lyrics + chord sheets + sync              | ❌     |
| Practice assistant (Claude-powered)       | ❌     |
| **Persona match** (AI event programming)  | ❌     |

---

## Roadmap — ordered by ROI

### Tier 1 — Foundations (high impact, infra in place)

#### 1. Inline audio player with waveform ✅ DONE

See `sh3-music-audio-player.md`.

#### 1b. Pre-computed waveform peaks ✅ DONE

See `sh3-music-audio-player.md`.

#### 2. Metadata enrichment via MusicBrainz / Spotify

- [ ] `MusicMetadataService` — lookup title+artist against MusicBrainz (free) / Spotify (OAuth)
- [ ] Enrich `MusicReferenceEntity`: `album`, `releaseYear`, `coverArtUrl`, `isrc`, `musicBrainzId`
- [ ] Deduplication via `musicBrainzId`
- [ ] Backfill migration for existing references
- [ ] Cover art in cards + table + player
- **Effort**: ~3 days

#### 3. Personal play stats & practice log

- [ ] Collection `music_plays`: `{ user_id, version_id, track_id, started_at, duration_played }`
- [ ] `TrackPlayedEvent` from player (≥30s or ≥25% of duration)
- [ ] Queries: `last_played`, `play_count`, `total_practice_time`
- [ ] "Stale tracks" view (>30 days since last play, high mastery first)
- [ ] Practice streak (consecutive days)
- [ ] Heatmap calendar (GitHub-style)
- **Effort**: ~2 days

---

### Tier 2 — Product differentiators

#### 4. Cross search ✅ DONE

- [x] `GetCompanyCrossLibraryQuery` — cross-references all artists' libraries
- [x] `GET /api/protected/companies/:id/cross-library` endpoint
- [x] Shared types: `TCrossSearchResult`, `TCrossMember`, `TCrossReferenceResult`
- [x] Sorted by `compatibleCount` (most-shared songs first)
- [x] `MusicLibraryStateService.loadCrossLibrary(contractId)` resolves the company from the active contract and calls the real endpoint
- [x] `MusicCrossTableComponent` renders the live matrix; `mockCrossContext` and the rest of `utils/mock-music-data.ts` have been removed
- [ ] Compatibility score (BPM variance, key compat, LUFS delta)
- [ ] Cache strategy (TTL 1 min per company)
- [ ] Display the three ratings (MST / NRG / EFF) per member cell — currently only MST shown by lack of room

#### 5. Persona match (AI event programming) ❌ NEW

- [ ] `PersonaExtractor` — Claude Haiku extracts criteria from free text
- [ ] `ScoringEngine` — pure algorithm scores artist × version × slot
- [ ] `LineupBuilder` — Claude Sonnet curates the final lineup + explanation
- [ ] `POST /companies/:id/persona-match` endpoint
- [ ] Timeline UI with slot cards, energy curve SVG, AI explanation
- [ ] Alternatives (2-3 lineups), lock-a-slot, regenerate
- [ ] Quota: `persona_match` (Free: 0, Pro: 5/month, Band+: unlimited)
- **Effort**: ~5.5 days
- See `sh3-persona-match.md`

#### 6. Smart setlist builder

- [ ] Harmonic mixing (circle of fifths key compatibility)
- [ ] Energy curve targeting (ascending, peak, wave, flat)
- [ ] Duration target ("50 min concert" → LP solver)
- [ ] Constraints (no 2 consecutive same key, BPM delta <15)
- [ ] Export to Playlists V2
- [ ] Manual override (drag reorder, lock position)
- **Effort**: ~4 days

#### 7. AI mastering via DeepAFx-ST ✅ BACKEND + UI DONE

- [x] Python worker `deepafx_worker.py`
- [x] TS subprocess bridge `ai-master.ts`
- [x] `AiMasterTrackCommand` + `POST /:trackId/ai-master`
- [x] Mastering modal (3 modes, EQ curve SVG, presets, LUFS targets)
- [ ] Install DeepAFx-ST checkpoint + Python deps for real testing
- [ ] Ship 3-5 built-in reference presets (streaming, vinyl, broadcast)
- See `sh3-music-mastering.md`

#### 8. Key / tempo transposition suggestions

- [ ] Transposition presets ("Vocalist preferred key", platform targets)
- [ ] UI on each version: "Pitch-shift to X" dropdown
- [ ] Time-stretch (ffmpeg rubberband) — pitch-shift ✅ done, time-stretch ❌
- **Effort**: ~1 day

---

### Tier 3 — Platform integration

#### 9. Node-scoped music libraries

- [ ] `node_id` on `RepertoireEntry` OR `node_repertoire` junction
- [ ] `node` target mode in search config
- [ ] UI: selector "my repertoire" / "node repertoire" / "contract repertoire"
- **Effort**: ~3.5 days

#### 10. Music → Playlist V2 bridge

- [ ] `PlaylistTrack` references `MusicVersion` id
- [ ] Auto-pull favorite track from referenced version
- [ ] Setlist mode (BPM/key/LUFS display + transition quality)
- [ ] Bulk-add from tab
- **Effort**: ~2.5 days

#### 11. Contract-scoped library sharing

- [ ] Version-level sharing via `contract_id`
- [ ] Fork action (copy with `parentVersionId` link)
- [ ] "Forks of this version" list
- [ ] Notification on fork
- **Effort**: ~3 days

---

### Tier 4 — AI / automation

#### 12. Auto-tagging + recommendation

- [ ] MusicNN / Discogs-effnet in audio-processor
- [ ] Mood + instrument tags + genre probability at upload
- [ ] Embeddings (128-dim) for similarity search
- [ ] MongoDB Atlas Vector Search
- [ ] "Similar tracks" + semantic search
- **Effort**: ~5 days

#### 13. Lyrics + chord sheets + sync

- [ ] Genius / Musixmatch API for lyrics
- [ ] Chord sheets (Chordify / Ultimate Guitar)
- [ ] Auto-sync with beat grid
- [ ] Practice mode (scrolling lyrics, chord timing)
- [ ] Chord transposition on pitch-shift
- **Effort**: ~4 days

#### 14. Practice assistant (Claude-powered)

- [ ] Daily analysis of library + play stats + ratings
- [ ] Practice report: stale songs, weak areas, band compatibility
- [ ] Suggested setlists for upcoming events
- [ ] Delivery: in-app feed, weekly email, Slack DM
- **Effort**: ~2.5 days

---

## Infrastructure done

| Layer                 | What                                                                                              | Doc                         |
| --------------------- | ------------------------------------------------------------------------------------------------- | --------------------------- |
| **Platform contract** | SaaS subscription per user (Free/Pro/Band/Business), `@PlatformScoped()`, created at registration | `sh3-platform-contract.md`  |
| **Quota service**     | `ensureAllowed()` + `recordUsage()` in 5 handlers, plan-based limits, 402 errors                  | `sh3-quota-service.md`      |
| **Audio processor**   | Essentia + ITU BS.1770 + ffmpeg + DeepAFx-ST, 38 unit tests                                       | `sh3-music-mastering.md`    |
| **Audio player**      | Wavesurfer, peaks, sparklines, markers, keyboard shortcuts                                        | `sh3-music-audio-player.md` |
| **E2E tests**         | MongoMemoryServer, entity-based factories, 24 tests                                               | `sh3-e2e-tests.md`          |
| **Shared utils**      | `rating.utils.ts`, `duration.utils.ts`, `InlineConfirmComponent`                                  | —                           |

---

## Recommended priority order

1. **Run the peaks backfill migration** (`backfill-track-peaks.mjs`) — existing tracks don't have peaks yet; once migrated the sparklines + instant waveform light up everywhere
2. **Persona match** (~5.5 days) — the killer feature for event venues, uses Claude API
3. **Metadata enrichment** (~3 days) — covers make the library look pro
4. **Play stats** (~2 days) — daily engagement driver
5. **Smart setlist builder** (~4 days) — builds on cross search + scoring engine from persona match

---

## Related docs

| Doc                         | What it covers                                                             |
| --------------------------- | -------------------------------------------------------------------------- |
| `sh3-music-audio-player.md` | Player bar, wavesurfer, peaks, sparklines, markers, CORS R2                |
| `sh3-music-mastering.md`    | DeepAFx-ST autodiff, two-stage pipeline, presets, subprocess bridge        |
| `sh3-persona-match.md`      | AI event programming: persona extraction + scoring engine + lineup builder |
| `sh3-platform-contract.md`  | SaaS plans, `@PlatformScoped()`, dual contract model                       |
| `sh3-quota-service.md`      | Quota enforcement, plan limits, 402 errors, usage counters                 |
| `sh3-e2e-tests.md`          | E2E infrastructure, MongoMemoryServer, factories, patterns                 |
| `sh3-orgchart.md`           | Orgchart roadmap (node-scoped libraries connect here)                      |

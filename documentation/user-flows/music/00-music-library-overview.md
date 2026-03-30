# Music Library — Architecture Overview

## Domain Model

```
TMusicReferenceDomainModel          TMusicRepertoireEntryDomainModel         TMusicVersionDomainModel
┌──────────────────────────┐        ┌───────────────────────────────┐        ┌──────────────────────────────┐
│ id: TMusicReferenceId    │<───────│ musicReference_id             │        │ id: TMusicVersionId          │
│ title: string            │   FK   │ id: TRepertoireEntryId        │        │ musicReference_id            │──> FK to Reference
│ artist: string           │        │ user_id: TUserId              │        │ owner_id: TUserId            │
│ owner_id: TUserId        │        └───────────────────────────────┘        │ label, genre, type, bpm...   │
└──────────────────────────┘                                                 │ mastery, energy, effort: 1-4 │
                                                                             │ tracks: VersionTrack[]       │
                                                                             └──────────────────────────────┘
                                                                                          │
                                                                             ┌────────────┴────────────┐
                                                                             │  TVersionTrackDomainModel │
                                                                             │  id: TVersionTrackId      │
                                                                             │  fileName, durationSeconds │
                                                                             │  analysisResult?           │
                                                                             │  favorite: boolean         │
                                                                             └───────────────────────────┘
```

## Frontend State Shape

```
MusicLibraryState
├── entries: LibraryEntry[]           ← structured: reference + versions per entry
│   └── { id, reference, versions[] }
├── tabs: MusicTab[]                  ← UI: search config per tab
├── activeTabId: string
├── savedTabConfigs: SavedTabConfig[]
└── crossContext?: CrossSearchContext  ← cross-search between users
```

## View Model (API → Frontend)

```
TRepertoireEntryViewModel (what the API returns)
├── id: TRepertoireEntryId
├── reference: TReferenceView
│   ├── id, title, originalArtist     ← no owner_id (stripped for frontend)
└── versions: TVersionView[]
    ├── id, label, genre, type, bpm, pitch, notes
    ├── mastery, energy, effort       ← 1-4 rating
    └── tracks: TVersionTrackDomainModel[]
```

## Backend Architecture (CQRS)

```
Controller (REST)
    │
    ├── Commands (write)
    │   ├── CreateMusicReference    → MusicReferenceEntity (dedup)
    │   ├── CreateRepertoireEntry   → RepertoireEntryEntity
    │   ├── CreateMusicVersion      → MusicVersionEntity
    │   ├── DeleteMusicVersion      → cleanup S3 tracks
    │   ├── UploadTrack             → S3 + push subdoc
    │   ├── DeleteTrack             → S3 + pull subdoc
    │   └── SetTrackFavorite        → unset all + set target
    │
    ├── Queries (read)
    │   ├── SearchMusicReferences   → Atlas Search fuzzy
    │   └── GetUserMusicLibrary     → 3 queries + JS join → TRepertoireEntryViewModel[]
    │
    ├── Entities (domain)
    │   ├── MusicReferenceEntity    → rename(), normalize lowercase
    │   ├── MusicVersionEntity      → addTrack(), removeTrack(), setFavoriteTrack(), updateMetadata()
    │   ├── RepertoireEntryEntity   → isOwnedBy()
    │   └── VersionTrackVO          → immutable, withFavorite(), withAnalysis()
    │
    └── Policy
        └── MusicPolicy             → ensureCanMutateVersion(), ensureCanMutateEntry()
```

## Frontend Services

```
MusicLibraryStateService          ← signal-based state store
    │
    ├── MusicLibrarySelectorService   ← computed signals, filtering, track helpers
    │   ├── entries, tabs, activeTab
    │   ├── activeEntries (filtered by tab config + search)
    │   └── static: favoriteTrack(), favoriteQuality(), favoriteDuration()
    │
    ├── MusicLibraryMutationService   ← optimistic state updates
    │   ├── addEntry(), removeEntry()
    │   ├── addVersion(), updateVersion(), removeVersion()
    │   └── addTrack(), removeTrack(), setFavoriteTrack(), saveTrackAnalysis()
    │
    └── MusicTabMutationService       ← tab CRUD, reorder, color, search config
```

## User Flows (see dedicated files)

| Flow | File | Status |
|------|------|--------|
| Add reference to repertoire | `01-add-reference-to-repertoire.md` | Wired (front + back) |
| Add version to entry | `02-add-version.md` | Frontend mock only |
| Upload & analyse track | `03-upload-analyse-track.md` | Frontend mock (fake analyser) |
| Cross-search between users | `04-cross-search.md` | Frontend mock only |
| Get user library | `05-get-user-library.md` | Backend query ready, not wired |

## Shared Types (package: @sh3pherd/shared-types)

| File | Exports |
|------|---------|
| `ids.ts` | `TMusicReferenceId`, `TMusicVersionId`, `TRepertoireEntryId`, `TVersionTrackId` |
| `music.domain.schemas.ts` | `Genre`, `VersionType`, `TRating`, `SRating`, `SGenreEnum`, `STypeEnum` |
| `music-references.ts` | `TMusicReferenceDomainModel`, `TCreateMusicReferenceRequestDTO` |
| `music.versions.ts` | `TMusicVersionDomainModel`, `TCreateMusicVersionPayload`, `TUpdateMusicVersionPayload` |
| `music-repertoire.ts` | `TMusicRepertoireEntryDomainModel`, `TCreateRepertoireEntryPayload` |
| `music-tracks.ts` | `TVersionTrackDomainModel`, `TAudioAnalysisSnapshot`, `TUploadTrackPayload` |
| `music.domain.types.ts` | `TReferenceView`, `TVersionView`, `TRepertoireEntryViewModel`, `TUserMusicLibraryViewModel` |

# Music Library Feature

## Domain Model

```
MusicReference          ← global anchor (title + originalArtist)
       │
       └── RepertoireEntry    ← user ↔ reference link (userId + referenceId)
                  │
                  └── MusicVersion[]   ← per-artist rendition of a reference
```

### Types (`music-library-types.ts`)

| Type              | Fields                                                                                            | Notes                                                          |
|-------------------|---------------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| `MusicReference`  | `id, title, originalArtist`                                                                       | Global catalogue entry, shared across users                    |
| `RepertoireEntry` | `id, referenceId, userId`                                                                         | Join between a user and a reference                            |
| `MusicVersion`    | `id, entryId, label, durationSeconds?, bpm?, genre, mastery, energy, effort, quality`             | One rendition of a reference (cover, pitch variant, acoustic…) |
| `MusicTab`        | `id, title, autoTitle, searchConfig`                                                              | Saved search configuration                                     |
| `Rating`          | `1 \| 2 \| 3 \| 4`                                                                                | Used for mastery / energy / effort / quality                   |
| `MusicGenre`      | `'Pop' \| 'Rock' \| 'EDM' \| 'Jazz/Soul' \| 'Hip-Hop' \| 'R&B' \| 'Classical' \| 'Folk/Acoustic'` | 8 fixed genres                                                 |

---

## Architecture

### State layer

```
MusicLibraryStateService          ← single signal<MusicLibraryState>
```

All state lives in one signal. Mutations write to it; selectors read from it. No HTTP, no async — pure in-memory for now (backed by mock data via `utils/mock-music-data.ts`).

### Mutation layer (`services/mutations-layer/`)

All extend `BaseMusicItemCRUD<K>` — a generic service that provides `add()`, `remove()`, `patch()` on a specific key of `MusicLibraryState`.

| Service                          | Manages                  | Key methods                                                                                                 |
|----------------------------------|--------------------------|-------------------------------------------------------------------------------------------------------------|
| `MusicReferenceMutationService`  | `references[]`           | `addReference(title, artist)`                                                                               |
| `MusicRepertoireMutationService` | `repertoire[]`           | `addEntry(referenceId)`                                                                                     |
| `MusicVersionMutationService`    | `versions[]`             | `addVersion(payload)`, `updateVersion(id, patch)`, `removeVersion(id)`                                      |
| `MusicTabMutationService`        | `tabs[]` + `activeTabId` | `addDefaultTab()`, `closeTab(id)`, `setActiveTab(id)`, `patchDataFilter(id, patch)`, `toggleDataFilter(id)` |

### Selector layer (`services/selector-layer/`)

All use `computed()` signals derived from state.

| Service                       | Provides                                                     |
|-------------------------------|--------------------------------------------------------------|
| `MusicLibrarySelectorService` | Facade — aggregates all selectors; used directly by the page |
| `ReferenceSelectorService`    | `allReferences()`, filtered lists                            |
| `RepertoireSelectorService`   | `entriesByReferenceId()` (Map), `entriesByUserId()`          |
| `VersionSelectorService`      | `versionsByReferenceId()` (Map), `versionsByEntryId()` (Map) |
| `TabSelectorService`          | `activeTab()`, `activeTabId()`, `tabs()`                     |

`MusicLibrarySelectorService` also exposes:
- `activeResults()` — references filtered by the active tab's `dataFilter` (genres + ratings)
- `totalReferences()`, `totalRepertoireEntries()`
- `averageMastery()`, `averageQuality()`
- `entryIdForRef(refId)` — convenience helper

---

## Components

### Page entry point

**`music-library-page/`**
Root component for the route. Owns layout (header / tab-bar / side-panel / results-area). Orchestrates all mutations via injected services.

---

### UI components (`components/`)

| Component | Role |
|-----------|------|
| `music-library-header` | Top bar: title, search input (wired but global search not yet implemented), ref count badge |
| `music-tab-bar` | Horizontal tab strip; emits `tabSelect`, `tabAdd`, `tabClose` |
| `music-library-side-panel` | Left panel: library stats (avg quality, ref count, mastery avg) + genre/rating filters for the active tab |
| `music-reference-card` | Card view for one reference. Shows all versions as rows (label → duration → BPM → genre → rating dots). Inline add-version form. Avg quality badge. |
| `music-repertoire-table` | Table view for all references. Columns: Title / Artist / Version / Dur / BPM / Genre / MST / NRG / EFF / QLT / actions. Inline edit per version row. |
| `add-version-form` | Reusable form (card + table). Fields: name, duration (min), BPM, genre pills, 4× rating dot-pickers. |
| `add-entry-panel` | Command-palette overlay to add a song: search existing references or create a new one. |

---

### Rating levels

| Rating | Level | Color |
|--------|-------|-------|
| 1 | `low` | red `#fc8181` |
| 2 | `medium` | amber `#f6ad55` |
| 3 | `high` | green `#68d391` |
| 4 | `max` | blue `#63b3ed` |

---

## Layout & scroll

```
:host  (flex column, height 100%)
 └── <app-music-library-header>       fixed height
 └── .library  (flex: 1, flex column)
      └── <app-music-tab-bar>         fixed height
      └── .library-body  (flex: 1, flex row, overflow hidden)
           ├── <app-music-library-side-panel>   220px, own overflow-y: auto
           └── .results-area  (flex: 1, flex column)
                ├── .results-toolbar              fixed height
                └── .results-scroll  (flex: 1, min-height: 0, overflow-y: auto)
                     └── .cards-list  OR  <app-music-repertoire-table>
```

The scroll container is `.results-scroll` — a flex item in a flex column with `min-height: 0`. This is intentional: `overflow-y: auto` only creates a reliable scroll context when the element has a definite height from the main axis of a flex column (not from cross-axis stretch in a flex row).

---

## Mock data (`utils/mock-music-data.ts`)

10 references, 5 repertoire entries (for `user_me`), 9 versions across those entries. Provides realistic BPM, duration, genres and ratings for UI development.

---

## File tree

```
musicLibrary/
├── README.md
├── music-library-types.ts          ← all domain types + MusicGenre enum
├── music-library-page/
│   ├── music-library-page.component.ts
│   ├── music-library-page.component.html
│   └── music-library-page.component.scss
├── components/
│   ├── music-library-header/
│   ├── music-tab-bar/
│   ├── music-library-side-panel/
│   ├── music-reference-card/
│   ├── music-repertoire-table/
│   ├── add-version-form/
│   └── add-entry-panel/
├── services/
│   ├── music-library-state.service.ts
│   ├── music-reference.service.ts      ← HTTP (search + create, used by add-entry-panel)
│   ├── tests/
│   │   └── music-reference.service.spec.ts
│   ├── mutations-layer/
│   │   ├── BaseMusicItemCRUD.ts
│   │   ├── music-reference-mutation.service.ts
│   │   ├── music-repertoire-mutation.service.ts
│   │   ├── music-version-mutation.service.ts
│   │   └── music-tab-mutation.service.ts
│   └── selector-layer/
│       ├── music-library-selector.service.ts
│       ├── reference-selector.service.ts
│       ├── repertoire-selector.service.ts
│       ├── version-selector.service.ts
│       └── tab-selector.service.ts
└── utils/
    └── mock-music-data.ts
```

---

## What's not yet implemented

- **Global search** — the header search input is wired and emits, but `activeResults()` does not yet filter by text query. Planned: add a `searchQuery` signal to state and filter in `ReferenceSelectorService`.
- **Backend persistence** — all state is in-memory. `MusicReferenceService` (HTTP) exists for reference search/creation. The rest of the mutations need API calls wired in.
- **Duo detection** — `referencesWithMultipleEntries` (refs where ≥ 2 users share) is architecturally feasible via `RepertoireSelectorService` but not surfaced in UI yet.
- **Delete version / delete entry** — `removeVersion()` exists on the mutation service but no UI trigger yet.

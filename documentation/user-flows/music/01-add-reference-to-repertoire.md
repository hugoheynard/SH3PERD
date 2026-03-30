# Add Reference to Repertoire

## Overview

User adds a song (music reference) to their personal repertoire, either by selecting an existing reference or creating a new one.

## Entry Point

`MusicLibraryPage` > "Add to repertoire" button > opens `AddEntryPanel` via `LayoutService.setPopover()`

---

## Sequence Diagram

```
User                    AddEntryPanel              MusicReferenceApi         Backend (CQRS)           MongoDB
 │                           │                           │                       │                      │
 │  types in search bar      │                           │                       │                      │
 │ ─────────────────────────>│                           │                       │                      │
 │                           │  debounce 300ms           │                       │                      │
 │                           │  search(query)            │                       │                      │
 │                           │ ─────────────────────────>│                       │                      │
 │                           │                           │  GET /music/references/search?q=...          │
 │                           │                           │ ─────────────────────>│                      │
 │                           │                           │                       │  Atlas Search fuzzy   │
 │                           │                           │                       │ ────────────────────>│
 │                           │                           │                       │<────────────────────│
 │                           │                           │  TMusicReferenceDomainModel[]                │
 │                           │<─────────────────────────│                       │                      │
 │  sees results             │                           │                       │                      │
 │<─────────────────────────│                           │                       │                      │
 │                           │                           │                       │                      │
 ╔══════════════════════════╗
 ║ PATH A: Select existing  ║
 ╚══════════════════════════╝
 │  clicks "+ Add"           │                           │                       │                      │
 │ ─────────────────────────>│                           │                       │                      │
 │                           │  addEntry(ref.id)         │                       │                      │
 │                           │ ─────────────────────────────────────────────────>│                      │
 │                           │                           │  POST /music/repertoire                      │
 │                           │                           │       { musicReference_id }                   │
 │                           │                           │                       │  CreateRepertoireEntry│
 │                           │                           │                       │  Command              │
 │                           │                           │                       │ ────────────────────>│
 │                           │                           │                       │<────────────────────│
 │                           │  mutation.addEntry()      │                       │                      │
 │                           │  toast "Added"            │                       │                      │
 │                           │  close popover            │                       │                      │
 │<─────────────────────────│                           │                       │                      │
 │                           │                           │                       │                      │
 ╔══════════════════════════╗
 ║ PATH B: Create new       ║
 ╚══════════════════════════╝
 │  clicks "Create new ref"  │                           │                       │                      │
 │  fills title + artist     │                           │                       │                      │
 │  clicks "Create"          │                           │                       │                      │
 │ ─────────────────────────>│                           │                       │                      │
 │                           │  create({ title, artist })│                       │                      │
 │                           │ ─────────────────────────>│                       │                      │
 │                           │                           │  POST /music/references                      │
 │                           │                           │       { title, artist }│                      │
 │                           │                           │                       │  CreateMusicReference │
 │                           │                           │                       │  Command (dedup)     │
 │                           │                           │                       │ ────────────────────>│
 │                           │                           │                       │<────────────────────│
 │                           │  pendingRef = created     │                       │                      │
 │                           │                           │                       │                      │
 │  sees confirmation dialog │                           │                       │                      │
 │  "Add to repertoire?"     │                           │                       │                      │
 │<─────────────────────────│                           │                       │                      │
 │                           │                           │                       │                      │
 │  clicks "Add"             │                           │                       │                      │
 │ ─────────────────────────>│  confirmAdd()             │                       │                      │
 │                           │  ─── same as Path A ────>│                       │                      │
 │                           │                           │                       │                      │
 │  OR clicks "Not now"      │                           │                       │                      │
 │ ─────────────────────────>│  dismissPending()         │                       │                      │
 │                           │  toast "Reference created"│                       │                      │
 │                           │  reset form               │                       │                      │
 │<─────────────────────────│                           │                       │                      │
```

---

## Components

| Component | Role |
|-----------|------|
| `AddEntryPanelComponent` | Popover UI — search, create, confirm dialog |
| `PopoverFrameComponent` | Shared frame (backdrop, header, body, footer) |
| `MusicReferenceApiService` | Frontend HTTP — `search()`, `create()` |
| `MusicRepertoireApiService` | Frontend HTTP — `addEntry()` |
| `MusicLibraryMutationService` | Optimistic state update — `addEntry()` |
| `ToastService` | User feedback |

## Backend (CQRS)

| Handler | Type | Route | Logic |
|---------|------|-------|-------|
| `SearchMusicReferencesHandler` | Query | `GET /music/references/search?q=` | Atlas Search fuzzy on `title` + `artist` |
| `CreateMusicReferenceHandler` | Command | `POST /music/references` | Deduplicates (exact match on lowercase title+artist), creates via `MusicReferenceEntity` |
| `CreateRepertoireEntryHandler` | Command | `POST /music/repertoire` | Creates `RepertoireEntryEntity` linking user to reference |

## Types (shared-types)

| Type | Package | Usage |
|------|---------|-------|
| `TMusicReferenceDomainModel` | `@sh3pherd/shared-types` | Backend domain + API response |
| `TCreateMusicReferenceRequestDTO` | `@sh3pherd/shared-types` | POST body for create |
| `TCreateRepertoireEntryPayload` | `@sh3pherd/shared-types` | POST body for repertoire add |
| `TReferenceView` | `@sh3pherd/shared-types` | Frontend view model (no `owner_id`) |
| `LibraryEntry` (alias `TRepertoireEntryViewModel`) | frontend types | State shape: reference + versions |

## Business Rules

1. **Deduplication**: `CreateMusicReferenceHandler` normalizes title+artist to lowercase and checks for exact match before creating
2. **In-repertoire badge**: Panel shows "In repertoire" badge on references already in the user's library (computed from state)
3. **Confirmation dialog**: After creating a new reference, user is asked whether to add it to their repertoire (can dismiss with "Not now")
4. **Title/Artist capitalization**: Stored lowercase in DB, displayed with CSS `text-transform: capitalize`

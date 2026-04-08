# Music Reference — Full Stack Flow Documentation

## Overview

The Music Reference flow handles searching and creating canonical song references (title + artist).
References are shared across all users — they represent "a song exists", not "a user has this song".

**Key behaviors:**
- All data is stored **lowercase** in the database
- The frontend applies `text-transform: capitalize` for display
- Creating a reference that already exists returns the existing one (deduplication)
- Search uses MongoDB Atlas Search with fuzzy matching

---

## Shared Types (`@sh3pherd/shared-types`)

### `TMusicReferenceDomainModel`
The canonical domain model for a music reference.

| Field      | Type                | Description                          |
|------------|---------------------|--------------------------------------|
| `id`       | `TMusicReferenceId` | Branded ID (`musicRef_${string}`)    |
| `title`    | `string`            | Song title (stored lowercase)        |
| `artist`   | `string`            | Original artist (stored lowercase)   |
| `owner_id` | `TUserId`           | User who created this reference      |

### `TCreateMusicReferenceRequestDTO`
Payload for creating a new reference. Validated by `SCreateMusicReferencePayload` (Zod).

| Field    | Type     | Validation      |
|----------|----------|-----------------|
| `title`  | `string` | `min(1)`        |
| `artist` | `string` | `min(1)`        |

---

## Backend

### Route

```
Base: /api/protected/music/references
```

Mounted via `RouterModule.register` → `ProtectedModule` → `MusicModule` → `@Controller('references')`.

### Endpoints

#### `GET /dynamic-search?q=...`
Fuzzy search references by title or artist.

| Layer        | File                                | Role                                                |
|--------------|-------------------------------------|-----------------------------------------------------|
| Controller   | `music-reference.controller.ts`     | Extracts `q` query param, dispatches query           |
| Query        | `SearchMusicReferencesQuery.ts`     | Normalizes input (trim + lowercase), calls repo      |
| Repository   | `MusicReferenceRepository.ts`       | Runs Atlas `$search` with fuzzy (maxEdits: 2, limit 20) |

**Flow:**
```
GET ?q=bohem
  → Controller: new SearchMusicReferencesQuery("bohem")
    → Handler: normalize → "bohem"
    → refRepo.findByTextSearch("bohem")
      → Atlas $search fuzzy on [title, artist]
      → $limit 20, $project { _id: 0 }
    → return TMusicReferenceDomainModel[]
  → buildApiResponseDTO(code, data)
```

**Response:** `TApiResponse<TMusicReferenceDomainModel[]>`

---

#### `POST /`
Create a new music reference. Idempotent — returns existing if exact match found.

| Layer        | File                                  | Role                                              |
|--------------|---------------------------------------|----------------------------------------------------|
| Controller   | `music-reference.controller.ts`       | Zod-validates `payload`, extracts `actorId` from JWT |
| Command      | `CreateMusicReferenceCommand.ts`      | Deduplicates, creates entity, persists              |
| Entity       | `MusicReferenceEntity.ts`             | Normalizes title/artist to lowercase in constructor  |
| Repository   | `MusicReferenceRepository.ts`         | `findByExactTitleAndArtist` + `save`                |

**Flow:**
```
POST { payload: { title: "Bohemian Rhapsody", artist: "Queen" } }
  → Controller: Zod validates payload, extracts actorId from JWT
    → new CreateMusicReferenceCommand(actorId, payload)
      → Handler:
        1. Normalize: "bohemian rhapsody", "queen"
        2. refRepo.findByExactTitleAndArtist("bohemian rhapsody", "queen")
           → found? → return existing (deduplication, no new record)
           → not found? →
        3. new MusicReferenceEntity({ title, artist, owner_id })
           → Entity constructor: trim + lowercase
           → Generates branded ID: musicRef_<uuid>
        4. refRepo.save(entity.toDomain)
        5. return entity.toDomain
  → buildApiResponseDTO(code, data)
```

**Response:** `TApiResponse<TMusicReferenceDomainModel>`

---

### Entity: `MusicReferenceEntity`

Extends `Entity<TMusicReferenceDomainModel>`. ID prefix: `musicRef`.

**Constructor behavior:**
- `title` and `artist` are trimmed and lowercased before storage
- ID is auto-generated if not provided

**Methods:**
| Method                       | Description                              |
|------------------------------|------------------------------------------|
| `get title`                  | Current title                            |
| `get artist`                 | Current artist                           |
| `get owner_id`               | Creator user ID                          |
| `isOwnedBy(userId)`          | Ownership check                          |
| `rename(title, artist)`      | Mutates title/artist (trim + lowercase)  |
| `toDomain`                   | Snapshot as `TMusicReferenceDomainModel`  |
| `getDiffProps()`             | MongoDB dot-notation diff from original  |

---

### Repository: `IMusicReferenceRepository`

| Method                                  | Description                                  |
|-----------------------------------------|----------------------------------------------|
| `save(document)`                        | Insert one document                          |
| `findAll()`                             | All references                               |
| `findByIds(ids)`                        | Batch lookup by branded IDs                  |
| `findByExactTitleAndArtist(title, artist)` | Exact match lookup (for deduplication)     |
| `findByTextSearch(searchValue)`         | Atlas Search fuzzy (index: `default`)        |

**Atlas Search index requirement:**
The MongoDB collection `music_references` must have an Atlas Search index named `default`
with paths `['title', 'artist']` for `findByTextSearch` to work.

---

## Frontend

### API Service: `MusicReferenceApiService`

Extends `BaseHttpService`. Base URL: `/api/protected/music/references`.

| Method              | HTTP          | Description                                  |
|---------------------|---------------|----------------------------------------------|
| `search(query)`     | `GET`         | Debounced fuzzy search, returns array         |
| `create(payload)`   | `POST`        | Creates reference, toast on error             |

**`search`** unwraps `TApiResponse.data` and returns `[]` on error (no throw).
**`create`** unwraps `TApiResponse.data` and throws on error (caller handles).

---

### Component: `AddEntryPanelComponent`

Popover panel for searching existing references and creating new ones.
Opened via `LayoutService.setPopover(AddEntryPanelComponent)`.

#### UI States

| Signal            | Type                             | Description                           |
|-------------------|----------------------------------|---------------------------------------|
| `query`           | `string`                         | Search input value                    |
| `newTitle`        | `string`                         | Title field in create form            |
| `newArtist`       | `string`                         | Artist field in create form           |
| `showNewForm`     | `boolean`                        | Toggle create form visibility         |
| `saving`          | `boolean`                        | Blocks interactions during API call   |
| `searching`       | `boolean`                        | Shows spinner during search           |
| `error`           | `string`                         | Error message displayed inline        |
| `searchResults`   | `TMusicReferenceDomainModel[]`   | Results from backend search           |
| `inRepertoire`    | `Set<TMusicReferenceId>`         | IDs already in user's repertoire      |

#### Search Flow

```
User types → onQueryChange() → Subject.next()
  → debounce 300ms → distinctUntilChanged
  → refApi.search(q) (min 2 chars)
  → searchResults.set(results)
```

#### Select Existing Reference Flow

```
User clicks result → selectRef(ref)
  → repertoireApi.addEntry(ref.id)     // stubbed for now
  → mutation.addEntry(ref)             // optimistic state update
  → toast "Added to repertoire"
  → close popover
```

#### Create New Reference Flow

```
User fills title + artist → submitNew()
  → refApi.create({ title, artist })
    → (backend deduplicates)
  → repertoireApi.addEntry(created.id)
  → mutation.addEntry(created)
  → toast "added to repertoire"
  → close popover
```

#### Display

- Title and artist from the API are **lowercase** in the database
- The template applies CSS `text-transform: capitalize` for user-facing display
- "Create new reference" button is always visible (not conditioned on search results)
- Title and artist fields in the create form are independent (not prefilled from search)

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND                                                   │
│                                                             │
│  AddEntryPanelComponent                                     │
│    │                                                        │
│    ├─ search input → debounce 300ms                         │
│    │   └─ MusicReferenceApiService.search(q)                │
│    │       └─ GET /api/protected/music/references/          │
│    │              dynamic-search?q=...                       │
│    │                                                        │
│    ├─ select existing → MusicRepertoireApiService (stub)    │
│    │   └─ mutation.addEntry(ref)                            │
│    │                                                        │
│    └─ create new → MusicReferenceApiService.create()        │
│        └─ POST /api/protected/music/references              │
│            └─ then repertoireApi.addEntry()                  │
│                └─ mutation.addEntry(created)                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND                                                    │
│                                                             │
│  MusicReferenceController (@Controller('references'))       │
│    │                                                        │
│    ├─ GET /dynamic-search                                   │
│    │   └─ SearchMusicReferencesQuery                        │
│    │       └─ Handler: normalize → repo.findByTextSearch    │
│    │           └─ Atlas $search fuzzy                        │
│    │                                                        │
│    └─ POST /                                                │
│        └─ CreateMusicReferenceCommand                       │
│            └─ Handler:                                      │
│                ├─ repo.findByExactTitleAndArtist (dedup)    │
│                ├─ new MusicReferenceEntity (lowercase)      │
│                └─ repo.save                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  DATABASE (MongoDB)                                         │
│                                                             │
│  Collection: music_references                               │
│  Index: Atlas Search 'default' on [title, artist]           │
│                                                             │
│  Document shape:                                            │
│  {                                                          │
│    id:       "musicRef_<uuid>",                             │
│    title:    "bohemian rhapsody",                            │
│    artist:   "queen",                                       │
│    owner_id: "user_<uuid>"                                  │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

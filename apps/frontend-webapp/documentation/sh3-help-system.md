# SH3PHERD Frontend — Contextual Help System

How pages declare their context-specific help entries and how the global help right panel surfaces them.

---

## Why

Each page has its own vocabulary (Mastery, Energy, LUFS, OrgChart layers, Quotas, …). Rather than maintaining a static doc that drifts from the UI, we let pages **declare their help inline** — close to the feature that uses it — and a generic right panel reads them.

Result: when the user clicks the help button (header, top-right), they see help entries scoped to the page they're currently on, with zero routing logic and zero stale documentation.

---

## Architecture

```
┌───────────────────────────────────────────────────────┐
│ Page mounted                                          │
│                                                       │
│   <app-music-library-help />   ← per-page registrar   │
│     │                                                 │
│     ├ <ng-container sh3Info="…" sh3InfoLabel="…" …/>  │
│     ├ <ng-container sh3Info="…" sh3InfoLabel="…" …/>  │
│     └ … (one per concept this page introduces)        │
│       │                                               │
│       │ ngOnInit: registry.register(entry)            │
│       ▼                                               │
│   ┌─────────────────────────────────┐                 │
│   │ HelpRegistryService             │                 │
│   │   _entries: signal<Entry[]>     │                 │
│   └─────────────────────────────────┘                 │
└───────────────────────────────────────────────────────┘
              ▲                       │
              │ register/unregister   │ entries() (signal)
              │                       ▼
┌───────────────────────────────────────────────────────┐
│ Header help button → setRightPanel(HelpPanelComponent)│
│                                                       │
│   <app-help-panel>                                    │
│     @for (entry of registry.entries(); …) {           │
│       <div class="help-entry">                        │
│         <span>{{ entry.label }}</span>                │
│         <p>{{ entry.description }}</p>                │
│       </div>                                          │
│     }                                                 │
│   </app-help-panel>                                   │
└───────────────────────────────────────────────────────┘
```

When the page unmounts, each `[sh3Info]` directive's `ngOnDestroy` removes its entry from the registry, so navigating to another page automatically swaps the visible help.

---

## Pieces

### `HelpRegistryService` — the store

[apps/frontend-webapp/src/app/shared/help/help-registry.service.ts](apps/frontend-webapp/src/app/shared/help/help-registry.service.ts)

Tiny `@Injectable({ providedIn: 'root' })` holding a signal of entries. Three methods:
- `register(entry)` — push (skips if id already present)
- `unregister(id)` — remove
- `byGroup(group)` — read-only filter

The signal is exposed as `entries`. Consumers (panel) read it reactively.

### `[sh3Info]` directive — the declaration

[apps/frontend-webapp/src/app/shared/help/info.directive.ts](apps/frontend-webapp/src/app/shared/help/info.directive.ts)

Standalone attribute directive with 4 inputs:

| Input | Type | Required | Purpose |
|-------|------|----------|---------|
| `sh3Info` | `string` | yes | Unique entry id (kebab-case, scoped to the page is fine) |
| `sh3InfoLabel` | `string` | yes | Short title shown in the panel |
| `sh3InfoDesc` | `string` | yes | Plain-text explanation |
| `sh3InfoGroup` | `string` | no | Optional grouping key (e.g. `'music-library'`) |

Lifecycle: `ngOnInit` registers, `ngOnDestroy` unregisters. No DOM rendered.

### `HelpPanelComponent` — the viewer

[apps/frontend-webapp/src/app/shared/help/help-panel.component.ts](apps/frontend-webapp/src/app/shared/help/help-panel.component.ts)

Loaded by the global header help button (`HeaderComponent.openHelp()`):

```ts
this.layout.setRightPanel(HelpPanelComponent);
```

It reads `helpRegistry.entries()` and renders one block per entry. Empty state when nothing is registered. Generic — no per-page customisation.

---

## How to add help to a page

### Pattern: per-page **help component**

The convention is to ship one **dedicated help component** per page that owns context-specific concepts. It's a tiny standalone component whose only job is to host the `[sh3Info]` declarations.

Reference implementation: [music-library-help.component.ts](apps/frontend-webapp/src/app/features/musicLibrary/music-library-page/music-library-help.component.ts).

#### Step 1 — Create the help component

Place it next to the page it documents (`features/<page>/<page>-help.component.ts`):

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InfoDirective } from '../../../shared/help/info.directive';

/**
 * Hidden component that registers the <PAGE> page's help entries.
 * Renders no visible DOM — only declares help entries via [sh3Info].
 */
@Component({
  selector: 'app-music-library-help',
  standalone: true,
  imports: [InfoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container
      sh3Info="mastery-rating"
      sh3InfoLabel="Mastery (MST)"
      sh3InfoGroup="music-library"
      sh3InfoDesc="How well you know the piece — 1 (learning) to 4 (performance-ready)."
    />
    <!-- … one ng-container per concept … -->
  `,
})
export class MusicLibraryHelpComponent {}
```

#### Step 2 — Mount it in the page

Drop the tag once anywhere in the page template, and add the component to the page's `imports` array:

```html
<!-- music-library-page.component.html -->
<app-music-library-help />

<div class="library">
  …
</div>
```

```ts
imports: [
  // …
  MusicLibraryHelpComponent,
],
```

That's it. Entries register on mount, unregister on unmount, the header help button picks them up automatically.

### Why a component (not directly in the page template)?

The page template should describe **layout**. Help entries are **metadata**. Putting 6 `<ng-container>` blocks at the top of `music-library-page.component.html` made the file harder to scan — the relevant DOM started 30 lines down.

A dedicated component:
- Keeps the page template focused on its layout
- Co-locates help text with the feature that owns it (same folder)
- Is trivially testable (just check it renders, the directive does the work)
- Makes git diffs of help wording self-contained

### Why not reach for a service / config object?

We tried mentally:
- A service-registered registry per route → adds an init pass per page, separates the help from where it belongs
- A static config map keyed by route → drifts silently when the UI changes, no compile-time link to the feature

The directive-in-template pattern keeps the help **next to the thing it explains** and tied to the page's lifecycle. Less moving parts.

---

## Conventions

- **Entry id naming**: kebab-case, descriptive, unique within the page. Prefix is optional; `sh3InfoGroup` is for filtering.
- **Label**: short, what the user sees in the UI (e.g. `Mastery (MST)`, `Favorite track ★`). Match the visual label exactly.
- **Description**: 1–2 sentences, plain text. No Markdown today (the panel renders text-only).
- **Group**: use the page/feature key (`music-library`, `orgchart`, …) when entries from multiple components might land in the same panel.

### Anti-patterns

- ❌ **Putting `[sh3Info]` directly in interactive elements** (`<button sh3Info="…">`). It works, but the help becomes invisible the moment that button conditionally renders. Prefer the dedicated help component so all entries are present whenever the page is mounted.
- ❌ **Inline `[sh3Info]` blocks at the top of the page template**. That was the historical pattern, and the reason this doc + extraction exists.
- ❌ **Duplicating ids across pages**. The registry deduplicates by id, but you'll lose the second one's content silently. Scope ids to the page that owns the concept.

---

## Pages currently registered

| Page | Help component | Entries |
|------|---------------|---------|
| Music library | [music-library-help.component.ts](../src/app/features/musicLibrary/music-library-page/music-library-help.component.ts) | 6 — Mastery, Energy, Effort, Quality, Favorite track, Tracks & upload |

When you add help to a new page, append a row.

---

## File map

| File | Role |
|------|------|
| `shared/help/help-registry.service.ts` | Signal-based store of `HelpEntry[]` |
| `shared/help/info.directive.ts` | `[sh3Info]` directive — registers on init, unregisters on destroy |
| `shared/help/help-panel.component.ts` | Right-panel UI that renders the registry |
| `core/components/header/header.component.ts` | Owns the global help button (`openHelp()` → `setRightPanel(HelpPanelComponent)`) |
| `features/<page>/<page>-help.component.ts` | Per-page registrar (recommended pattern) |

# Configurable Tab Bar — Component-local TODO

Deferred work that lives at the component level. Kept here (next to the code)
so it's visible to anyone touching this folder. For higher-level feature
tracking, see [`documentation/todos/TODO-configurable-tab-bar.md`](../../../../../../documentation/todos/TODO-configurable-tab-bar.md).

---

## Next up

### Replace raw `<button>` with `sh3-button` / `sh3-button-icon`
Before any other work on this component, sweep the four templates and
swap every raw `<button>` for the design-system primitive:

- **`sh3-button-icon`** (`shared/button-icon/button-icon.component.ts`) — for
  icon-only buttons. Supports `icon`, `shape: 'square' | 'round'`,
  `size: 'xs' | 'sm' | 'md' | 'lg'`, `tone: 'ghost' | 'accent' | 'critical'`,
  two-way `[(active)]`, and a built-in `tooltip`.
- **`sh3-button`** (`shared/button/button.component.ts`) — for buttons with
  a text label. Variants `primary | recommended | critical | ghost | solid`,
  sizes `sm | md | lg`.

18 raw `<button>` still to migrate across the four templates:

- [ ] [`configurable-tab-bar.component.html`](./configurable-tab-bar.component.html) — 3 buttons
  (add-tab, add-tab-locked, upgrade CTA)
- [ ] [`tab-strip/tab-strip.component.html`](./tab-strip/tab-strip.component.html) — 1 button
  (⋮ menu toggle)
- [ ] [`tab-inline-menu/tab-inline-menu.component.html`](./tab-inline-menu/tab-inline-menu.component.html) — 4 buttons
  (color, move-to toggle, move-to target × N, close)
- [ ] [`tab-config-panel/tab-config-panel.component.html`](./tab-config-panel/tab-config-panel.component.html) — 10 buttons
  (save / new, load, config expand, config rename, config delete, tab rename,
  tab move, tab remove, move-target)

When migrating, preserve the existing behavior exactly:
- Keep the `(click)` / `(pointerup)` handlers — `sh3-button-icon` and
  `sh3-button` expose `(clicked)`; re-wire accordingly, and drop
  `$event.stopPropagation()` calls only where we confirm the primitive
  already stops bubbling.
- Keep the tooltip strings (today in raw `title="…"` attributes) — feed
  them via `[tooltip]` on `sh3-button-icon`.
- Keep the critical/danger affordance (today `.config-action-btn--danger`,
  `.tab-inline-btn--danger`) — use `tone="critical"` on the icon button
  or `variant="critical"` on the text button.
- The ⋮ toggle, expand chevron and emoji-based affordances (●, ⇥, ×, ✎,
  ▾/▸) should move to real icon names from the registry
  (`shared/icon/icon.registry.ts`). When the icon does not exist yet,
  stage the migration by adding it to the registry in the same commit.

**Unblocks:** consistent theming / dark-mode / focus-ring across the tab
bar, and removes most of the hand-rolled button SCSS from the four
component stylesheets.

---

## Deferred

### DnD reorder always drops at end — set aside
`TabStripComponent.onTabDrop()` emits `tabReorder` with `newIndex: tabs.length - 1`
regardless of where the tab was actually dropped, so every drag lands the tab
at the right edge of the strip.

- **Where:** [`tab-strip/tab-strip.component.ts`](./tab-strip/tab-strip.component.ts) → `onTabDrop()`
- **Why it stayed like that:** the underlying `dnd-drop-zone.directive.ts`
  only emits zone-level drops (no index within the zone). Fixing this
  requires computing the target index from the pointer coordinates relative
  to the sibling tab elements, and routing it through a new zone event or
  through `onTabDropAtIndex()` (already defined but unused).
- **Unblocks:** the "DnD reorder moves to correct position" item in the
  central checklist.

---

## Backlog

### Tighten `dispatch` typing — remove `as any`
The parent's `dispatch()` still has two unavoidable casts because the method
doubles as a handler invoker and an output emitter:

```ts
if (handlers) (handlers[key] as (p: unknown) => void)(payload);
(this[key] as { emit: (p: unknown) => void }).emit(payload);
```

Split the handler call and the output emission, or generate the event map
via a typed mapped type, so the casts drop out at compile time.

### Replace `_handlers` mutable workaround
`_handlers` is a mutable field set via `inject(TAB_HANDLERS, { optional: true })`
to sidestep Angular's signal-input timing quirks. Investigate whether a
directive-based injection or an `afterRender` hook would give us a stable
pattern without the mutable slot.

### Unit tests for `TabMutationService`
~20 public mutations with zero specs. Priority tests:
- `addDefaultTab`, `closeTab`, `reorderTab`
- `saveTabConfig`, `applyTabConfig`, `newConfig`
- `moveActiveTabToConfig`, `moveTabToConfig` (duplication-sensitive)
- Auto-sync: mutating tabs while `activeConfigId` is set updates the saved config

# Configurable Tab Bar — Component-local TODO

Deferred work that lives at the component level. Kept here (next to the code)
so it's visible to anyone touching this folder. For higher-level feature
tracking, see [`documentation/todos/TODO-configurable-tab-bar.md`](../../../../../../documentation/todos/TODO-configurable-tab-bar.md).

---

## Done — button migration

All 18 raw `<button>` elements across the four templates have been swapped
for `sh3-button-icon` (icon-only affordances) or `sh3-button` (text buttons,
e.g. move-to targets and the upgrade CTA).

- [x] [`configurable-tab-bar.component.html`](./configurable-tab-bar.component.html) — 3 buttons migrated
  (add-tab, add-tab-locked → `sh3-button-icon`; upgrade CTA → `sh3-button`)
- [x] [`tab-strip/tab-strip.component.html`](./tab-strip/tab-strip.component.html) — 1 button migrated
  (⋮ menu toggle → `sh3-button-icon` using the new `more-vertical` icon)
- [x] [`tab-inline-menu/tab-inline-menu.component.html`](./tab-inline-menu/tab-inline-menu.component.html) — 4 buttons migrated
  (color → `palette` icon, move-to toggle → `arrow-right`, move targets → `sh3-button`, close → `sh3-button-icon tone="critical"`)
- [x] [`tab-config-panel/tab-config-panel.component.html`](./tab-config-panel/tab-config-panel.component.html) — 10 buttons migrated
  (save/new, load, expand chevron, rename → `edit`, delete → `bin tone="critical"`, remove → `close tone="critical"`, move → `arrow-right`, move targets → `sh3-button`)

Two new icons shipped alongside: `more-vertical` (⋮) and `palette` (●).
Most of the hand-rolled button SCSS (`.tab-add`, `.tab-action-btn`,
`.config-action-btn`, `.tab-inline-btn`, `.tab-move-option`,
`.config-move-target`, `.tab-menu-toggle`, `.config-item-expand`,
`.upgrade-popover__btn`) was deleted — only the structural wrappers,
panels, and list styles remain.

**Known visual drift:** the `.tab-add` bordered look is replaced by the
design system's `ghost` tone (no border, transparent background). The
focus ring, dark-mode tokens and hover accent now come uniformly from
`sh3-button-icon` instead of being declared per component.

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

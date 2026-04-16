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

## Known bugs (open)

### Pro plan: add-tab and per-config gates don't fire in practice
**Symptom.** On `artist_pro`, tabs can be added without limit and the
per-config lock glyph never appears on move-to rows. On `artist_free`
the locks work as expected (both add-tab lock at 3 and the save/recall
panel collapse).

**Not yet investigated.** Candidate causes to check before any fix:

1. **Plan signal not actually resolving to `artist_pro`.**
   `UserContextService._plan` starts at `null` and is set from
   `GET /quota/me`. If the response shape doesn't match
   `{ data: { plan: TPlatformRole } }`, or the field is missing, the
   signal may stay `null` (treated as `artist_free` → locks at 3) or
   accidentally receive a string that isn't in the `TPlatformRole` union,
   in which case
   [`maxTabsForPlan`](./../../features/musicLibrary/services/music-tab-quota-checker.service.ts)
   falls through to `-1` (unlimited) and nothing locks.
   → **First thing to check:** log `userCtx.plan()` on the page while
   repro'ing on Pro, compare against the `/quota/me` response body.

2. **Signal tracking through `tabState()`.**
   The checker reads `this.state.tabState().tabs.length`, where
   `tabState` is an `Object.assign(fn, { update })` rather than a plain
   signal. The function body calls `this.state()` which IS a signal,
   so reads should be tracked, but this is the non-standard shape worth
   double-checking with Angular's signal graph.
   → Verify `canAddTab()` re-runs when tabs are added (`effect()` with
   a log around the checker call).

3. **No quota on the number of saved configs.**
   `MusicTabQuotaChecker` only tracks tabs-per-strip and tabs-per-config.
   A user on Pro can create unlimited saved configs (each capped at 10
   tabs). If the product intent is "N configs per plan", that's a new
   quota to add — not a regression in the current pattern.

**Out of scope until investigated:** do not attempt a fix that touches
the tab bar until step 1 + 2 are ruled in or out. The checker pattern
and the `.locked` data flow are both working correctly on Free, so the
bug is almost certainly in the plan-resolution layer or in a signal
tracking subtlety, not in the tab bar.

**Host-side wiring to inspect first:**
- `apps/frontend-webapp/src/app/features/musicLibrary/services/music-tab-quota-checker.service.ts`
- `apps/frontend-webapp/src/app/core/services/user-context.service.ts` (loadPlan / `_plan`)
- `apps/frontend-webapp/src/app/features/musicLibrary/services/mutations-layer/music-tab-mutation.service.ts` (service-level overrides — silent no-ops on refuse, add a warn log temporarily to confirm the gate is reached)

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

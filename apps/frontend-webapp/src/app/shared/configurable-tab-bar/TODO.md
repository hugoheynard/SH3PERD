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

## Audit (honest review — 7.75/10 overall after the April 2026 polish pass)

Full breakdown kept for reference:

| Dimension          | Before | Now | Delta drivers                                                                                 |
| ------------------ | ------ | --- | --------------------------------------------------------------------------------------------- |
| Architecture / SoC | 8      | 8.5 | ToastService coupling removed — bar is now truly agnostic (tabs, configs, locks, feedback)    |
| API design         | 7.5    | 8.5 | `tabAdd` routed through `dispatch()`; `TabHandlers` derived type; no `showToasts` kill-switch |
| Code quality       | 6.5    | 7   | OnPush + signal rename buffers; zero runtime casts in `dispatch()`                            |
| Documentation      | 9      | 9   | unchanged                                                                                     |
| Robustness         | 5      | 5   | DnD fix still pending, CDK Overlay still pending                                              |
| Reusability        | 6      | 7.5 | every hardcoded label configurable; no `ToastService` injection to satisfy in tests / hosts   |
| Evolution          | 7.5    | 8   | OnPush ready; trackBy already enforced by Angular 21 `@for`                                   |

What still gates **8+ → 9+** lives in § Backlog.
The remaining lifts toward 8.5+ are the Robustness items (DnD,
CDK Overlay) and second-consumer validation.

---

## Priority (get to 8+)

### 1. Unit tests for `TabMutationService` — ✅ done

48 specs in [`tab-mutation.service.spec.ts`](./tab-mutation.service.spec.ts)
cover every public mutation + the auto-sync post-processor + the
`onChanged` callback contract. Includes edge cases:

- `closeTab` — active tab closed (picks neighbour), last tab closed (no-op)
- `moveTabToConfig` — source-empties (no-op), activeTabId adjustment
- `moveActiveTabToConfig` — strip-empties triggers default tab +
  clears `activeConfigId`, mirror-removal into the active saved config
  when `target !== activeConfigId`, and the subtle
  `target === activeConfigId` case where `syncActiveConfig` ends up
  overwriting the explicit add
- Auto-sync — mirrors title rename / add into the active config but
  not into siblings, and no-op when `activeConfigId` is null
- `onChanged` — fires once per mutation, including no-op paths

Along the way: fixed a pre-existing broken jest runner (config was an
ESM file named `.cjs`, deprecated `jest-preset-angular/setup-jest`
import, missing `node:crypto` polyfill for jsdom). See the
"jest runner repair" commit for the diff.

### 1.b. Public event API tightened — ✅ done

The bar no longer leaks `SavedTabConfig<unknown>` / `TabItem<unknown>` through
its public UI outputs.

What changed:

- `configLoad` now emits `configId: string` instead of a full
  `SavedTabConfig<unknown>`
- `tabMoveToConfig` and the locked variant now emit
  `{ tabId, targetConfigId }` instead of `{ tab, targetConfigId }`
- `TabMutationService` gained `loadTabConfig(configId)` so the handler layer
  can restore a saved config from state without passing the whole config object
- `dispatch()` now uses an explicit `TabBarDispatchPayloads` event map rather
  than indexing into a pseudo-generic `TabHandlers<unknown>`

Why:

- stops `SavedTabConfig<unknown>` from bleeding into the consumer API
- keeps the design-system surface focused on UI identifiers / intent, not
  domain objects
- preserves strong typing on the mutation/state layer where the generic
  actually matters

Current boundary:

- **Still generic / strongly typed:** `TabItem<TConfig>`,
  `SavedTabConfig<TConfig>`, `TabSystemState<TConfig>`,
  `TabMutationService<TConfig>`
- **Intentionally non-generic:** the public event payloads of the bar
  (`configLoad`, `tabMoveToConfig`, etc.)

Remaining caveat:

Angular standalone components still make a truly generic public component API
awkward. The internal inputs remain bound as `TabItem<unknown>[]` /
`SavedTabConfig<unknown>[]` at the component boundary, but the worst leak —
generic domain objects escaping through outputs — has been removed.

### 2. Fix the DnD drop-at-end bug

`TabStripComponent.onTabDrop()` emits `tabReorder` with `newIndex: tabs.length - 1`
regardless of drop position. The underlying `dnd-drop-zone.directive.ts`
only emits zone-level drops — fixing this requires computing the target
index from pointer coordinates relative to sibling tab elements, either
via a new zone event or by using the already-defined
`onTabDropAtIndex()` hook.

- **Where:** [`tab-strip/tab-strip.component.ts`](./tab-strip/tab-strip.component.ts) → `onTabDrop()`

### 3. Migrate dropdowns to `@angular/cdk/overlay`

The inline-menu move-to dropdown and the config-panel move submenu
currently use `position: fixed` with a manually computed top/left taken
from `getBoundingClientRect()` at open time. They don't track scroll,
resize or focus changes, and they rely on a fragile `#moveBtn` template
ref on a wrapper span.

CDK Overlay's `ConnectedPositionStrategy` + `FlexibleConnectedPositionStrategy`
would solve three problems at once: proper anchored positioning, automatic
scroll/resize tracking, and first-class click-outside / escape handling.

Files:

- [`tab-inline-menu/tab-inline-menu.component.{ts,html}`](./tab-inline-menu)
- [`tab-config-panel/tab-config-panel.component.{ts,html}`](./tab-config-panel)

---

## Done — OnPush + i18n + dispatch polish (April 2026)

### OnPush change detection — ✅ done

All four components (`ConfigurableTabBarComponent`, `TabStripComponent`,
`TabInlineMenuComponent`, `TabConfigPanelComponent`) now declare
`changeDetection: ChangeDetectionStrategy.OnPush`. Because `[(ngModel)]`
on a plain field doesn't round-trip through signal reads, the three
rename buffers (`editTitle`, `editConfigName`, `editConfigTabTitle`)
were converted to `signal('')` and the templates switched to
`[ngModel]="…()" (ngModelChange)="….set($event)"`.

### i18n-ready labels — ✅ done

Every hardcoded English string on the bar is now an `input<string>()`
with the literal as its default — 20 surfaces in total (tooltips, the
save form placeholder / button, the empty-state label, the two move-to
headings, and four toasts). Labels are declared once on the
orchestrator and forwarded through the sub-components. Toast templates
that interpolate the config name use a `{name}` placeholder
substituted at runtime (`'Config "{name}" saved'`). Zero breaking
change — defaults reproduce the previous copy verbatim.

### `tabAdd` asymmetry — ✅ done

`tabAdd: void` was added to `TabBarDispatchPayloads` and the special-
case `onTabAdd()` method was removed. The `+` button now calls
`dispatch('tabAdd', undefined)` like every other mutation, so the
TAB_HANDLERS path and the `(tabAdd)` output are wired through the same
pipeline.

### `_handlers` mutable workaround — ✅ done

The field is set once via `inject(TAB_HANDLERS, { optional: true })` and
never reassigned. It was simply marked `readonly` — the "mutable slot
to sidestep signal-input timing" concern was already not a real
concern.

### `dispatch()` runtime casts — ✅ done

`TabHandlers` is now a mapped type derived from `TabBarDispatchPayloads`
(both moved to `tab-event.helpers.ts` as the single source of truth).
The dynamic `this[key] as { emit: … }` cast was replaced by an
explicit `_emit: TabHandlers` map whose values just forward to the
matching `OutputEmitterRef.emit()`. `dispatch()` is now two typed
lookups:

```ts
this._handlers?.[key](payload);
this._emit[key](payload);
```

### ToastService coupling — ✅ done

The config panel no longer injects `ToastService` and the four
`*Toast` inputs + `showToasts` flag are gone. The bar emits
`configSave` / `configLoad` / `configDelete` / `configNew` like it
always did; hosts that want user-visible feedback listen to those
outputs and toast (or log, or nothing) from there. On/off is implicit:
no binding = no feedback.

`onLoadConfig` lost its `configName` parameter — it was only used for
the deleted toast copy; hosts that want the name in their toast
resolve it from the `savedConfigs` they already pass in.

---

## Deferred / backlog (8.5 → 9+)

### Validate reusability with a second consumer

The bar's API claims to be generic but only one consumer
(`music-library-page`) has ever exercised it. Wiring a second use case —
e.g. a settings-tabs scenario, or a contracts view with saved filters —
would surface hidden assumptions (TConfig generic leaking through,
implicit music-library-specific behaviour in the mutation service) and
stress-test the three-resource lock contract.

### Fix the `tabAdd` asymmetry

`tabAdd` still flows through `TAB_HANDLERS` (legacy from the initial
split) while `saveTabConfig` is gated directly on the mutation service
via an override. Three different paths for mutations of the same shape
is confusing — either route everything through the handler map, or route
nothing through it.

### Custom color picker

The hidden `<input type="color">` gives the user the browser-native
picker, which is visually inconsistent with the rest of the design system.
Swap for a small palette popover (reuses `ui-popover-frame`).

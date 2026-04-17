# Configurable Tab Bar — TODO

> **Component-level details, architecture walkthrough and lock contract
> live next to the code:**
>
> - [`apps/frontend-webapp/src/app/shared/configurable-tab-bar/README.md`](../../apps/frontend-webapp/src/app/shared/configurable-tab-bar/README.md) — full component documentation with flow diagrams
> - [`apps/frontend-webapp/src/app/shared/configurable-tab-bar/TODO.md`](../../apps/frontend-webapp/src/app/shared/configurable-tab-bar/TODO.md) — deferred items and backlog

## Status

### Shipped

- [x] Component split into sub-components (strip + inline-menu + config-panel)
- [x] Raw `<button>` migrated to `sh3-button` / `sh3-button-icon` across all four templates
- [x] **Agnostic API** — the bar is stateless wrt plans / quotas; the host passes `tabs`, `savedConfigs`, and three lock flags (`tabLocked`, `configLocked`, `cfg.locked`)
- [x] **Lock contract per resource type** — `tabLocked` (tab quota), `configLocked` (config-count quota), `SavedTabConfig.locked` (per-config tab quota)
- [x] **Plan-aware popovers** — `TabLimitPopoverComponent` for tab quota, `SaveRecallLockedPopoverComponent` with plan-branching copy (Free vs Pro-at-cap) for config quota, same for move-to-full-config
- [x] **`MusicTabQuotaChecker`** — single source of truth for all `canAddTab` / `canAddConfig` / `canMoveToConfig` answers, read by both the UI and the service gates
- [x] **Defense-in-depth service gates** — `MusicTabMutationService` overrides `addDefaultTab` / `saveTabConfig` / `moveActiveTabToConfig` / `moveTabToConfig` with quota no-ops (null-plan fallback prevents race bypass during `/quota/me` loading)
- [x] **Public event API no longer leaks `SavedTabConfig<unknown>`** — `configLoad` now emits `configId`, move events emit `{ tabId, targetConfigId }`, and the mutation layer resolves the generic object from state internally

### Backlog

- [x] **Unit tests on `TabMutationService`** — 48 specs in [`tab-mutation.service.spec.ts`](../../apps/frontend-webapp/src/app/shared/configurable-tab-bar/tab-mutation.service.spec.ts) cover every public mutation, the auto-sync post-processor, `onChanged` contract, and every `moveActiveTabToConfig` edge case (strip-empties, target !== active, target === active subtle interaction). Jest runner repaired along the way.
- [x] **OnPush change detection** — all four components now use `ChangeDetectionStrategy.OnPush`; the three `[(ngModel)]` rename buffers migrated to signals.
- [x] **i18n-ready labels** — every hardcoded English string exposed as an `input<string>()` with a default that reproduces the previous copy (20 surfaces, 4 toasts with `{name}` interpolation).
- [x] **`tabAdd` asymmetry removed** — the `+` button now goes through `dispatch('tabAdd', undefined)` like every other mutation. The special-case `onTabAdd()` method is gone.
- [x] **`_handlers` mutable workaround** — the field was never reassigned; marked `readonly`.
- [x] **`dispatch()` runtime casts eliminated** — `TabHandlers` is now a mapped type derived from `TabBarDispatchPayloads` (both live in `tab-event.helpers.ts`), and `dispatch()` uses an explicit `_emit: TabHandlers` map to wrap each `OutputEmitterRef.emit()`. Zero casts left.
- [x] **ToastService coupling removed** — the bar no longer injects a toast system or exposes `showToasts` / `*Toast` inputs. Hosts listen to the existing mutation outputs (`configSave` / `configLoad` / `configDelete` / `configNew`) and provide their own feedback. `music-library-page` picks up its four toasts through those outputs.
- [x] **DnD reorder** — `TabStripComponent.onTabDrop()` resolves the target index from `DragSessionService.cursor().x` and live `.tab` bboxes, with pre-compensation for the splice-remove-then-insert model so the emitted `newIndex` reflects the post-splice slot the user dropped on. DnD directives and drop-zone contract untouched.
- [ ] Migrate move-to dropdowns to `@angular/cdk/overlay` — **priority #1** next (see local TODO)
- [ ] Keyboard a11y (tablist / ← → / Home / End / Escape / Enter)
- [ ] Validate reusability with a second consumer — backlog (see local TODO)

## Testing Checklist

### Tab operations

- [x] Tab CRUD: add, close, rename (double-click), color picker
- [x] Active tab operations: menu (⋮), color, move-to-config, close
- [x] No duplicate tab IDs
- [x] Data persists across page reload
- [x] DnD reorder moves to correct position

### Config operations

- [x] Config operations: save, recall, new, delete, rename
- [x] Config tab operations: rename, remove, move between configs
- [x] Auto-sync: modify tabs while on a config → config updates in saved config
- [x] Save/New button toggles correctly based on `activeConfigId`
- [x] Move tab removes from source config (no duplication)

### Quota / lock

- [x] Tab quota: `+` button → 🔒 at plan limit, click surfaces tab-limit popover
- [x] Config quota: save/new button → 🔒 at plan limit, load stays open
- [x] Per-config quota: target row in move-to dropdowns → dimmed + 🔒 when target config is full, click surfaces tab-limit popover
- [x] Plan-aware popover copy: Free ("feature not included") vs Pro-at-cap ("creation limit reached")
- [x] Service-level gate: mutations refuse silently when the corresponding `can*` returns false (async-race safe)
- [x] Downgrade: Pro→Free with existing configs — save locked, load still shows the frozen configs (read-only management possible)

### Architecture

- [x] Type-safe mapping (zero `as any` in state service)
- [x] Built-in toasts for config operations
- [x] `provideTabHandlers()` DI wiring (replaces output boilerplate)
- [x] Add tab button clickable (z-index fix over scroll container)
- [x] Component split into sub-components
- [x] Unit tests on `TabMutationService` — 48 specs
- [x] `_handlers` marked `readonly`
- [x] `dispatch()` runtime casts eliminated (typed `_emit: TabHandlers` map)
- [x] OnPush change detection on all four components
- [x] All UI labels configurable via `input<string>()` (i18n-ready)

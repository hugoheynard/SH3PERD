# Configurable Tab Bar — TODO

> **Component-level details, architecture walkthrough and lock contract
> live next to the code:**
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

### Backlog
- [x] **Unit tests on `TabMutationService`** — 48 specs in [`tab-mutation.service.spec.ts`](../../apps/frontend-webapp/src/app/shared/configurable-tab-bar/tab-mutation.service.spec.ts) cover every public mutation, the auto-sync post-processor, `onChanged` contract, and every `moveActiveTabToConfig` edge case (strip-empties, target !== active, target === active subtle interaction). Jest runner repaired along the way.
- [ ] DnD reorder moves to correct position — **deferred** (see local TODO § Priority #2)
- [ ] Migrate move-to dropdowns to `@angular/cdk/overlay` — **priority #3** for 8+ (see local TODO)
- [ ] Replace `_handlers` mutable workaround — backlog (see local TODO)
- [ ] Type-safe `dispatch` (remove `as any`) — backlog (see local TODO)
- [ ] Validate reusability with a second consumer — backlog (see local TODO)

## Testing Checklist

### Tab operations
- [x] Tab CRUD: add, close, rename (double-click), color picker
- [x] Active tab operations: menu (⋮), color, move-to-config, close
- [x] No duplicate tab IDs
- [x] Data persists across page reload
- [ ] DnD reorder moves to correct position — deferred

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
- [ ] Replace `_handlers` mutable workaround
- [ ] Type-safe `dispatch` (remove `as any`)

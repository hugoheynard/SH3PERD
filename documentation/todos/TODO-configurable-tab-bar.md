# Configurable Tab Bar — TODO

> **Component-local details** live next to the code in
> [`apps/frontend-webapp/src/app/shared/configurable-tab-bar/TODO.md`](../../apps/frontend-webapp/src/app/shared/configurable-tab-bar/TODO.md).
> This file keeps the high-level status; open the local TODO for the
> deferred DnD work, dispatch-typing cleanup, `_handlers` refactor, and
> unit-test plan.

## Status

- [x] Component split into sub-components (strip + inline-menu + config-panel)
- [ ] **Next up:** replace raw `<button>` with `sh3-button` / `sh3-button-icon` across all four templates (see local TODO § Next up)
- [ ] DnD reorder moves to correct position — **deferred** (see local TODO § Deferred)
- [ ] Unit tests on `TabMutationService` — backlog (see local TODO)
- [ ] Replace `_handlers` mutable workaround — backlog (see local TODO)
- [ ] Type-safe `dispatch` (remove `as any`) — backlog (see local TODO)

## Testing Checklist

- [x] Tab CRUD: add, close, rename (double-click), color picker
- [x] Config operations: save, recall, new, delete, rename
- [x] Config tab operations: rename, remove, move between configs
- [x] Active tab operations: menu (⋮), color, move-to-config, close
- [x] Auto-sync: modify tabs while on a config → config updates in saved config
- [x] Data persists across page reload
- [x] No duplicate tab IDs
- [x] Save/New button toggles correctly based on activeConfigId
- [x] Move tab removes from source config (no duplication)
- [x] Type-safe mapping (zero `as any` in state service)
- [x] Built-in toasts for config operations
- [x] `provideTabHandlers()` DI wiring (replaces output boilerplate)
- [x] Add tab button clickable (z-index fix over scroll container)
- [x] Component split into sub-components
- [ ] DnD reorder moves to correct position — deferred
- [ ] Unit tests on `TabMutationService`
- [ ] Replace `_handlers` mutable workaround
- [ ] Type-safe `dispatch` (remove `as any`)

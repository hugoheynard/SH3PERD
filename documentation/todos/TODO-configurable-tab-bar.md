# Configurable Tab Bar — TODO

## Bugs

### DnD reorder always moves tab to end
`onTabDrop()` uses `tabs.length - 1` as target index regardless of drop position.
- **Where:** `configurable-tab-bar.component.ts` → `onTabDrop()`
- **Fix:** Calculate target index from drop coordinates or pointer position relative to tab elements

## Improvements

### Unit tests for TabMutationService
~20 public mutations with zero specs. Priority tests:
- `addDefaultTab`, `closeTab`, `reorderTab`
- `saveTabConfig`, `applyTabConfig`, `newConfig`
- `moveActiveTabToConfig`, `moveTabToConfig` (duplication-sensitive)
- Auto-sync: mutating tabs while `activeConfigId` is set updates the saved config

### Split component into sub-components — ✅ done
Parent shrunk to a thin orchestrator; three standalone children live in
subfolders under `configurable-tab-bar/`:
- [x] **Tab strip** (`tab-strip/`) — the `@for` loop with inline rename, menu toggle, DnD
- [x] **Config panel** (`tab-config-panel/`) — the load dropdown with expand/rename/move/delete
- [x] **Tab inline menu** (`tab-inline-menu/`) — the ⋮ menu with color picker, move-to, close

### Replace `_handlers` workaround
`_handlers` is a mutable field set via `inject(TAB_HANDLERS)` to work around Angular signal input timing issues. Investigate if a directive-based approach or `afterRender` hook would be cleaner.

### Tighten `dispatch` typing
`dispatch` uses `as any` casts. Refactor to use a properly typed event map so payload types are checked at compile time.

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
- [ ] DnD reorder moves to correct position (currently broken)
- [ ] Unit tests on TabMutationService
- [x] Component split into sub-components
- [ ] Replace `_handlers` mutable workaround
- [ ] Type-safe `dispatch` (remove `as any`)

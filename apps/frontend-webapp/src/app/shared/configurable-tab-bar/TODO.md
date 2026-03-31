# Configurable Tab Bar — TODO

## Remaining Bug

### DnD reorder always moves tab to end
`onTabDrop()` uses `tabs.length - 1` as target index regardless of drop position.
- **Where:** `configurable-tab-bar.component.ts` → `onTabDrop()`
- **Fix:** Calculate target index from drop coordinates or pointer position relative to tab elements

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

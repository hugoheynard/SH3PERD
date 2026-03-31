# Configurable Tab Bar — TODO & Audit

## Critical Bugs (bloquants)

### 1. DnD reorder always moves tab to end
`onTabDrop()` in component uses `tabs.length - 1` as target index regardless of drop position.
- **Where:** `configurable-tab-bar.component.ts` → `onTabDrop()`
- **Fix:** Calculate target index from drop coordinates, or wire `onTabDropAtIndex()` properly

### 2. New button doesn't fire
`activeConfigId` revient toujours `null` après reload, donc le bouton New n'apparaît jamais. Même en session, le click ne déclenche pas le handler.
- **Where:** Save mapping `activeConfigId: s.activeConfigId ?? undefined` → load `(configs as any).activeConfigId ?? null`
- **Fix:** Vérifier le round-trip backend. Aussi vérifier que l'output `configNew` est bien wired dans le page template.

### 3. Move tab from active → config duplique au lieu de déplacer
Le tab est ajouté à la config cible mais pas retiré des tabs actives (si c'est le dernier tab actif, le close est skippé).
- **Where:** `music-library-page.component.ts` → `onTabMoveToConfig()`
- **Fix:** Créer un default tab de remplacement si c'est le dernier, puis close l'original

## Medium Bugs (data integrity)

### 4. Mutation service init() non protégé
`MusicTabMutationService.init()` doit être appelé manuellement avant toute mutation. Si oublié → `this.generic` est undefined → crash silencieux.
- **Fix:** Lazy init via getter ou factory pattern

### 5. Duplicate tab IDs (NG0955) — mitigé mais fragile
Mitigé avec fresh UUIDs dans `saveTabConfig()`, `applyTabConfig()`, `addActiveTabToConfig()`, et dedup filter au load. Risque : données corrompues en DB sont silencieusement dédupliquées (tabs perdues).
- **Fix:** Ajouter `console.warn` sur dedup, nettoyer la DB

### 6. Type mismatches cachés par `as any`
Plusieurs casts `as any` dans le mapping save/load (`music-library-state.service.ts` lines 109, 119, 128).
- Frontend: `MusicTabConfig` = nested `{ config: { searchConfig, searchQuery } }`
- Backend: `TMusicTabConfig` = flat `{ searchConfig, searchQuery }`
- **Fix:** Synchroniser les types ou créer un mapper explicite typé

### 7. Deux appels API parallèles sans coordination
`loadLibrary()` lance `getMyLibrary()` et `getTabConfigs()` indépendamment. Si un fail, l'autre continue.
- **Fix:** `forkJoin` + error handling combiné

## Low Priority (UX)

### 8. Config recall non testé après refactoring
Vérifier : après recall, est-ce que tous les tabs apparaissent avec le bon searchConfig, searchQuery, color, title ?

### 9. Save auto-triggered au load ?
`saveSubject` ne devrait fire que depuis `scheduleTabSave()`. Vérifier qu'un PUT ne se déclenche pas au reload.

### 10. Move dropdown position: fixed
Peut être clippé par des ancêtres avec overflow. Fragile mais fonctionne pour l'instant.

## Architecture Notes

### Data flow: Save (Frontend → Backend)
```
MusicTab.config.searchConfig  →  flatten  →  TMusicTabConfig.searchConfig
MusicTab.config.searchQuery   →  flatten  →  TMusicTabConfig.searchQuery
activeConfigId: null           →  map      →  undefined (omitted from JSON)
```

### Data flow: Load (Backend → Frontend)
```
TMusicTabConfig.searchConfig  →  wrap     →  MusicTab.config.searchConfig
TMusicTabConfig.searchQuery   →  wrap     →  MusicTab.config.searchQuery
activeConfigId: undefined     →  map      →  null
+ defensive fallback: t.config?.searchConfig (legacy format)
+ dedup filter on tab IDs
```

### ViewChild pitfall
`@ViewChild('colorInput')` MUST use `static: false` (default). With `static: true`, the component silently fails to render. This was the root cause of the "tab bar appears then disappears" bug.

## Testing Checklist
- [ ] Tab CRUD: add, close, rename (double-click), reorder (DnD), color picker
- [ ] Config operations: save, recall, new (after recall), delete, rename
- [ ] Config tab operations: rename, remove, move between configs
- [ ] Active tab operations: menu (⋮), color, move-to-config, close
- [ ] Search input works (projected via ng-content)
- [ ] Data persists across page reload (tabs + saved configs)
- [ ] DnD reorder moves to correct position (not always end)
- [ ] New button fires correctly after saving/recalling a config
- [ ] No duplicate tab IDs (check console for NG0955)
- [ ] No auto-save triggered on page load (check network tab)

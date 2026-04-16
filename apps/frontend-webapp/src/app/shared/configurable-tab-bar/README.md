# Configurable Tab Bar

A reusable, generic tab bar with save/recall named configs, DnD reorder,
color coding, inline rename, per-tab ⋮ menu, and a host-controlled lock
system for plan/quota gating.

The bar is **agnostic of any business concept** — it knows nothing about
plans, quotas, upgrade flows, or popovers. All gating is expressed as
plain boolean inputs + click outputs that the host wires to whatever
domain logic and UI affordances fit.

---

## At a glance

| What | Where |
|------|-------|
| Entry point | [`ConfigurableTabBarComponent`](./configurable-tab-bar.component.ts) |
| Public API | [`index.ts`](./index.ts) (re-exports) |
| Types | [`configurable-tab-bar.types.ts`](./configurable-tab-bar.types.ts) |
| Mutation service base class | [`tab-mutation.service.ts`](./tab-mutation.service.ts) |
| Handler wiring | [`tab-event.helpers.ts`](./tab-event.helpers.ts) |
| Sub-components | [`tab-strip/`](./tab-strip/), [`tab-inline-menu/`](./tab-inline-menu/), [`tab-config-panel/`](./tab-config-panel/) |
| Outstanding work | [`TODO.md`](./TODO.md) |

Only consumer today: [`music-library-page`](../../features/musicLibrary/music-library-page/).

---

## Component tree

```mermaid
flowchart TB
  Host[Host component<br/>e.g. MusicLibraryPage]

  subgraph Bar[ConfigurableTabBarComponent — orchestrator]
    Strip[TabStripComponent]
    AddBtn[[sh3-button-icon<br/>plus / lock]]
    Trailing[(<br/>ng-content<br/>tabBarTrailing<br/>)]
    Panel[TabConfigPanelComponent]
    Color[(input[type=color]<br/>hidden, shared)]
  end

  Strip --> Menu[TabInlineMenuComponent<br/>per tab, when ⋮ open]

  Host -- inputs --> Bar
  Host -- outputs --> Host
  Bar -. TAB_HANDLERS .-> MutationService[TabMutationService<br/>subclass in host]
```

### Responsibility split

| Component | Owns | Never owns |
|-----------|------|-----------|
| `ConfigurableTabBarComponent` | Public API surface, `TAB_HANDLERS` dispatch, shared color picker `<input>`, add/lock button, projection slots | Any domain logic (plans, quotas, popovers) |
| `TabStripComponent` | The `@for` loop, DnD wiring, inline rename state, ⋮ toggle | Mutations (bubbled up) |
| `TabInlineMenuComponent` | Color / move-to-config / close affordances per tab, move-dropdown position | Saved config data (received as input) |
| `TabConfigPanelComponent` | Save/new/load buttons + floating panels, locked variant, config edit state, built-in toasts | Tabs (only configs) |

---

## Public API

### Inputs

| Name | Type | Default | Purpose |
|------|------|---------|---------|
| `tabs` | `TabItem<unknown>[]` | *required* | Open tabs rendered in the strip |
| `activeTabId` | `string` | *required* | Currently selected tab |
| `activeConfigId` | `string \| null` | `null` | Non-null when the active tab set mirrors a saved config — toggles Save↔New button |
| `savedConfigs` | `SavedTabConfig<unknown>[]` | `[]` | Named snapshots the user has saved |
| `showToasts` | `boolean` | `true` | Enable built-in toasts on save / new / load / delete |
| `locked` | `boolean` | `false` | When true, swap `+` button for a `lock` and route clicks to `lockClicked` instead of `tabAdd` |
| `saveRecallLocked` | `boolean` | `false` | When true, collapse the config panel to a single lock button and route clicks to `saveRecallLockClicked`. Also hides the per-tab "move to config" action. |

### Outputs

| Name | Payload | Fires when |
|------|---------|------------|
| `tabSelect` | `string` | User clicks a tab (id) |
| `tabAdd` | `void` | User clicks `+` (only unlocked) |
| `tabClose` | `string` | User clicks × inside the ⋮ menu |
| `tabRename` | `{ id; title }` | User commits an inline rename |
| `tabReorder` | `{ tabId; newIndex }` | DnD drop (⚠ currently always drops at end — see [TODO.md](./TODO.md)) |
| `tabColorChange` | `{ id; color }` | User picks a colour in the hidden picker |
| `tabMoveToConfig` | `{ tab; targetConfigId }` | User picks a target in the ⋮ move-to dropdown |
| `configSave` | `string` | User submits the save form (name) |
| `configNew` | `void` | User clicks "new blank configuration" |
| `configLoad` | `SavedTabConfig<unknown>` | User picks a config in the load menu |
| `configDelete` | `string` | User deletes a saved config (id) |
| `configRename` | `{ configId; name }` | User commits a config rename |
| `configTabRemove` | `{ configId; tabId }` | User removes a tab from a config in the load dropdown |
| `configTabRename` | `{ configId; tabId; title }` | User commits a tab rename inside the load dropdown |
| `configTabMove` | `{ sourceConfigId; targetConfigId; tabId }` | User moves a tab between configs in the load dropdown |
| `lockClicked` | `void` | User clicks the lock affordance (replaces the `+` button when `locked`) |
| `saveRecallLockClicked` | `void` | User clicks the lock affordance (replaces the config panel when `saveRecallLocked`) |

### Content projection slots

| Slot | Where it renders | Example |
|------|------------------|---------|
| `[tabBarTrailing]` | Between the add button and the config panel | Search input, view toggle, custom inline stats |

---

## Wiring via `TAB_HANDLERS`

Most mutation outputs follow an identical pattern — "receive event, call the
matching method on a mutation service". Rather than binding each output
manually, the bar can inject a `TabHandlers` implementation and dispatch
every mutation through it.

### Provide it in the host

```ts
@Component({
  providers: [provideTabHandlers(MusicTabMutationService)],
})
export class MusicLibraryPageComponent { … }
```

### Subclass `TabMutationService`

```ts
@Injectable({ providedIn: 'root' })
export class MusicTabMutationService extends TabMutationService<MusicTabConfig> {
  // implement the abstract state signal…
}
```

`provideTabHandlers` wires every `TabHandlers` method to the corresponding
`TabMutationService` method:

```mermaid
flowchart LR
  Bar[ConfigurableTabBar] -- dispatch -->|calls handler| Handlers[TabHandlers]
  Bar -- also emits -->|(output)| HostOutputs[Host (output) bindings]
  Handlers -->|delegates to| Service[MutationService subclass]
```

Individual `(output)` bindings still work side-by-side with the handler map —
if a host binds `(tabRename)="onSomething()"` on top of `provideTabHandlers`,
both fire for every event.

### Why `lockClicked` / `saveRecallLockClicked` stay out of `TabHandlers`

They aren't mutations — they're UI-level signals ("user hit the wall,
decide what to do"). Routing them through the handler map would couple the
mutation service to navigation/popover concerns it has no business with.
They're plain outputs that the host wires by hand.

---

## State model

```mermaid
classDiagram
  class TabSystemState~TConfig~ {
    +TabItem~TConfig~[] tabs
    +string activeTabId
    +string|null activeConfigId
    +SavedTabConfig~TConfig~[] savedTabConfigs
  }

  class TabItem~TConfig~ {
    +string id
    +string title
    +boolean autoTitle
    +string? color
    +TConfig config
  }

  class SavedTabConfig~TConfig~ {
    +string id
    +string name
    +TabItem~TConfig~[] tabs
    +string activeTabId
    +number createdAt
  }

  TabSystemState "1" --> "many" TabItem
  TabSystemState "1" --> "many" SavedTabConfig
  SavedTabConfig "1" --> "many" TabItem
```

- `TabItem.config` carries whatever domain data the host needs per tab —
  music search filters, a query string, an editor mode, etc. Opaque to the
  bar.
- `activeConfigId !== null` means the currently-open set of tabs is the
  active view of a saved config. Mutations are mirrored into the saved
  config so the "forgot to save" problem is avoided (see the rationale in
  `TODO-music-features.md`).

---

## User flows

### 1. Add a tab (unlocked)

```mermaid
sequenceDiagram
  participant U as User
  participant Bar as ConfigurableTabBar
  participant H as TAB_HANDLERS
  participant S as MutationService
  participant State as Tab state signal

  U->>Bar: click [+]
  Bar->>H: tabAdd()
  H->>S: addDefaultTab()
  S->>State: update({ tabs: [...tabs, newTab], activeTabId: newTab.id })
  State-->>Bar: new tabs() signal value
  Bar-->>U: new tab rendered, selected
  Bar-->>U: also emits (tabAdd) for custom handlers
```

### 2. Try to add a tab when locked

```mermaid
sequenceDiagram
  participant U as User
  participant Bar as ConfigurableTabBar
  participant Host as Host component
  participant Layout as LayoutService

  Note over Host: locked = true (host decides why)

  U->>Bar: click [🔒]
  Bar-->>Host: (lockClicked)
  Host->>Layout: setPopover(TabLimitPopoverComponent)
  Layout-->>U: popover frame + upgrade CTA
  U->>Layout: click Upgrade
  Layout->>Layout: clearPopover()
  Layout->>Layout: setRightPanel(UpgradePanelComponent)
```

The bar never imports the popover or the upgrade panel — those are host
concerns. The bar just says "user hit the lock, over to you".

### 3. Inline rename a tab

```mermaid
sequenceDiagram
  participant U as User
  participant Strip as TabStripComponent
  participant Bar as ConfigurableTabBar
  participant S as MutationService

  U->>Strip: double-click tab
  Strip->>Strip: editingTabId.set(tab.id)
  U->>Strip: type new name, press Enter (or blur)
  Strip->>Bar: (tabRename) { id, title }
  Bar->>Bar: dispatch('tabRename', payload)
  Bar->>S: updateTabTitle(id, title)
  S->>S: state.update(...)
  Bar-->>U: new title rendered, edit mode exits
```

### 4. Save + load a config

```mermaid
sequenceDiagram
  participant U as User
  participant Panel as TabConfigPanel
  participant Bar as ConfigurableTabBar
  participant S as MutationService

  rect rgb(35, 40, 55)
    note right of U: Save
    U->>Panel: click 💾 → toggleSaveForm()
    U->>Panel: type name, Enter
    Panel->>Bar: (configSave) "My config"
    Bar->>S: saveTabConfig("My config")
    S->>S: push SavedTabConfig, set activeConfigId
    Panel->>Panel: toast("Config saved")
  end

  rect rgb(30, 40, 45)
    note right of U: Load (later)
    U->>Panel: click 📂 → toggleLoadMenu()
    U->>Panel: click a config row
    Panel->>Bar: (configLoad) config
    Bar->>S: applyTabConfig(config)
    S->>S: replace tabs with config.tabs
    Panel->>Panel: toast("Config applied")
  end
```

### 5. Move active tab to another config

```mermaid
sequenceDiagram
  participant U as User
  participant Menu as TabInlineMenu
  participant Strip as TabStripComponent
  participant Bar as ConfigurableTabBar
  participant S as MutationService

  U->>Strip: click ⋮ on tab
  Strip->>Menu: openTabMenuId = tab.id
  U->>Menu: click ⇥
  Menu->>Menu: moveMenuOpen.set(true), compute dropdown rect
  U->>Menu: pick target config
  Menu->>Strip: (moveToConfig) { tab, targetConfigId }
  Strip->>Bar: (tabMoveToConfig) { tab, targetConfigId }
  Bar->>S: moveActiveTabToConfig(tab.id, targetConfigId)
```

### 6. Save/recall locked — full gating

```mermaid
flowchart LR
  Host[Host<br/>saveRecallLocked = true]
  Bar[ConfigurableTabBar]
  Panel[TabConfigPanel]
  Strip[TabStripComponent]
  Menu[TabInlineMenu]

  Host -- saveRecallLocked --> Bar
  Bar -- locked=true --> Panel
  Panel -- renders ONE --> Lock1[🔒 button<br/>→ lockClicked]
  Bar -- canMoveToConfig=false --> Strip
  Strip -- canMoveToConfig=false --> Menu
  Menu -- hides --> MoveBtn[⇥ move-to button]
```

This is the downgrade case. A user on Pro saves configs, then downgrades
to Free:

- The `TabConfigPanel` collapses to a single 🔒 — user can't save, load,
  rename, delete or reorganise configs from here.
- The per-tab ⋮ menu still opens, still lets the user colour/rename/close
  tabs, **but the move-to-config button is hidden** so the user can't
  shovel tabs into the frozen configs either.
- Existing configs aren't deleted — they stay in persistence, invisible
  via this UI until the user re-upgrades. Consistent with the platform's
  "freeze, never delete" quota policy (see
  `apps/backend/documentation/sh3-platform-contract.md`).

### 7. Drag to reorder (current behaviour)

```mermaid
sequenceDiagram
  participant U as User
  participant Strip as TabStripComponent
  participant Bar as ConfigurableTabBar
  participant S as MutationService

  U->>Strip: drag tab, drop in scroll zone
  Strip->>Strip: onTabDrop(drag) — ⚠ always newIndex = tabs.length - 1
  Strip->>Bar: (tabReorder) { tabId, newIndex: last }
  Bar->>S: reorderTab(tabId, last)
  S->>S: splice + push to end
```

The drop-at-end behaviour is a known bug — the underlying
`dnd-drop-zone.directive.ts` only emits zone-level drops (no index within
the zone). Fixing it is deferred, see [TODO.md § Deferred](./TODO.md).

---

## Lock contract — summary

The bar exposes two orthogonal lock surfaces, both with the same shape:

| Surface | Input | Output | Visual swap |
|---------|-------|--------|-------------|
| Add tab | `locked` | `lockClicked` | `+` → `lock` icon |
| Save / recall | `saveRecallLocked` | `saveRecallLockClicked` | Save + Load buttons + panels → single `lock` icon |

**Invariants:**

- When `saveRecallLocked` is true, `canMoveToConfig` on `TabStripComponent`
  is automatically set to `false` by the orchestrator. The host doesn't
  need to duplicate the gate.
- The bar never modifies state as a result of a lock click — it only
  notifies the host, which decides what to do (popover, tooltip, right
  panel, nothing, …).
- Flipping a lock input doesn't unmount anything — the panel and the add
  button stay in the DOM, just re-render in a different variant. State
  (e.g. `showLoadMenu`, `moveMenuOpen`) is reset by the variant change.
- The inline menu's move-to button is gated by `canMoveToConfig`, the close
  button by `canClose`, and neither propagates into `TabHandlers` — they're
  purely local UI decisions.

---

## Downgrade / upgrade matrix

| Plan state | `locked` | `saveRecallLocked` | Effect |
|------------|----------|--------------------|--------|
| Free (first visit) | false until N tabs | **true** | Add works up to plan limit, save/recall is locked from the start. Per-tab move-to hidden. |
| Free (hit tab limit) | **true** | **true** | Both locks active. Clicking either surfaces the host's popover. |
| Pro | false unless over plan cap | false | Full bar. |
| Pro → Free downgrade with saved configs | false until N tabs | **true** | Configs are persisted but invisible. Move-to hidden. Re-upgrade re-exposes them as-is. |

The bar does not own the plan check. The host computes each boolean from
whatever source of truth it wants — `UserContextService`, a route data
resolver, a feature flag, etc.

---

## File map

```
configurable-tab-bar/
├── README.md                             ← this file
├── TODO.md                               ← outstanding component work
├── index.ts                              ← public API re-exports
├── configurable-tab-bar.component.{ts,html,scss}
├── configurable-tab-bar.types.ts         ← TabItem, SavedTabConfig, TabSystemState, TabStateSignal
├── tab-event.helpers.ts                  ← TabHandlers, TAB_HANDLERS, provideTabHandlers
├── tab-mutation.service.ts               ← abstract base for host's MutationService subclass
├── tab-strip/
│   └── tab-strip.component.{ts,html,scss}
├── tab-inline-menu/
│   └── tab-inline-menu.component.{ts,html,scss}
└── tab-config-panel/
    └── tab-config-panel.component.{ts,html,scss}
```

Sub-components are **not** re-exported from `index.ts` — they're internal
to the bar. Only the orchestrator, the handler helpers, the mutation
service base, and the types are public.

---

## Minimal host example

```ts
// music-library-page.component.ts
readonly maxTabs = computed(() => /* plan → number */);
readonly tabLimitReached = computed(() =>
  this.maxTabs() !== -1 && this.selector.tabs().length >= this.maxTabs()
);
readonly saveRecallLocked = computed(() => this.userCtx.plan() === 'artist_free');

openTabLimitPopover(): void {
  this.layout.setPopover(TabLimitPopoverComponent);
}
openSaveRecallLockedPopover(): void {
  this.layout.setPopover(SaveRecallLockedPopoverComponent);
}
```

```html
<sh3-configurable-tab-bar
  [tabs]="selector.tabs()"
  [activeTabId]="selector.activeTabId()"
  [activeConfigId]="selector.activeConfigId()"
  [savedConfigs]="selector.savedTabConfigs()"
  [locked]="tabLimitReached()"
  [saveRecallLocked]="saveRecallLocked()"
  (lockClicked)="openTabLimitPopover()"
  (saveRecallLockClicked)="openSaveRecallLockedPopover()">

  <div tabBarTrailing>
    <!-- domain-specific search input, view toggle, whatever -->
  </div>
</sh3-configurable-tab-bar>
```

---

## Related docs

- [`TODO.md`](./TODO.md) — deferred / backlog items for this component
- [`documentation/todos/TODO-configurable-tab-bar.md`](../../../../../../documentation/todos/TODO-configurable-tab-bar.md) — status overview that delegates to this folder
- [`documentation/todos/TODO-music-features.md`](../../../../../../documentation/todos/TODO-music-features.md) — the only consumer's roadmap
- [`apps/backend/documentation/sh3-platform-contract.md`](../../../../../../apps/backend/documentation/sh3-platform-contract.md) — downgrade / freeze policy the lock contract lines up with

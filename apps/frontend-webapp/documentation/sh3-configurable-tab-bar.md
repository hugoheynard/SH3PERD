# Configurable Tab Bar

Generic, reusable tab system with save/recall configs, drag-and-drop reorder, color coding, inline editing, and built-in toasts.

## Architecture

```
shared/configurable-tab-bar/
├── configurable-tab-bar.types.ts    # Generic types: TabItem<T>, SavedTabConfig<T>, TabSystemState<T>, TabStateSignal<T>
├── tab-mutation.service.ts          # Abstract mutation service — extend per domain
├── tab-event.helpers.ts             # provideTabHandlers(), TAB_HANDLERS token, TabHandlers<T> type
├── configurable-tab-bar.component.* # Standalone Angular component (template + styles + built-in toasts)
└── index.ts                         # Public API
```

## Integration Guide (3 steps)

### 1. Expose a `TabStateSignal` from your state service

```typescript
@Injectable({ providedIn: 'root' })
export class MyStateService {
  private state = signal<MyFullState>({ /* ... */ });

  readonly tabState: TabStateSignal<MyConfig> = Object.assign(
    () => {
      const s = this.state();
      return { tabs: s.tabs, activeTabId: s.activeTabId, activeConfigId: s.activeConfigId, savedTabConfigs: s.savedTabConfigs };
    },
    {
      update: (updater) => {
        this.state.update(s => {
          const slice = { tabs: s.tabs, activeTabId: s.activeTabId, activeConfigId: s.activeConfigId, savedTabConfigs: s.savedTabConfigs };
          return { ...s, ...updater(slice) };
        });
      },
    },
  );

  scheduleTabSave(): void { this.saveSubject.next(); }
}
```

### 2. Extend `TabMutationService` with domain mutations

```typescript
const DEFAULT = (): MyConfig => ({ query: '', filters: {} });

@Injectable({ providedIn: 'root' })
export class MyTabService extends TabMutationService<MyConfig> {
  constructor() {
    const state = inject(MyStateService);
    super(state.tabState, DEFAULT, () => state.scheduleTabSave());
  }

  // Only domain-specific mutations:
  setQuery(tabId: string, q: string): void {
    this.patchTabConfig(tabId, c => ({ ...c, query: q }));
  }
}
```

### 3. Wire in your page component

```typescript
@Component({
  imports: [ConfigurableTabBarComponent],
  providers: [provideTabHandlers(MyTabService)],
  template: `
    <sh3-configurable-tab-bar
      [tabs]="selector.tabs()"
      [activeTabId]="selector.activeTabId()"
      [activeConfigId]="selector.activeConfigId()"
      [savedConfigs]="selector.savedTabConfigs()"
    >
      <div tabBarTrailing><!-- domain-specific projected content --></div>
    </sh3-configurable-tab-bar>
  `,
})
export class MyPageComponent {}
```

That's it. The component handles all tab CRUD, config management, and toasts internally via DI.

## Customization

### Disable built-in toasts
```html
<sh3-configurable-tab-bar [showToasts]="false" />
```

### Listen to specific events (in addition to DI handlers)
Outputs still fire even when `TAB_HANDLERS` is provided. Use them for analytics, custom side effects, etc:
```html
<sh3-configurable-tab-bar
  (configSave)="analytics.track('config_saved', $event)"
/>
```

### Content Projection
Use `[tabBarTrailing]` to project domain-specific content between the tab strip and config actions:
```html
<sh3-configurable-tab-bar ...>
  <div tabBarTrailing>
    <input placeholder="Search..." />
  </div>
</sh3-configurable-tab-bar>
```

## Key Behaviors

- **Auto-sync**: When `activeConfigId` is set, every tab mutation automatically updates the corresponding saved config.
- **Shared IDs**: Tabs and saved configs share IDs (no UUID regeneration on save/recall). This enables move operations to locate and remove tabs from source configs.
- **Save/New toggle**: The save button mutates to "New" when a config is active, and back to "Save" when no config is active.
- **Built-in toasts**: Config save, recall, new, and delete show toasts by default. Disable with `[showToasts]="false"`.
- **DI-based wiring**: Use `provideTabHandlers(MyTabService)` in your component's `providers` — the tab bar injects `TAB_HANDLERS` automatically. No output bindings needed for standard operations.

## Component API

### Inputs
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `tabs` | `TabItem<any>[]` | required | Current active tabs |
| `activeTabId` | `string` | required | ID of the selected tab |
| `activeConfigId` | `string \| null` | `null` | ID of the active saved config |
| `savedConfigs` | `SavedTabConfig<any>[]` | `[]` | List of saved configurations |
| `showToasts` | `boolean` | `true` | Show built-in toast notifications |

### Outputs
All outputs fire regardless of whether `TAB_HANDLERS` is provided.

| Output | Payload |
|--------|---------|
| `tabSelect` | `string` |
| `tabAdd` | `void` |
| `tabClose` | `string` |
| `tabRename` | `{ id, title }` |
| `tabReorder` | `{ tabId, newIndex }` |
| `tabColorChange` | `{ id, color }` |
| `configSave` | `string` |
| `configNew` | `void` |
| `configLoad` | `SavedTabConfig` |
| `configDelete` | `string` |
| `configRename` | `{ configId, name }` |
| `configTabRemove` | `{ configId, tabId }` |
| `configTabRename` | `{ configId, tabId, title }` |
| `configTabMove` | `{ sourceConfigId, targetConfigId, tabId }` |
| `tabMoveToConfig` | `{ tab, targetConfigId }` |

## Pitfalls

- `@ViewChild('colorInput')` must use `static: false` (default). `static: true` silently breaks rendering.
- The `.tab-add` button needs `position: relative; z-index: 2;` to stay clickable above the `.tabs-scroll` overflow container.
- DnD reorder currently always drops to end of list (known bug, see TODO.md).
- Angular signal inputs with plain object values can lose their value between change detection cycles — use DI (`TAB_HANDLERS` injection token) instead of `[input]` bindings for handler maps.

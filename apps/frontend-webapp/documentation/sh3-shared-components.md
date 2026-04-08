# Shared Components

Reusable UI components available in `src/app/shared/`.

Import from their respective paths — all are `standalone: true`.

---

## New Components (2026-04-04)

### `<sh3-tab-nav>` — Tab Navigation Bar

**Path:** `shared/tab-nav/tab-nav.component`

Renders a row or column of tab buttons. Does NOT render content — the parent switches content based on the active key.

```html
<sh3-tab-nav
  [tabs]="[
    { key: 'info', label: 'Info', icon: 'M12 2C6.48...', badge: 3 },
    { key: 'settings', label: 'Settings', icon: 'M19.14...' }
  ]"
  [activeKey]="activeTab()"
  activeStyle="underline"
  direction="horizontal"
  (tabChange)="activeTab.set($event)"
/>
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `tabs` | `TabNavItem[]` | required | Tab items to render |
| `activeKey` | `string` | required | Currently active tab key |
| `activeStyle` | `'underline' \| 'fill'` | `'underline'` | Active indicator style |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Bar orientation (vertical auto-switches to horizontal on mobile) |

| Output | Type | Description |
|--------|------|-------------|
| `tabChange` | `string` | Key of the clicked tab |

**Icon format:** SVG path `d` string (Material Icons). The component renders a 14×14 SVG with `fill="currentColor"`.

**Typing:** `tabChange` emits `string`. If your signal uses a strict union, use a setter method with `as` cast (same pattern as `sh3-pill-selector` — see below).

**Convention:** Always set `activeStyle` and `direction` explicitly.

---

### `<sh3-avatar>` — User/Entity Avatar

**Path:** `shared/avatar/avatar.component`

Displays initials in a colored circle. Color is deterministic based on `name` or `colorSeed`.

```html
<sh3-avatar name="Hugo Heynard" size="md" />
<sh3-avatar name="Guest" variant="ghost" size="sm" />
<sh3-avatar name="Acme Corp" [square]="true" size="lg" />
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | `string` | required | Full name — initials derived automatically |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 20px / 32px / 44px |
| `colorSeed` | `string` | `name` | String for deterministic color picking |
| `variant` | `'solid' \| 'ghost'` | `'solid'` | Ghost = dashed border (for guests) |
| `square` | `boolean` | `false` | Square shape with small radius (for orgs) |

---

### `<sh3-status-badge>` — Status Indicator Badge

**Path:** `shared/status-badge/status-badge.component`

Colored pill badge. Color is automatic based on status value.

```html
<sh3-status-badge status="active" />
<sh3-status-badge status="pending" label="En attente" />
<sh3-status-badge status="coming-soon" label="Coming soon" />
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | `string` | required | Status key (determines color) |
| `label` | `string` | status value | Override display text |

**Status → Color mapping:**
- `active`, `connected` → green (accent)
- `pending` → yellow (warning)
- `suspended`, `error` → red (alert)
- `coming-soon`, `not_connected` → grey (muted)

---

### `<sh3-pill-selector>` — Pill Selection Row

**Path:** `shared/pill-selector/pill-selector.component`

Horizontal row of selectable pills. Single-select.

```html
<sh3-pill-selector
  [options]="roleOptions"
  [activeKey]="selectedRole()"
  (selected)="setSelectedRole($event)"
/>
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `options` | `PillOption[]` | required | Available options (`{ key, label }`) |
| `activeKey` | `string` | required | Currently selected key |

| Output | Type | Description |
|--------|------|-------------|
| `selected` | `string` | Key of the clicked pill |

### Typing pattern — `string` output → typed signal

The `(selected)` output emits a `string`. If your signal uses a strict union type or enum
(e.g. `signal<TTeamRole>('member')`), **do not assign directly in the template**.
Instead, create a setter method in the parent that casts explicitly:

```ts
// In the parent component:

readonly selectedRole = signal<TTeamRole>('member');

// Options built from the enum — guarantees the keys are valid values
readonly roleOptions = (['director', 'manager', 'member', 'viewer'] as TTeamRole[])
  .map(r => ({ key: r, label: r }));

// Setter with explicit cast — safe because the keys come from our own enum
setSelectedRole(key: string): void {
  this.selectedRole.set(key as TTeamRole);
}
```

```html
<!-- Template: use the setter, not .set() directly -->
<sh3-pill-selector
  [options]="roleOptions"
  [activeKey]="selectedRole()"
  (selected)="setSelectedRole($event)"
/>
```

**Why `as` is safe here:** the `options` array is built from the enum values,
so the emitted `key` is guaranteed to be a valid enum member. The cast
bridges the generic `string` output to the strict type without losing type safety.

**Do NOT use `satisfies`** — it checks types at declaration time, not at assignment time.
It cannot convert a `string` into a union type.

---

## Existing Components

| Component | Path | Description |
|-----------|------|-------------|
| `<sh3-button>` | `shared/button/` | Primary/ghost/danger button |
| `<sh3-input>` | `shared/forms/input/` | Form input with label |
| `<sh3-form-section>` | `shared/forms/form-section/` | Titled form section |
| `<ui-popover-frame>` | `shared/ui-frames/popover-frame/` | Generic popover container |
| Configurable Tab Bar | `shared/configurable-tab-bar/` | Draggable tabs (music library) |
| Tab System | `shared/tabSystem/` | Dynamic tab interface |

---

## CSS Guidelines

- **Never hardcode colors** — use `var(--accent-color)`, `var(--text-muted)`, etc.
- **Never hardcode font sizes** — use `var(--text-xs)`, `var(--text-sm)`, `var(--text-md)`, `var(--text-lg)`
- **Never hardcode border radius** — use `var(--radius-xs)`, `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-lg)`, `var(--radius-round)`
- **Never hardcode spacing** — use consistent values from the design system (4, 8, 12, 16, 20, 24, 32px)

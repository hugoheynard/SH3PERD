# SH3PHERD Frontend — Styling Architecture

How styles are organised in the Angular frontend. The project uses
**CSS custom properties (tokens) + a handful of SCSS mixins + Angular
component styles** exclusively. Tailwind and SCSS token variables
have been removed — `_tokens.css` is the single source of truth.

---

## Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Design tokens** | CSS custom properties | Colours, spacing, typography, shadows, radii, layout |
| **SCSS mixins** | Sass `@mixin` | Cross-cutting patterns that can't be expressed as CSS vars (scrollbar theming, multi-selector layouts) |
| **Component styles** | Angular scoped SCSS | Per-component styles, encapsulated via `ViewEncapsulation.Emulated` |
| **Global styles** | `styles.scss` | Resets, CDK drag, Angular Material setup, global form class |

No more SCSS `$variables` for design tokens — if a value is shared, it's a CSS custom property in `_tokens.css`.

---

## File structure

```
src/
├── styles.scss                  ← Global entry point (Angular CLI imports it)
├── styles/
│   ├── _tokens.css              ← Design tokens (:root CSS vars, dark + light themes)
│   ├── form.css                 ← Global .input-base utility class
│   ├── mixins/
│   │   ├── index.scss           ← @forward barrel
│   │   ├── _forms.scss          ← form-section-title
│   │   ├── _scrollBars.scss     ← scrollbar (see dedicated section below)
│   │   └── _settings-layout.scss ← settings-inline / settings-content / settings-responsive
│   └── themes/                  ← (empty — reserved for future theme overrides)
└── app/
    └── shared/
        └── styles/              ← Domain-specific mixins (rating-dots, button icons, form-inputs)
```

Note: `src/app/shared/styles/` is a **separate** SCSS ecosystem for UI primitives used inside `features/musicLibrary` (rating dots, `btn-icon` helper, form input mixins). It has its own `tokens/` + `mixins/` subtree because its concerns (rating visualisation, per-component form inputs) are decoupled from the global design system.

---

## Design tokens (`_tokens.css`)

Single source of truth. A `:root` block defines the dark theme (default), then a second `:root` block at the end overrides for light.

### Token categories

| Category | Examples | Naming |
|----------|---------|--------|
| Backgrounds | `--content-page-bg-color`, `--card-color`, `--panel-color` | `--<surface>-color` |
| Borders | `--panel-border-color`, `--divider-color` | `--<role>-border-color` |
| Accent | `--accent-color`, `--accent-color-dim`, `--accent-color-faded`, `--accent-color-border` | `--accent-color-<variant>` |
| Semantic | `--color-warning`, `--color-alert`, `--color-success`, `--color-info` | `--color-<intent>` |
| Text | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-faded`, `--baseTextColor` | `--text-<weight>` |
| Typography sizes | `--text-xs` … `--text-xl` | `--text-<size>` |
| Radius | `--radius-xs` … `--radius-round` | `--radius-<size>` |
| Shadows | `--shadow-xs` … `--shadow-xl`, `--shadow-floating` | `--shadow-<size>` |
| Transitions | `--t-fast`, `--t-base`, `--t-slow`, `--t-spring` | `--t-<speed>` |
| Layout | `--h-header`, `--w-appMenu`, `--sidePanel-w`, `--gap-md`, `--gap-lg` | `--<dimension>-<element>` |
| Tabs | `--tab-bgColor`, `--tab-bgColor-active` | `--tab-<role>` |

New visual values go here first. If a token doesn't fit an existing category, add one — don't hardcode in a component.

---

## SCSS mixins (`src/styles/mixins/`)

Imported as `@use "mixins" as m;` from component SCSS. Kept intentionally minimal — only patterns that genuinely can't be expressed as a token or a utility class.

| Mixin | File | Purpose |
|-------|------|---------|
| `m.scrollbar($width, $thumb, $thumb-hover, $track, $radius)` | `_scrollBars.scss` | Thin custom scrollbar (Webkit + Firefox). See dedicated section below. |
| `m.form-section-title` | `_forms.scss` | Uppercase tracking-wide heading for form sections |
| `m.settings-inline($sidebar-width)` | `_settings-layout.scss` | Sidebar + content flex layout for settings pages |
| `m.settings-content` | `_settings-layout.scss` | Scrollable content panel styles |
| `m.settings-responsive` | `_settings-layout.scss` | Breakpoint rules: ≤768px sidebar collapses to top, ≤480px tighter padding |

### Usage

```scss
@use "mixins" as m;

.side-panel {
  @include m.scrollbar;
}

.settings-layout { @include m.settings-inline; }
.settings-content { @include m.settings-content; }
@include m.settings-responsive;
```

Only import `mixins` when you actually invoke one — a bare `@use "mixins" as m;` with no `m.*` call is dead weight.

---

## Scrollbar mixin (`m.scrollbar`)

### Rationale

Browsers expose scrollbars through **two distinct APIs** and neither is componentisable at the DOM level:

1. **Firefox** — `scrollbar-width` + `scrollbar-color` properties applied to the scrollable element.
2. **WebKit / Blink (Chrome, Safari, Edge)** — `::-webkit-scrollbar`, `::-webkit-scrollbar-track`, `::-webkit-scrollbar-thumb` pseudo-elements.

Any custom scrollbar has to declare both sets of rules on the scrolling container itself. Wrapping them in a mixin means:

- **Single place to maintain** the cross-browser matrix.
- **Accent-tinted defaults** via `var(--accent-color-faded)` and `var(--accent-color-border)` — the thumb inherits theme changes automatically.
- **Parameterisable** for the rare case where a specific panel needs a different width, track, or radius.

We explicitly rejected building an Angular `<sh3-scrollbar>` component: scrollbars aren't DOM elements, and implementing custom scroll via wrapper `<div>`s (à la `ngx-perfect-scrollbar`) would replace native scroll handling for a purely cosmetic effect — not worth the touch, keyboard, and a11y edge cases.

### API

```scss
@mixin scrollbar(
  $width: 4px,
  $thumb: var(--accent-color-faded),
  $thumb-hover: var(--accent-color-border),
  $track: transparent,
  $radius: 2px
)
```

| Param | Default | Notes |
|-------|---------|-------|
| `$width` | `4px` | Applies to `::-webkit-scrollbar { width }`. Firefox uses `scrollbar-width: thin;` regardless. |
| `$thumb` | `var(--accent-color-faded)` | Thumb colour in both engines. Pass `transparent` to hide. |
| `$thumb-hover` | `var(--accent-color-border)` | WebKit-only. Firefox has no native hover state. |
| `$track` | `transparent` | Track colour. |
| `$radius` | `2px` | WebKit thumb border-radius. Firefox ignores. |

### Usage

```scss
@use "mixins" as m;

.scrollable-panel {
  overflow-y: auto;

  @include m.scrollbar; // default: 4px accent-faded thumb, transparent track
}

// Custom width + opaque track
.sidebar {
  overflow-y: auto;
  @include m.scrollbar(
    $width: 6px,
    $track: var(--panel-color)
  );
}
```

### When to use (and when not)

- **Use it** on any scrollable container where you want the themed thin scrollbar.
- **Don't use it** to hide scrollbars entirely — for that, write the two lines inline:
  ```scss
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  ```
  (See `configurable-tab-bar.component.scss` — hiding is a separate concern from styling.)
- **Don't rewrite the rules by hand** — if you find yourself writing `scrollbar-width: thin;` in a component, you want this mixin. The one historical offender (`music-library-side-panel`) was migrated to use `m.scrollbar` for consistency.

### Current call sites

| File | Context |
|------|---------|
| `core/notifications/notification-panel` | Toast panel scroll |
| `features/playlists/playlists-page` | Playlist list + detail panels |
| `features/programs/panels/program-side-panel` | Planner left panel |
| `features/musicLibrary/components/add-entry-panel` | Add-entry wizard panel |
| `features/musicLibrary/components/music-library-side-panel` | Library side filters |

---

## Icons (`sh3-icon`)

All icons in the app go through the `sh3-icon` component backed by a typed registry. Inline `<svg>` blocks in templates and `<mat-icon>` are forbidden — adding either re-introduces drift between consumers and the design system.

### Architecture

```
src/assets/icons/
├── ui/         # Generic controls + verbs on items
│   chevrons, close, plus, check, search, eye, edit, bin, upload,
│   download, menu, reset, view, folder, folder-open, file-add,
│   playlist-add, save, list, grid, lock, globe, sliders, ungroup,
│   reload, expand-all, collapse-all, arrow-back, arrow-right,
│   check-circle
├── nav/        # App-level chrome (sidebar + header destinations)
│   home, program, music, contracts, company, settings, stats,
│   logout, bell, help, theme-dark, theme-light
├── music/      # Music domain — playback transport + ratings + instruments
│   play, play-circle, pause, prev-track, next-track, rewind,
│   fast-forward, volume, mute, repeat, metronome, microphone,
│   music-file, music-note, waveform, heart, heart-border, fire
├── status/     # Status badges
│   completed, clock, diamond, award, lightning, offline-bolt
├── people/     # User and role indicators
│   king, leader, group-lead, referral, give-rights, team, work,
│   briefcase
└── brands/     # Third-party platform logos
    slack, whatsapp, teams, discord, telegram

src/app/shared/icon/
├── icon.component.ts      # the sh3-icon component
├── icon.registry.ts       # imports every SVG, exports SH3_ICONS + Sh3IconName
└── svg.d.ts               # `declare module '*.svg'` for esbuild text loader
```

The registry uses Angular's `@angular/build` esbuild loader configured in `angular.json`:

```json
"loader": { ".svg": "text" }
```

Each `.svg` file is imported directly as a string at build time. Adding a new icon = drop the file in the right folder, import it in `icon.registry.ts`, add it to `SH3_ICONS`. The `Sh3IconName` union type updates automatically.

### Component API

```ts
@Component({ selector: 'sh3-icon' })
export class IconComponent {
  readonly name  = input.required<Sh3IconName>(); // typed → autocomplete + compile error on typo
  readonly size  = input<Sh3IconSize>('md');      // 'xs'|'sm'|'md'|'lg'|'xl' or pixel number
  readonly title = input<string>();               // a11y label (sets aria-label, otherwise aria-hidden)
}
```

### Sizing

Presets map to CSS pixel values via `--icon-size`:

| Preset | Pixels |
|--------|--------|
| `xs` | 12 |
| `sm` | 16 |
| `md` (default) | 20 |
| `lg` | 24 |
| `xl` | 32 |

Pass a number for anything off-grid:

```html
<sh3-icon name="search" />
<sh3-icon name="bin" size="lg" />
<sh3-icon name="heart" [size]="18" />
<sh3-icon name="check-circle" [size]="48" />
```

### Theming

SVG files are authored single-colour with `fill: currentColor` (`stroke="currentColor"` for outlined ones). The icon inherits the host's `color`, so styling is just:

```scss
.danger-btn sh3-icon {
  color: var(--color-alert);
}
```

No `[color]` input — go through the cascade. Same for hover states, active states, etc.

### Adding an icon

1. Drop `<name>.svg` in the matching category folder under `src/assets/icons/`.
   - Single-colour, `currentColor` on `fill`/`stroke`, no hardcoded width/height.
   - viewBox `0 0 24 24` is the convention (anything else works but stays consistent).
2. Import + register in `src/app/shared/icon/icon.registry.ts`:
   ```ts
   import myIcon from '../../../assets/icons/ui/my-icon.svg';

   export const SH3_ICONS = {
     // …existing entries…
     'my-icon': myIcon,
   } as const;
   ```
3. Use it: `<sh3-icon name="my-icon" />` — TypeScript autocompletes the name and rejects typos.

### Anti-patterns

- **Inline `<svg>` in templates** — even tiny ones. If it's worth rendering, it's worth being in the registry. The only legitimate exception today is `tab-nav.component.html` which renders a path string injected via `[attr.d]="tab.icon"` (the caller — not the icon system — owns the path).
- **`<mat-icon>` from `@angular/material/icon`** — removed from the app. `MatIconButton` (the wrapper button) is fine; it's a different concept.
- **Hardcoded `width`/`height` attributes inside the SVG file** — sizing is the host's job via `--icon-size`. Strip them from any new icon.
- **Using a raw `string` for `name`** — defeats compile-time safety. Always type your menu items / props with `Sh3IconName`.

### Taxonomy guidance (when in doubt where to put an icon)

| Folder | Owner intent | Examples |
|--------|--------------|----------|
| `ui/` | A control or verb that exists on most surfaces. No domain knowledge needed to understand it. | `close`, `chevron-down`, `edit`, `eye`, `lock` |
| `nav/` | Top-level app chrome — the sidebar / header / theme system / notifications. | `home`, `bell`, `theme-dark` |
| `music/` | Specific to music — transport controls, instruments, ratings. | `play`, `metronome`, `heart`, `fire` |
| `status/` | A badge or pill that conveys state on its own. | `completed`, `clock`, `lightning` |
| `people/` | Roles, hierarchy, work context. | `king`, `leader`, `team`, `briefcase` |
| `brands/` | Third-party logos. Single-colour where possible. | `slack`, `discord` |

If a new icon doesn't obviously fit, add a folder. The taxonomy is meant to evolve.

---

## Component styles

Every component has a colocated `.component.scss` with Angular's default `ViewEncapsulation.Emulated`.

### Rules

1. **Use CSS variables for all visual values** — never hardcode colours, sizes, shadows.
   ```scss
   // Good
   color: var(--text-primary);
   border-radius: var(--radius-md);

   // Bad
   color: #eef1ff;
   border-radius: 10px;
   ```

2. **Use mixins only when they genuinely help** — a mixin that wraps three lines of CSS with no cross-cutting concern is indirection for nothing.

3. **No Tailwind** — no `@apply`, no utility classes in templates, no `@theme` blocks.

4. **Mobile-first overflow protection** on pages that fill the viewport:
   ```scss
   :host {
     display: block;
     width: 100%;
     max-width: 100%;
     overflow: hidden;
   }
   ```

5. **Breakpoints** (convention, not enforced):
   - `768px` — tablet/mobile switch (sidebars collapse to top, grids simplify)
   - `520px` — form grid collapse (2-col → 1-col)
   - `480px` — phone tightening (reduced padding)

---

## Main layout grid (`main-layout.component`)

Root app layout uses CSS Grid with named areas:

```
Desktop (>768px):            Mobile (≤768px):
┌──────┬───────────────┐    ┌───────────────────┐
│header│    header      │    │      header        │
├──────┼───────────────┤    ├───────────────────┤
│ menu │    content     │    │      content       │
│ 56px │               │    │                   │
└──────┴───────────────┘    └───────────────────┘
```

Grid areas are assigned via class names in the component SCSS (`.area-header`, `.area-menu`, `.area-content`), not utility classes.

---

## Shared UI primitives

Actively used shared components (see [sh3-shared-components.md](sh3-shared-components.md) for the full catalogue):

- `sh3-button` — Button (solid / ghost / outline, sizes)
- `sh3-badge` / `sh3-status-badge` — Status + generic badges
- `sh3-avatar` — User avatar
- `sh3-inline-confirm` — Inline "are you sure?" chip
- `sh3-loading-state` / `sh3-empty-state` — Placeholder states
- `sh3-view-toggle` — List/grid view switcher
- `sh3-pill-selector` — Pill-style multi/single selector
- `sh3-dialog-context` — Modal host
- `sh3-configurable-tab-bar` — Tab bar with reorder / config save / color picker

Always check `app/shared/` before building a new visual primitive.

---

## PostCSS

PostCSS is still used for **autoprefixer** only (`.postcssrc.json`). No other plugins.

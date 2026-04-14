# SH3PHERD Frontend — Styling Architecture

This document describes how styles are organized in the Angular frontend.  
Tailwind CSS was removed — the project uses **CSS custom properties (tokens) + SCSS mixins + Angular component styles** exclusively.

---

## Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Design tokens** | CSS custom properties | Colors, spacing, typography, shadows, radii, layout |
| **SCSS mixins** | Sass `@mixin` | Reusable layout patterns (forms, settings, scrollbars, tabs) |
| **SCSS tokens** | Sass `$variables` | Compile-time values for SCSS-only contexts (rare) |
| **Component styles** | Angular scoped SCSS | Per-component styles, encapsulated via `ViewEncapsulation.Emulated` |
| **Global styles** | `styles.scss` | Resets, CDK drag, form defaults, utility classes |

---

## File structure

```
src/
├── styles.scss                  ← Global entry point (imported by Angular CLI)
├── styles/
│   ├── _tokens.css              ← Design tokens (:root CSS vars, dark + light themes)
│   ├── _index.scss              ← Forwards SCSS tokens
│   ├── form.css                 ← Global .input-base class
│   ├── tokens/                  ← SCSS token modules
│   │   ├── index.scss           ← @forward barrel
│   │   ├── _colors.scss
│   │   ├── _layout.scss
│   │   ├── _forms.scss
│   │   ├── _buttons.scss
│   │   ├── _menus.scss
│   │   └── _tabs.scss
│   ├── mixins/                  ← Reusable SCSS mixins
│   │   ├── index.scss           ← @forward barrel
│   │   ├── _app-layout.scss
│   │   ├── _buttons.scss
│   │   ├── _forms.scss
│   │   ├── _scrollBars.scss
│   │   ├── _tabs.scss
│   │   └── _settings-layout.scss
│   └── themes/                  ← (empty — reserved for future theme overrides)
```

---

## Design tokens (`_tokens.css`)

Single source of truth for all visual values. Defines a `:root` block with the **dark theme** as default, then a second `:root` block (at the end of the file) overrides for the **light theme**.

### Token categories

| Category | Examples | Naming |
|----------|---------|--------|
| Backgrounds | `--content-page-bg-color`, `--card-color`, `--panel-color` | `--<surface>-color` |
| Borders | `--panel-border-color`, `--divider-color` | `--<role>-border-color` |
| Accent | `--accent-color`, `--accent-color-dim`, `--accent-color-faded` | `--accent-color-<variant>` |
| Semantic | `--color-warning`, `--color-alert`, `--color-success`, `--color-info` | `--color-<intent>-<variant>` |
| Text | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-faded` | `--text-<weight>` |
| Typography | `--text-xs` … `--text-xl` | `--text-<size>` |
| Radius | `--radius-xs` … `--radius-round` | `--radius-<size>` |
| Shadows | `--shadow-xs` … `--shadow-xl`, `--shadow-floating` | `--shadow-<size>` |
| Transitions | `--t-fast`, `--t-base`, `--t-slow`, `--t-spring` | `--t-<speed>` |
| Layout | `--h-header`, `--w-appMenu`, `--sidePanel-w` | `--<dimension>-<element>` |

### Legacy theme variables (`styles.scss`)

A small set of `--color-*` variables are defined in `styles.scss :root` (light defaults) with `[data-theme="dark"]` overrides. These predate the token system and are only used in `main-layout` and `form.css`. **New code should use `_tokens.css` variables.**

| Variable | Used in | Equivalent token |
|----------|---------|-----------------|
| `--color-background` | — (migrated) | `--content-page-bg-color` |
| `--color-surface` | `form.css` | `--card-color` |
| `--color-baseText` | — | `--text-primary` |

---

## SCSS mixins (`src/styles/mixins/`)

Imported in components via `@use "mixins" as m;`.

| Mixin | File | Purpose |
|-------|------|---------|
| `m.settings-inline($sidebar-width)` | `_settings-layout.scss` | Sidebar + content flex layout for settings pages |
| `m.settings-content` | `_settings-layout.scss` | Scrollable content panel styles |
| `m.settings-responsive` | `_settings-layout.scss` | Mobile collapse (≤768px sidebar→top, ≤480px tighter padding) |
| `m.scrollbar($width, ...)` | `_scrollBars.scss` | Custom thin scrollbar (Webkit + Firefox) |
| `m.form-section-title` | `_forms.scss` | Uppercase section heading for forms |
| `m.form-container($display)` | `_forms.scss` | Centered form wrapper |
| `m.form-block` | `_forms.scss` | Card-like form section |
| `m.form-grid($columns)` | `_forms.scss` | Responsive grid for form fields |
| `m.flexRow($justify)` | `_app-layout.scss` | Quick flex-row helper |
| `m.listItemLayout` | `_app-layout.scss` | Standard list item card |
| `m.baseTab` | `_tabs.scss` | Tab button base styles |

### How to use in a component

```scss
@use "tokens" as t;     // SCSS-time tokens (rare)
@use "mixins" as m;      // Reusable layout patterns

:host { display: block; }

.settings-inline { @include m.settings-inline; }
.settings-content { @include m.settings-content; }
@include m.settings-responsive;
```

---

## Component styles

Every component has a colocated `.component.scss` file with Angular's default `ViewEncapsulation.Emulated`.

### Rules

1. **Use CSS variables for all visual values** — never hardcode colors, sizes, or shadows.
   ```scss
   // Good
   color: var(--text-primary);
   border-radius: var(--radius-md);
   
   // Bad
   color: #eef1ff;
   border-radius: 10px;
   ```

2. **Use mixins for repeated layout patterns** — check `src/styles/mixins/` before writing layout CSS.

3. **No Tailwind** — no `@apply`, no utility classes in templates, no `@theme` blocks.

4. **Mobile-first overflow protection** — on pages that fill the viewport:
   ```scss
   :host {
     display: block;
     width: 100%;
     max-width: 100%;
     overflow: hidden;
   }
   ```

5. **Breakpoints** (convention, not enforced):
   - `768px` — tablet/mobile switch (sidebar collapses, grid simplifies)
   - `480px` — phone tightening (reduced padding, card simplification)
   - `520px` — form grid collapse (2-col → 1-col)

---

## Main layout grid (`main-layout.component`)

The root app layout uses CSS Grid with named areas:

```
Desktop (>768px):            Mobile (≤768px):
┌──────┬───────────────┐    ┌───────────────────┐
│header│    header      │    │      header        │
├──────┼───────────────┤    ├───────────────────┤
│ menu │    content     │    │      content       │
│ 56px │               │    │                   │
└──────┴───────────────┘    └───────────────────┘
```

Grid areas are assigned via CSS classes in the component SCSS (`.area-header`, `.area-menu`, `.area-content`), not Tailwind utilities.

---

## Shared components (`app/shared/`)

Always check shared components before creating new UI:

- `sh3-tab-nav` — Tab navigation bar (horizontal/vertical, underline/fill)
- `sh3-button` — Button (solid/ghost/outline, sizes)
- `sh3-input` — Form input
- `sh3-badge` / `sh3-status-badge` — Badges
- `sh3-avatar` — User avatar
- `sh3-toast-container` — Toast notifications
- `sh3-loading-state` / `sh3-empty-state` — Placeholder states

---

## PostCSS

PostCSS is still used for **autoprefixer** only (`.postcssrc.json`). No other plugins.

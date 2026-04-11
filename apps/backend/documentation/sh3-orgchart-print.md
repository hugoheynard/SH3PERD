# SH3PHERD — Orgchart Print Layer

This document focuses on the **print rendering layer** of the orgchart
export — the part that decides how the live `OrgchartTabComponent` is
transformed into a printable PDF. For the end-to-end architecture
(Puppeteer pool, print JWT, backend routes, client SVG sidecar), see
`sh3-orgchart-export.md`.

---

## Principle

The print layer reuses the **live** `OrgchartTabComponent` instead of
duplicating the layout. Pixel-identical by construction: the PDF is
literally the live tab rendered inside a Chromium window sized to the
target paper format, with edit affordances removed.

```
        /print/orgchart/:companyId
                 │
                 ▼
   OrgchartPrintComponent  (wrapper)
                 │
     ┌───────────┴───────────┐
     │                       │
     ▼                       ▼
 OrgChartStore          <app-orgchart-tab
 .setOrgChartDirect      [companyId]="cid"
 (from print-payload)    [printMode]="true">
```

### The `printMode` input signal

`OrgchartTabComponent.printMode: boolean` is an Angular input signal
that, when `true`:

- **Hides the top toolbar** (search, zoom, expand/collapse, archived
  toggle, export, new-root, edit-toggle button) via
  `@if (!printMode())` in the template.
- **Neutralises every mutating handler** — `toggleEditMode`,
  `onNodeClick`, `onKeydown`, `zoomIn/Out/resetZoom` all early-return.
  `editMode` stays `false` forever, which cascades into hiding every
  `@if (editMode())` gate (floating per-node toolbar, add-member icon,
  add-child dashed button, inline add form).
- **Auto-expands every node** via a constructor `effect()` that
  populates `expandedNodes` with every id when `printMode` is on and
  the store fills in. Without this, the PDF would only show roots.
- **Drops the runtime `transform: scale(...)` on the tree**, since the
  tab's zoom widget is inoperative in a static snapshot.

### The print wrapper

`OrgchartPrintComponent` is ~180 lines and does almost nothing visual
on its own:

1. Reads query params (`token`, `mode`, `cover`, `watermark`).
2. Short-circuits on SSR (Angular SSR is enabled project-wide and the
   auth interceptor returns `EMPTY` for protected URLs server-side —
   we'd deadlock the stability gate without this guard).
3. Fetches the view model from the public `print-payload` endpoint,
   sending `X-Print-Token` + `X-Skip-Auth` so the auth interceptor
   doesn't try to refresh a non-existent session.
4. Pushes the view model into `OrgChartStore.setOrgChartDirect`.
5. Renders `<app-orgchart-tab [printMode]="true" />` inside a
   `.print-page--chart` section. Optionally a cover page before and a
   watermark after.
6. Waits for the store to fill + `document.fonts.ready` +
   `img.decode()` on every image, then sets
   `window.__sh3_orgchartReady = true`. Puppeteer's backend listens for
   this flag before calling `page.pdf()`.

### The print SCSS (`orgchart-print.component.scss`)

Keeps only what the live tab can't know about:

- `@page` rules for A3 landscape (default), A2 landscape (poster mode),
  A3 portrait (cover page).
- Cover page layout (title, meta, date).
- Watermark positioning.
- `::ng-deep app-orgchart-tab { … }` overrides:
  - Remove the tab's internal scroll + height clamps so it flows
    naturally inside the page.
  - Disable all transitions/animations (Chromium prints mid-transition
    state otherwise).
  - Force `transform: none` on `.orgchart-tree`.
  - Hide any stray hover-only toolbars.
  - Force `break-inside: avoid` on node cards for poster mode.

Global design tokens (`--text-primary`, `--border-light`, `--accent-*`,
etc.) come from `src/styles.scss` which is loaded on every route,
including the print one — no re-declaration needed.

---

## Current state

| Item | Status |
|------|--------|
| Live component reuse via `printMode` | ✅ done |
| Single-use print JWT auth | ✅ done |
| SSR short-circuit in the wrapper | ✅ done |
| Auto-expand effect for full tree | ✅ done |
| Cover page | ✅ done |
| Watermark | ✅ done |
| Page header/footer (date + page numbers) | ✅ done (via Puppeteer templates) |
| Fit-to-page mode | ⚠️ works but illegible on large charts |
| By-root mode | ⚠️ never tuned against real varied chart shapes |
| Poster mode | ⚠️ may split cards across pages despite `break-inside: avoid` |
| Portrait orientation | ❌ option exists in the DTO but isn't wired to the CSS `@page` |
| Typography scaling per format | ❌ same card sizes on A4 as on A2 |
| Long-name / long-leader-list overflow | ❌ no handling |
| Theme-aware print (paper mode) | ❌ always dark theme |

---

## TODO — readability & format adaptation

This is the track to work on next. Everything below is layout-level
polish that doesn't touch the backend stack or the print/JWT auth.

### 1. Portrait / landscape orientation

- [ ] **Wire `landscape: false` end-to-end.** The DTO accepts it and
      Puppeteer's `page.pdf({ landscape })` honours it, but the CSS
      `@page` rule hardcodes `size: A3 landscape`. Switch to
      declaring the size dynamically — either via a `data-orientation`
      attribute on the `.print-page` that swaps `@page` blocks, or
      (simpler) by letting Puppeteer's `page.pdf({ landscape })` win
      since we pass `preferCSSPageSize: false` conditionally.
- [ ] **Portrait-specific tree layout.** Portrait A3/A4 is tall and
      narrow — the current horizontal tree layout wastes a lot of
      vertical space. Consider:
      - A vertical (top-down) tree where root → children flows
        left-to-right at each level instead of centered
      - OR a "compact" portrait layout with multi-column root nodes
        (columns of 2-3 roots per page)
- [ ] **Landscape-specific tree layout.** Landscape is wide and short —
      the current layout is already optimised for this, but test with
      deep hierarchies (5+ levels) where cards overflow vertically.
- [ ] **Orientation picker in the export modal.** Add a
      "Paper orientation" toggle once both orientations are real.

### 2. Readability across paper formats

Current problem: every format uses the same node card size (~220 px
wide), so:
- **A4** cramps the whole chart onto ~210 mm — illegible.
- **A3** is the sweet spot for small/medium charts.
- **A2/A1** leaves huge empty margins because cards don't scale up.

Work items:

- [ ] **Format-aware CSS variables.** Declare `--oc-card-width`,
      `--oc-card-height`, `--oc-font-size`, `--oc-gap` per format via a
      `data-format` attribute on the page container. Base values:

      | Format | Card width | Font size | H gap |
      |--------|------------|-----------|-------|
      | A4     | 140 px     | 10 px     | 10 px |
      | A3     | 180 px     | 12 px     | 14 px |
      | A2     | 240 px     | 14 px     | 20 px |
      | A1     | 320 px     | 18 px     | 28 px |

- [ ] **Propagate format + orientation to the print component** via
      query params (`format=A2&landscape=true`) and apply them as
      `data-*` attributes on `.print-page--chart` for CSS targeting.
- [ ] **Use `::ng-deep` overrides in print SCSS** to map those CSS
      variables onto the live orgchart-tab's card rules, rather than
      re-declaring the rules.

### 3. Fit-to-page mode — actual fit logic

Current behaviour: the wrapper computes a single uniform scale factor
from the tree's bounding box vs the page size. Works fine for
proportional trees, fails hard for anything unusual (very deep,
very wide, very top-heavy).

- [ ] **Minimum legibility floor.** If the computed scale drops below
      ~0.6, don't scale — instead, auto-switch to `by-root` and log a
      warning in the response header so the UI can surface it.
- [ ] **Two-axis fit.** Compute horizontal and vertical scale
      separately, pick the smaller, but apply padding correction so
      the result doesn't hug the page edges.
- [ ] **Text-size clamp.** After scaling, if `computed font-size * scale`
      falls below 8 px, bump fallback to `by-root` (same floor logic).

### 4. By-root mode — tuning

Works in theory (one page per root), not tested against real data.

- [ ] **Cover first page.** When the user opts in, page 1 is a
      whole-chart overview (fit), pages 2+ are per-root details.
- [ ] **Root-specific colour theming.** Each root page uses the root
      node's colour as the page accent (already passed via `--root-color`
      on the template — needs cover + header to pick it up).
- [ ] **Page headers per root.** "Company name — <Root name>" in the
      header, root colour as a stripe, so flipping pages is easy.
- [ ] **Small-root consolidation.** If a root has <5 descendants,
      consider packing multiple small roots onto a single page instead
      of one per sheet.

### 5. Poster mode — pagination across pages

Current setup uses `page-break-inside: avoid` on node cards but no
logic for splitting a wide tree across poster pages.

- [ ] **Test with a >50-node chart on A2.** Measure overflow and
      see if Chromium paginates gracefully or cuts mid-branch.
- [ ] **Horizontal continuation marker.** If a branch splits across a
      page break, draw a "continues →" arrow on the overflow edge.
- [ ] **Branch-aware pagination.** Consider walking the tree and
      inserting explicit `page-break-before: always` at high-level
      siblings so cuts happen at logical boundaries.

### 6. Content overflow inside cards

Right now:
- Long node names truncate with `text-overflow: ellipsis` — good
- Long leader lists (3+ directors/managers) overflow horizontally — bad
- Communication icons row can push content below the card

- [ ] **Multi-line name wrapping** on cards in portrait mode, where
      vertical space is cheap but horizontal is expensive.
- [ ] **Leader list truncation** — show max 3 leaders + "+N" badge.
- [ ] **Communication icons inline** with leaders instead of in a
      separate row to save vertical space.
- [ ] **Avatar row compaction** — use `display: grid` with
      `auto-fit` so avatars wrap instead of clipping.

### 7. Theme-aware print ("paper" mode)

The current print layout inherits the dark theme of the live app.
Some clients will want a light, ink-friendly version.

- [ ] **Paper theme toggle** in the export modal (default: dark,
      alt: paper).
- [ ] **Paper theme SCSS override** that swaps the token values on
      `:root[data-print-theme="paper"]` — black text on white, lighter
      borders, no box-shadows, higher-contrast accent colours.
- [ ] **Keep dark as the default** — it matches what users see on
      screen and is the common case for digital sharing.

### 8. Localisation

- [ ] **Cover page labels** — "Generated on…", layer names, "No nodes
      yet" should pick up the current user's locale.
- [ ] **Page header/footer templates** in the backend — same.
- [ ] **Number formatting** on cover stats (5 437 vs 5,437).

### 9. Diagnostics & observability

- [ ] **Render telemetry** — log the scale factor chosen in fit mode,
      the card count per page in by-root mode, and the overflow
      detection state, so we can see the long tail of "it looked bad"
      cases in production.
- [ ] **Health check** — an admin endpoint that renders a known
      fixture chart and asserts the output PDF has the expected page
      count + byte-size bounds. Caught by a cron that alerts on drift.

---

## Long-term: migrating from Puppeteer to Playwright

**Playwright** is the Microsoft-maintained fork of Puppeteer, built by
the same core team that originally wrote Puppeteer at Google and then
left for Microsoft. It targets the same use case (driving a headless
browser from Node.js) but has matured faster and addressed several
Puppeteer pain points head-on. We should consider switching once this
feature is stable.

### Why it's worth considering

| Concern | Puppeteer | Playwright |
|---------|-----------|------------|
| Browser coverage | Chromium only (Firefox/WebKit experimental, never fully supported) | Chromium + Firefox + WebKit, first-class for all three |
| Auto-waiting | Manual `waitForFunction`/`waitForSelector` everywhere | Built-in — assertions auto-retry until the condition holds |
| Network interception | Works, but awkward API | Much cleaner `page.route()` API |
| Download handling | Clunky, event-based | Typed `download` object with `saveAs()` |
| Context isolation | One `BrowserContext` per browser, no easy way to reset cookies without a full re-launch | Cheap `browser.newContext()` — our pool could hand out contexts instead of browsers |
| Type definitions | Reasonable, some gaps | Strictly typed end-to-end, including `ConsoleMessage.type()` |
| Debugging | DevTools + logs | DevTools + **Trace Viewer**: step-by-step replay of the whole session with DOM snapshots, network, console, actions |
| Test runner | None built-in | Bundled `@playwright/test` with fixtures, workers, HTML reports |
| Release cadence | Slower | Weekly-ish, patches land quickly |

For our specific use case (driving our own frontend to print a PDF),
the features that matter most are:

- **Cheap contexts** — `browser.newContext()` is ~50 ms instead of
  ~700 ms for a new browser. Our `PuppeteerPoolService` could become
  a context pool over a single long-lived browser, which is dramatically
  more memory-efficient and faster on burst load.
- **Auto-waiting** — we'd no longer need the explicit
  `window.__sh3_orgchartReady` flag. `page.waitForLoadState('networkidle')`
  plus `page.waitForSelector('.oc-node-card')` would be enough, and
  the backend wouldn't care what our app's stability signal looks like.
- **Trace Viewer** — when a render fails in prod, we could ship the
  trace to local dev and replay the whole session (navigation, console,
  network, DOM) visually. Beats `console.error` spam by a mile.

### What would change in our code

Mostly a one-to-one translation, one file at a time:

1. **`PuppeteerPoolService` → `PlaywrightContextPoolService`.**
   Instead of pooling browsers, pool `BrowserContext` instances
   derived from a single `chromium.launch()`. Lifecycle hooks map
   cleanly (`context.close()` ≡ `browser.close()` for our purposes).

2. **`OrgchartPdfService`.** The `page.pdf()` signature is nearly
   identical. `emulateMediaType('print')` is the same. The only real
   diff is we can drop the readiness flag plumbing and replace it
   with Playwright's built-in auto-wait.

3. **DI tokens.** Rename `PUPPETEER_POOL_SERVICE` →
   `BROWSER_POOL_SERVICE` so the token isn't tied to a specific
   implementation — future swap is easier.

4. **Dependency swap.** `puppeteer` → `@playwright/test` (or just
   `playwright` if we don't need the test runner). Playwright ships
   its own browser binaries via `npx playwright install` — same
   UX as `puppeteer browsers install` but with a separate cache
   path, which means a clean switch without touching
   `~/.cache/puppeteer`.

5. **No change to the print route, the print JWT, the wrapper
   component, or the SCSS.** The frontend side is decoupled from
   the backend rendering engine. That's why splitting concerns the
   way we did was worth the effort.

### Trade-offs

- **Bundle size.** Playwright's npm tarball is bigger because it
  includes driver binaries for three browsers by default. We only
  need Chromium, so setting `PLAYWRIGHT_BROWSERS_PATH` and running
  `npx playwright install chromium` (not `install`) keeps the disk
  footprint comparable to Puppeteer.
- **Container setup.** Slightly different system-library checklist
  than Puppeteer. Playwright documents its exact requirements and
  publishes an official Docker base image
  (`mcr.microsoft.com/playwright`) that's a drop-in replacement.
- **Learning curve.** API differences are small but real. Worth
  one focused afternoon of re-reading the relevant pieces before
  migrating.
- **Lock-in.** Playwright is Microsoft-maintained; Puppeteer is
  Google-maintained. Neither is going away, but Google has been
  visibly less interested in Puppeteer since the core team left.

### Migration strategy (when we pull the trigger)

- [ ] **Feature-flagged swap.** Add a second service
      `PlaywrightPdfService` behind a `PRINT_ENGINE=playwright|puppeteer`
      env flag. Run both in dev for a week to compare outputs on
      a fixture chart.
- [ ] **Diff tool.** Render the same chart with both engines, diff
      the resulting PDFs via `pdf-diff` or a pixel comparison against
      a PNG export. We need confidence that the migration doesn't
      silently break existing exports.
- [ ] **Swap the dependency.** Remove `puppeteer` from
      `package.json`, install `playwright`, rename the DI token,
      delete the old service.
- [ ] **Update the docs** (`sh3-orgchart-export.md` + this file) and
      the deployment recipe (container base image, system libs).

Overall this is **a 1-2 day job once we decide to do it**. Not
urgent, but worth keeping in mind as the stable long-term home of
the rendering stack. The best time to do it is probably right
after we've nailed readability (section 2 above) — once the layout
is stable, swapping the engine beneath it is much safer.

---

## File map

| File | Role |
|------|------|
| `orgchart-print/orgchart-print.component.ts` | Wrapper: param parsing, data fetch, ready signal |
| `orgchart-print/orgchart-print.component.html` | Cover + chart page scaffolding |
| `orgchart-print/orgchart-print.component.scss` | `@page` rules, cover, watermark, `::ng-deep` overrides on live tab |
| `company-detail-page/orgchart-tab/orgchart-tab.component.ts` | Live tab — owns `printMode` input + auto-expand effect + handler guards |
| `company-detail-page/orgchart-tab/orgchart-tab.component.html` | Toolbar wrapped in `@if (!printMode())` |
| `orgchart.store.ts` | `setOrgChartDirect()` used by the print wrapper |

---

## Related docs

- `sh3-orgchart-export.md` — full export pipeline (Puppeteer pool,
  print JWT, backend controllers, ops considerations)
- `sh3-orgchart.md` — live orgchart features + roadmap

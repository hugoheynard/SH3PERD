# SH3PHERD — Orgchart Export

High-fidelity PDF and SVG export for the company orgchart.

## Goals

1. **Pixel-perfect PDF** — re-use the real Angular rendering inside headless
   Chromium so the exported file looks identical to what the user sees.
2. **Multiple pagination strategies** — small charts on one page, large
   charts across one-page-per-root, huge charts as a poster sheet.
3. **Zero duplication of layout** — the print route is a sibling of the
   live orgchart tab, not a re-implementation.
4. **Instant client-side fallback** — a pure-SVG exporter that needs no
   server round-trip, for vector-perfect copies and for environments
   without Chromium.
5. **Secure** — headless Chromium should never see a user session; it
   authenticates via a short-lived, single-use print token.

---

## High-level architecture

```
┌──────────────────┐           ┌────────────────────────────┐
│ Orgchart tab     │  opens    │ Orgchart export modal      │
│  (Angular)       │──────────▶│  PDF fit | by-root | poster │
└──────────────────┘           │  SVG vector                 │
                               └──────────────┬──────────────┘
                                              │
       ┌──────────────────────────────────────┴─────────────────┐
       │                                                        │
       ▼ (PDF)                                                  ▼ (SVG)
┌──────────────────────┐                         ┌──────────────────────┐
│ POST /companies/:id/ │                         │ OrgchartSvgExporter  │
│ orgchart/export      │                         │  (browser-side)      │
└──────────┬───────────┘                         └──────────┬───────────┘
           │                                                 │
           ▼                                                 ▼
┌──────────────────────┐                        ┌──────────────────────┐
│ OrgchartPdfService   │                        │ svg.Blob → download  │
│  PuppeteerPool       │                        └──────────────────────┘
│  PrintTokenService   │
└──────────┬───────────┘
           │  launches Chromium, opens
           ▼
┌──────────────────────┐
│ /print/orgchart/:id  │   (Angular, standalone route)
│  OrgchartPrintCmp    │   ─── loads via GET print-payload endpoint
└──────────┬───────────┘
           │  fetches the view model (public endpoint + print token)
           ▼
┌──────────────────────┐
│ GET /companies/:id/  │
│ orgchart/print-      │   validates + consumes print token (single-use)
│ payload              │
└──────────────────────┘
```

---

## Endpoints

### `POST /protected/companies/:id/orgchart/export`

Authenticated (bearer token), contract-scoped, requires `P.Company.OrgChart.Read`.

**Request body** (all fields optional):

| Field              | Type    | Default            | Notes |
|--------------------|---------|--------------------|-------|
| `pagination`       | enum    | `'fit'`            | `'fit'` \| `'by-root'` \| `'poster'` |
| `format`           | enum    | `'A3'` (poster: `'A2'`) | `A4`/`A3`/`A2`/`A1`/`Letter`/`Legal` |
| `landscape`        | boolean | `true`             | |
| `withHeaderFooter` | boolean | `true`             | Date + page numbers |
| `withCoverPage`    | boolean | `true`             | Cover sheet with company stats |
| `watermark`        | string  | —                  | Max 120 chars |

**Response**: `application/pdf` stream with attachment disposition and
three telemetry headers:

- `X-Orgchart-Pages` — page count of the output
- `X-Orgchart-Pagination` — mode actually used
- `X-Orgchart-Format` — paper format actually used

### `GET /protected/companies/:id/orgchart/print-payload`

**Public** (`@Public()`), validated by the `PrintTokenService`. Called
exclusively by the `OrgchartPrintComponent` from inside headless Chromium.

**Auth**: either `?token=<jwt>` or `X-Print-Token: <jwt>` header. The
token is consumed on first successful call — a replay attempt fails
with 401.

**Response**: the same `TCompanyOrgChartViewModel` the authenticated
`GET /:id/orgchart` endpoint returns, so the print route can reuse the
existing view model type.

---

## Pagination modes

### `fit` (default)

Every node of the chart fits on **one landscape sheet** (A3 by default).
The print component computes a uniform scale factor from the rendered
tree's bounding box so deep/wide charts are shrunk to fit.

- **Use for**: charts up to ~40 leaf nodes.
- **Trade-off**: very large charts become illegible — switch to
  `by-root` or `poster` instead.

### `by-root`

One A3 page **per top-level (root) node**. Useful when a company has
multiple independent departments and you want each on its own sheet,
at natural size.

- **Use for**: charts with >3 roots or >60 nodes.
- **Cover sheet** (optional) remains one page regardless.

### `poster`

A single large sheet (A2 by default, configurable up to A1) with the
whole tree rendered at natural size. Chromium paginates with
`page-break-inside: avoid` on cards — on truly enormous charts you
get a multi-page poster.

- **Use for**: wall prints, architectural displays, event briefings.

---

## Print-only route (`/print/orgchart/:companyId`)

A **standalone Angular route** loaded outside the `/app` authenticated
shell. Does not use the `authGuard`, does not render the main layout,
does not carry cookies. It:

1. Reads `token`, `mode`, `cover`, `watermark` from the query string.
2. Calls `GET …/print-payload` with the token.
3. Renders a **stripped-down, read-only** orgchart (no toolbar, no
   edit affordances, no drag/drop, no popover).
4. Waits for fonts (`document.fonts.ready`) and images (`img.decode()`)
   to settle, then sets `window.__sh3_orgchartReady = true`.
5. `OrgchartPdfService` in the backend polls this flag via
   `page.waitForFunction('window.__sh3_orgchartReady === true')`
   before calling `page.pdf()`.

Failure mode: if the token is invalid or the data load errors out, the
component renders an error block and **never sets** the readiness flag.
Puppeteer's wait then times out, the backend surfaces a 500, the client
sees a failed export. We never render half a chart.

---

## Security model

### Print token (JWT)

Symmetric **HS256** JWT, signed with `PRINT_SECRET` (falls back to
`JWT_PRIVATE_KEY` in dev).

**Payload**:
```json
{
  "scope": "orgchart",
  "companyId": "company_abc-123",
  "actorId": "user_xyz-456",
  "jti": "550e8400-…",
  "iat": 1712835432,
  "exp": 1712835552
}
```

**Invariants**:
- **TTL 120 s** — enough to let Chromium boot and print, tight enough
  to bound replay risk.
- **Scoped** — a token minted for `scope: 'orgchart'` is rejected for
  any other resource (e.g. a future `scope: 'contract'`).
- **Single-use** — a verified `jti` is stored in an in-memory blacklist
  until it expires. Replays are rejected.
- **Company-bound** — the token carries `companyId`. The read endpoint
  compares it against the URL param and rejects mismatches to prevent
  cross-company peeking via path manipulation.

### Why not reuse the user's access token?

1. **Process isolation** — the access token is bound to a logged-in
   browser session. Injecting it into Puppeteer means leaking it to a
   subprocess that loads our own frontend code, which increases the
   attack surface if any XSS is ever found in that route.
2. **Blast radius** — the access token is a full-power JWT (15-minute
   TTL, any permission the user has). The print token is a 120-second,
   single-scope, single-use token.
3. **Logging** — the access token appears in request logs, referer
   headers, etc. The print token is expected to appear only in a single
   internal GET and we intentionally do not log its JTI.

### What a print token cannot do

- Call any other endpoint (rejected by `AuthGuard` because it's not a
  user JWT — the print endpoints are `@Public()` and use `PrintTokenService`
  directly).
- Be reused (single-use store).
- Be minted by anyone who doesn't have `P.Company.OrgChart.Read` on
  the target company (checked before `sign()` is called).

---

## Puppeteer pool

`PuppeteerPoolService` keeps `PRINT_POOL_SIZE` (default **2**)
long-lived Chromium instances around. Each job:

1. **Acquires** a browser (blocks on FIFO queue if all are busy).
2. **Creates a fresh page** — never reuses pages, so state can't leak.
3. **Runs** the caller's `fn(page)` closure.
4. **Closes** the page and **releases** the browser back to the pool.
5. If the browser crashed mid-job, it's disposed and the next waiter
   gets a freshly spawned instance.

**Chromium launch flags**:

```
--no-sandbox --disable-setuid-sandbox
--disable-dev-shm-usage --disable-gpu --no-zygote
--font-render-hinting=none
--disable-background-timer-throttling
--disable-backgrounding-occluded-windows
--disable-renderer-backgrounding
```

The throttling flags matter: the readiness signal relies on `setTimeout`
/ `requestAnimationFrame` which Chromium would throttle in a background
tab. Without them, exports hang at `waitForFunction`.

---

## Configuration

| Env var                      | Default        | Meaning |
|------------------------------|----------------|---------|
| `PRINT_SECRET`               | `JWT_PRIVATE_KEY` (fallback) | HMAC secret for print JWTs |
| `CHROMIUM_EXECUTABLE_PATH`   | —              | Override bundled Chromium (Alpine, Lambda, slim containers) |
| `PRINT_POOL_SIZE`            | `2`            | Max concurrent renders |
| `PRINT_PAGE_TIMEOUT_MS`      | `30000`        | Navigation + default timeout |
| `PRINT_READY_TIMEOUT_MS`     | `20000`        | Time allowed for the page to set the readiness flag |
| `FRONTEND_URL`               | `http://localhost:4200` | Origin used to build the print URL — must be reachable from the backend |

---

## Client-side SVG sidecar

`OrgchartSvgExporter` (in `apps/frontend-webapp/src/app/features/company/`)
is a **pure-browser** exporter:

- Walks the orgchart view model, computes subtree widths with a classic
  Reingold-Tilford-ish layout.
- Emits an SVG document with `<rect>`, `<text>`, `<path>` for
  connectors, root cards, and children cards.
- Embeds its own font stack and drop-shadow filter.
- Produces a `Blob` ready to download via `URL.createObjectURL`.

It does **not** reuse the runtime CSS — that would require cloning every
live style into SVG-compatible attributes, which is neither cheap nor
reliable. What you get is a faithful **structural** representation:
names, hierarchy, root colours, member counts, leader badges.

### When to use it

- You want **instant** export (no network, no pool, no wait).
- You want **vectorial** output for embedding in Keynote / Figma /
  printed posters.
- Puppeteer is unavailable (API worker without Chromium, CI, Lambda
  cold start you want to skip).

### When NOT to use it

- You need a **multi-page** document with headers/footers — use PDF.
- You need **pixel fidelity** to the live UI — use PDF.

---

## Frontend integration

The orgchart tab has an **Export** button in its toolbar (download icon,
next to the archived-toggle). Clicking opens the
`OrgchartExportModalComponent` which:

1. Lets the user pick one of four modes (fit / by-root / poster / svg).
2. For PDF: exposes paper format, orientation, cover page toggle,
   header/footer toggle, optional watermark.
3. On confirm, calls `OrgchartExportService.exportOrgchartPdf` (PDF) or
   `OrgchartSvgExporter.toBlob` (SVG).
4. Downloads the resulting `Blob` with a derived filename
   (`orgchart-<slug>-<YYYY-MM-DD>.pdf`).

The service uses `http.post(..., { responseType: 'blob', observe: 'response' })`
directly — `ScopedHttpClient` doesn't expose the blob response type, so
the `X-Contract-Id` header is added by hand from `UserContextService`.

---

## File layout

### Backend

```
apps/backend/src/print/
├── api/
│   └── orgchart-export.controller.ts   — POST export + GET print-payload
├── services/
│   ├── PrintTokenService.ts            — sign/verify/consume single-use JWTs
│   ├── PuppeteerPoolService.ts         — browser pool (N instances)
│   └── OrgchartPdfService.ts           — renders the print URL to PDF
├── print.module.ts                     — Nest module wiring
└── print.tokens.ts                     — DI symbols
```

Wired into `app.module.ts` via `RouterModule.register([{ path: '', module: PrintModule }])`
under the `/protected` prefix, and declared as an import on the same module.
Added to `configuration.ts` under the `print.*` namespace.

### Frontend

```
apps/frontend-webapp/src/app/features/company/
├── orgchart-export.service.ts          — POSTs export request, handles blob + headers
├── orgchart-svg-exporter.ts            — zero-dep, zero-network SVG renderer
├── orgchart-export-modal/              — mode picker + PDF options
│   ├── orgchart-export-modal.component.{ts,html,scss}
└── orgchart-print/                     — print-only route (loaded by Chromium)
    ├── orgchart-print.component.{ts,html,scss}
```

Route registered in `app.routes.ts` at `/print/orgchart/:companyId`, no
auth guard. Export modal hosted inside `orgchart-tab.component.html`
next to the existing move-to modal, so both modals share the same
positional parent.

---

## Operational considerations

### Memory

Chromium is the dominant cost. Each browser in the pool consumes
~150-250 MB idle, ~400-800 MB on a large render. With the default
`PRINT_POOL_SIZE=2` the print module uses ~500 MB steady-state on a
busy instance. Bump or lower `PRINT_POOL_SIZE` accordingly.

### Containers

Install Chromium at build time via the bundled Puppeteer download
(default) or set `CHROMIUM_EXECUTABLE_PATH` to a system Chromium.
Slim containers also need:

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
    libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
    libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 \
    libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 \
    libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
    libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 \
    libxtst6 lsb-release wget xdg-utils
```

### Scaling horizontally

The single-use token store is in-memory — if you run multiple backend
replicas, tokens can only be consumed on the replica that minted them.
That's fine as long as the client hits the same replica for the
`POST /export` and the embedded Chromium call, which is the default
when the UI initiates the export. For stricter replay protection,
swap the `Map<jti, expiresAt>` in `PrintTokenService` for a Redis store.

### Observability

Every successful render logs:

```
[OrgchartPdfService] orgchart export done company=<id> pages=<n> mode=<mode> format=<fmt>
```

Failures log the underlying error *without* the JWT:

```
[OrgchartExportController] orgchart export failed company=<id>: <message>
```

Expose the `X-Orgchart-*` response headers through your APM of choice
to track pagination-mode usage and average page counts.

### Tests

- **Unit**:
  - `PrintTokenService.sign` → `verify` roundtrip, replay rejection,
    scope mismatch, cross-company rejection.
  - `OrgchartSvgExporter.render` snapshot on fixture charts.
- **E2E**:
  - POST the export endpoint with a seeded company, assert
    `response.headers['content-type'] === 'application/pdf'`,
    `body.byteLength > 1000`, `X-Orgchart-Pages >= 1`.
  - Parse the PDF with a lightweight lib (`pdfjs-dist`) and assert the
    company name appears in the extracted text.
- **Contract**: the print-payload endpoint should reject requests
  without a token, with an invalid token, with a valid token for the
  wrong company, and with a used token.

---

## Future work

- **Redis-backed single-use store** for multi-replica deployments.
- **Pre-warmed print worker** — dedicate one container to Puppeteer,
  scale it independently via a queue (BullMQ) so API latency stays
  predictable under burst load.
- **Scheduled snapshots** — weekly PDF emailed to the owner, stored in
  S3, diffable from one snapshot to the next.
- **Theme-aware export** — let the user pick between the current app
  theme and a print-optimised "paper" theme (black on white).
- **Localisation** — cover page and chart headers should pick up the
  current user's locale instead of hardcoded English.

# SH3PHERD — Claude Code Onboarding

## First thing to do in every new session

Read ALL documentation files in both locations before starting any work:
1. `apps/backend/documentation/` — technical architecture docs
2. `documentation/` — process docs, TODOs, feature roadmaps

This is mandatory — the docs contain architecture decisions, conventions, and domain context
that are essential for making correct changes.

## Documentation convention

The monorepo has two documentation locations with distinct purposes:

- **`apps/backend/documentation/`** = **Technical only** — architecture, patterns, how-to guides, module design. No TODOs, no feature tracking, no roadmaps.
- **`documentation/`** = **Process & planning** — TODOs, feature roadmaps, status tracking, open questions, user flows.

When creating new docs, respect this separation. A technical doc about how a system works goes in backend. A TODO tracking what needs to be built goes in documentation/todos/.

## Technical docs (apps/backend/documentation/)

| Doc | Path | Description |
|-----|------|-------------|
| **README** | `apps/backend/documentation/README.md` | Technical documentation index |
| **Auth System** | `apps/backend/documentation/sh3-auth-system.md` | Complete auth: login, tokens, password, security hardening (Mermaid diagrams) |
| **Auth & Context** | `apps/backend/documentation/sh3-auth-and-context.md` | Request pipeline: `@ContractScoped`, `@PlatformScoped`, `@RequirePermission`, `P` object |
| **Writing a Controller** | `apps/backend/documentation/sh3-writing-a-controller.md` | Complete guide: scope, permissions, Swagger, CQRS, Zod-to-DTO pipeline |
| **Swagger Usage** | `apps/backend/documentation/sh3-swagger-usage.md` | Zod-first DTOs, `apiSuccessDTO`, response envelope |
| **Error Handling** | `apps/backend/documentation/sh3-error-handling.md` | DomainError, BusinessError, TechnicalError, GlobalExceptionFilter |
| **Dev Setup** | `apps/backend/documentation/sh3-dev-setup.md` | RSA keys, JWT config, env variables |
| **Platform Contract** | `apps/backend/documentation/sh3-platform-contract.md` | SaaS subscription model, dual contract model (platform vs company) |
| **Quota Service** | `apps/backend/documentation/sh3-quota-service.md` | Quota enforcement: `ensureAllowed()` / `recordUsage()`, plan limits |
| **Analytics Events** | `apps/backend/documentation/sh3-analytics-events.md` | Append-only event store, event types, metadata, handler status |
| **Music Library** | `apps/backend/documentation/sh3-music-library.md` | Full music feature architecture, 14 features across 4 tiers |
| **Music Audio Player** | `apps/backend/documentation/sh3-music-audio-player.md` | wavesurfer.js inline player, peaks pipeline |
| **Music Mastering** | `apps/backend/documentation/sh3-music-mastering.md` | DeepAFx-ST AI mastering, ffmpeg loudnorm, pitch-shift |
| **Persona Match** | `apps/backend/documentation/sh3-persona-match.md` | AI event programming: extraction, scoring, curation (Claude API) |
| **Org Chart** | `apps/backend/documentation/sh3-orgchart.md` | Org chart features, API, architecture |
| **Orgchart Export** | `apps/backend/documentation/sh3-orgchart-export.md` | PDF/SVG export via headless Chromium |
| **Orgchart Print** | `apps/backend/documentation/sh3-orgchart-print.md` | Print layer reusing live component |
| **Contracts** | `apps/backend/documentation/sh3-contracts.md` | Contract aggregate diagram |
| **Calendar** | `apps/backend/documentation/sh3-calendar.md` | Event matrix, constraint programming |
| **Integrations** | `apps/backend/documentation/sh3-integrations.md` | Slack OAuth, channel management |
| **E2E Tests** | `apps/backend/documentation/sh3-e2e-tests.md` | MongoMemoryServer, test builders, factories |

## Process docs (documentation/)

| Doc | Path | Description |
|-----|------|-------------|
| **README** | `documentation/README.md` | Process documentation index |
| **Tech Debt** | `documentation/todos/TODO-tech-debt.md` | Urgent bugs, architectural debt, functional backlog |
| **Music Features** | `documentation/todos/TODO-music-features.md` | Music feature roadmap by phase |
| **Company Features** | `documentation/todos/TODO-company-features.md` | Company module: settings, org chart, contracts |
| **Guest to User** | `documentation/todos/TODO-guest-to-user.md` | Guest user activation flow (6 phases) |
| **Integrations** | `documentation/todos/TODO-integrations.md` | Slack integration roadmap |
| **Tab Bar** | `documentation/todos/TODO-configurable-tab-bar.md` | DnD bug fix, unit tests, component split |
| **Programs** | `documentation/todos/TODO-programs.md` | Drag engine refactoring |
| **Error Mgmt** | `documentation/todos/TODO-error-management.md` | Error class refactoring (completed) |
| **Usage & Credits** | `documentation/todos/TODO-usage-credits-events.md` | Usage tracking, credit packs, event store roadmap |
| **Plans Artist/Company** | `documentation/todos/TODO-plans-artist-company.md` | Plan matrix, pricing, feature matrix, migration |

## Monorepo structure

```
SH3PHERD/
  apps/
    backend/           — NestJS API (DDD, CQRS, MongoDB)
    frontend-webapp/   — Angular 21 (signals, standalone, SSR)
    audio-processor/   — NestJS micro-service (ffmpeg, essentia.js, DeepAFx-ST)
  packages/
    shared-types/      — Zod schemas + TypeScript types (shared across all apps)
    storage/           — R2/S3 storage utilities
```

## Documentation maintenance

Every code change must be reflected in the relevant documentation:
- **New endpoint or controller change** → update the technical doc in `apps/backend/documentation/` + Swagger decorators
- **New feature started or completed** → update the corresponding TODO in `documentation/todos/`
- **Architecture decision or pattern change** → update or create a technical doc in `apps/backend/documentation/`
- **New module or domain** → create a new technical doc following existing naming (`sh3-<module>.md`)

Documentation updates must be in the same commit as the code change (or in an immediately following `docs` commit). Never leave docs stale.

Use **Mermaid diagrams** (sequence, flowchart, state, graph) in technical docs to illustrate flows, architectures, and state machines. Diagrams complement text — they don't replace it. Every non-trivial flow should have both a diagram and a textual explanation.

## Commit rules

- **Atomic commits**: Split work into small, logically grouped commits. Each commit covers ONE concern (backend API, frontend component, docs, fix). Never batch unrelated changes.
- **Conventional commits**: `feat(scope)`, `fix(scope)`, `docs(scope)`, `refactor(scope)`. Message explains WHY, not just WHAT.
- **Example split**: 1) `feat(backend): add cross-library endpoint` 2) `feat(frontend): wire cross-library UI` 3) `docs: update music library roadmap`

## Swagger documentation

Every controller endpoint MUST have complete Swagger decorators following `apps/backend/documentation/sh3-writing-a-controller.md`:
- `@ApiOperation({ summary, description })`
- `@ApiResponse(apiSuccessDTO(...))`
- `@ApiParam` / `@ApiBody` where relevant
- Zod-derived DTOs from shared-types for payloads
- Responses wrapped in `TApiResponse<T>` via `buildApiResponseDTO()`

Swagger must be updated in the same commit as the controller change. Stale docs are not acceptable.

## Lint rules

- **Before working on a module**: if it is in the ESLint `ignores` list (`apps/backend/eslint.config.mjs`), REMOVE it from `ignores` first. Fix all existing lint errors in that module, then proceed with the feature work.
- **Before every commit**: run lint on the affected app(s) and fix all errors. Never commit code that fails lint.
  - Backend: `pnpm --filter @sh3pherd/backend lint`
  - Audio processor: `pnpm --filter @sh3pherd/audio-processor lint`
  - Frontend: `cd apps/frontend-webapp && npx tsc --noEmit`
- **Before every commit**: run tests on the affected app(s) and fix all failures. Never commit code with failing tests.
  - Backend: `pnpm --filter @sh3pherd/backend test`
  - Audio processor: `pnpm --filter @sh3pherd/audio-processor test`
- **No `eslint-disable` comments**: fix the root cause instead of suppressing the error.
- **Lint before commit is BLOCKING** — if lint fails, do NOT commit. Fix first.
- **Tests before commit are BLOCKING** — if any test fails, do NOT commit. Fix first.
- **TypeScript compilation must pass** — run `npx tsc --noEmit` on the affected app before committing. Type errors are as blocking as lint errors.

## Frontend conventions (Angular 21)

- **Signals first**: Use `signal()`, `computed()`, `effect()` for state. No `BehaviorSubject` for new code.
- **Component inputs/outputs**: Use `input()` and `output()` signal-based API (not `@Input()` / `@Output()` decorators).
- **Standalone components**: All components must be `standalone: true`. No `NgModule` declarations.
- **Shared components**: Always check `app/shared/` before creating a new component. Reuse existing: `ButtonComponent`, `BadgeComponent`, `StatusBadgeComponent`, `AvatarComponent`, `InlineConfirmComponent`, `LoadingStateComponent`, `EmptyStateComponent`, `ViewToggleComponent`, `PillSelectorComponent`, `DialogContextComponent`, etc.
- **Design tokens**: Use CSS variables from `src/styles/_tokens.css` and SCSS tokens from `src/styles/tokens/`. Never hardcode colors, spacing, or font sizes — always reference tokens (`var(--accent-color)`, `var(--text-primary)`, `var(--radius-md)`, etc.).
- **SCSS mixins**: Use mixins from `src/styles/mixins/` for buttons, forms, tabs, scrollbars, layout patterns.
- **Token import in SCSS**: `@use "tokens" as t;` and `@use "mixins" as m;` at the top of component SCSS files.
- **No `subscribe()` in components**: Prefer `toSignal()` or `async` pipe. Use `effect()` for side effects triggered by signal changes.
- **Typed services**: Services use `inject()` function (not constructor injection). Use `computed()` for derived state.
- **Route guards**: Use functional guards (`CanActivateFn`), not class-based guards.

## Key conventions (backend)

- **DDD entities**: Always use `Entity<T>` base class with `toDomain` getter. Prefix IDs (`user_`, `contract_`, `platformContract_`, etc.)
- **Test factories**: Always create test data via domain entity constructors + `entity.toDomain`, never raw MongoDB inserts
- **No `any`**: Use explicit types everywhere. Typed `execute<Command, Result>()` on CQRS buses
- **CQRS**: Commands mutate, Queries read. Controllers call `CommandBus` / `QueryBus`
- **Two contract scopes**:
  - `@PlatformScoped()` — personal features (music library), resolves from `user_id`
  - `@ContractScoped()` — company features (orgchart, cross-library), resolves from `X-Contract-Id` header
- **Quota vs Permissions vs Policy**: Three distinct layers
  - Permissions (binary: can/cannot) — `@RequirePermission()`
  - Quotas (quantitative: how much) — `QuotaService.ensureAllowed()`
  - Policy (structural: domain invariants) — entity validation
- **API responses**: Wrap in `TApiResponse<T>` via `buildApiResponseDTO()`
- **Imports**: Use `.js` extension for relative imports in backend (NodeNext resolution)
- **Colocate tests**: Unit tests live in a `__tests__/` folder adjacent to the source file they test (e.g. `commands/__tests__/LoginHandler.spec.ts`). Never put tests in a root-level `__tests__/` folder far from the source. Exception: E2E tests and shared test helpers.

## Useful commands

```bash
# Dev
pnpm run dev:backend          # Start backend in watch mode
pnpm run dev:webapp           # Start Angular frontend

# Test
pnpm --filter @sh3pherd/backend test          # Backend unit tests
pnpm --filter @sh3pherd/audio-processor test  # Audio processor tests

# Lint
pnpm --filter @sh3pherd/backend lint          # Backend ESLint + Prettier
pnpm --filter @sh3pherd/audio-processor lint  # Audio processor lint

# Build
pnpm --filter @sh3pherd/shared-types build    # Build shared types (prerequisite)
pnpm --filter @sh3pherd/frontend-webapp build # Build Angular app
pnpm --filter @sh3pherd/backend build         # Build NestJS backend

# Type check
cd apps/backend && npx tsc --noEmit
cd apps/frontend-webapp && npx tsc --noEmit
```

## Session start confirmation

After reading all documentation files listed above, explicitly confirm to the user:
"I have read all 22 documentation files in apps/backend/documentation/. Ready to work."

Do NOT start any work before this confirmation.

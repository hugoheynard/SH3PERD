# SH3PHERD — Claude Code Onboarding

## First thing to do in every new session

Read ALL documentation files in `apps/backend/documentation/` before starting any work.
This is mandatory — the docs contain architecture decisions, conventions, and domain context
that are essential for making correct changes.

## Documentation index

| Doc | Path | Description |
|-----|------|-------------|
| **README** | `apps/backend/documentation/README.md` | Documentation index and table of contents |
| **Auth & Context** | `apps/backend/documentation/sh3-auth-and-context.md` | Auth pipeline, JWT, `@ContractScoped`, `@PlatformScoped`, `@RequirePermission`, `P` object |
| **Writing a Controller** | `apps/backend/documentation/sh3-writing-a-controller.md` | Complete guide: scope, permissions, Swagger, CQRS |
| **Swagger Usage** | `apps/backend/documentation/sh3-swagger-usage.md` | Zod-first DTOs, `apiSuccessDTO`, response envelope |
| **Error Handling** | `apps/backend/documentation/sh3-error-handling.md` | DomainError, BusinessError, TechnicalError, GlobalExceptionFilter |
| **Dev Setup** | `apps/backend/documentation/sh3-dev-setup.md` | RSA keys, JWT config, env variables |
| **Platform Contract** | `apps/backend/documentation/sh3-platform-contract.md` | SaaS subscription model, dual contract model (platform vs company) |
| **Quota Service** | `apps/backend/documentation/sh3-quota-service.md` | Quota enforcement: `ensureAllowed()` / `recordUsage()`, plan limits |
| **Music Library** | `apps/backend/documentation/sh3-music-library.md` | Full music feature roadmap, 14 features across 4 tiers |
| **Music Audio Player** | `apps/backend/documentation/sh3-music-audio-player.md` | wavesurfer.js inline player, peaks pipeline |
| **Music Mastering** | `apps/backend/documentation/sh3-music-mastering.md` | DeepAFx-ST AI mastering, ffmpeg loudnorm, pitch-shift |
| **Persona Match** | `apps/backend/documentation/sh3-persona-match.md` | AI event programming: extraction, scoring, curation (Claude API) |
| **Org Chart** | `apps/backend/documentation/sh3-orgchart.md` | Org chart features, API, architecture |
| **Orgchart Export** | `apps/backend/documentation/sh3-orgchart-export.md` | PDF/SVG export via headless Chromium |
| **Orgchart Print** | `apps/backend/documentation/sh3-orgchart-print.md` | Print layer reusing live component |
| **Contracts** | `apps/backend/documentation/sh3-contracts.md` | Contract aggregate diagram |
| **Calendar** | `apps/backend/documentation/sh3-calendar.md` | Event matrix, constraint programming |
| **Integrations** | `apps/backend/documentation/sh3-integrations.md` | Slack OAuth, channel management |
| **Integrations TODO** | `apps/backend/documentation/sh3-integrations-todo.md` | Remaining integration tasks |
| **E2E Tests** | `apps/backend/documentation/sh3-e2e-tests.md` | MongoMemoryServer, test builders, factories |
| **Error Mgmt TODO** | `apps/backend/documentation/TODO-2026-04-08-errorManagement-back.md` | Error refactoring task (completed) |
| **Guest to User** | `apps/backend/documentation/TODO-guest-to-user.md` | Guest user activation flow |

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

## Key conventions

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

# SH3PHERD — Claude Code Onboarding

## Working context (read first)

- **Default workspace**: main repo at `~/WebstormProjects/SH3PHERD`, branch `dev`.
  Do not create a worktree and do not switch branches unless the user explicitly asks.
- If a worktree is already active: finish the task, commit, push to `origin`, then exit the worktree so WebStorm stays in sync.
- **Do NOT preload docs.** Read only what the current task requires. Use the two indexes below to find the right doc on demand.

### Documentation indexes (navigate from here)

- Technical (architecture, patterns, how-tos): [`apps/backend/documentation/README.md`](apps/backend/documentation/README.md)
- Process (TODOs, roadmaps, secrets): [`documentation/README.md`](documentation/README.md)

Rule of thumb — open a doc only when:

- the task touches a module you have not modified recently, **or**
- the task requires a convention (auth scopes, quotas, swagger, mailer, quality gates) not already covered by this file.

Two docs are worth opening early for non-trivial backend work:
[`sh3-writing-a-controller.md`](apps/backend/documentation/sh3-writing-a-controller.md) and [`sh3-auth-and-context.md`](apps/backend/documentation/sh3-auth-and-context.md).

## Stack synthesis

```
apps/backend/          NestJS · DDD · CQRS · MongoDB
apps/frontend-webapp/  Angular 21 · signals-first · standalone · SSR
apps/audio-processor/  NestJS micro-service (ffmpeg, essentia.js, DeepAFx-ST)
packages/shared-types/ Zod schemas + TS types (source of truth for DTOs)
packages/storage/      R2/S3 utilities
```

### Backend conventions (NestJS · DDD · CQRS · Mongo)

- **DDD entities** extend `Entity<T>`, expose `toDomain` getter. IDs are prefixed (`user_`, `contract_`, `platformContract_`, …).
- **CQRS**: Commands mutate, Queries read. Controllers call `CommandBus`/`QueryBus` with typed `execute<Command, Result>()`. No `any`.
- **Scopes**: `@PlatformScoped()` (personal, resolves from `user_id`) vs `@ContractScoped()` (company, resolves from `X-Contract-Id`).
- **Three enforcement layers**: Permissions (binary, `@RequirePermission()`) · Quotas (quantitative, `QuotaService.ensureAllowed()`) · Policy (domain invariants in entities).
- **API envelope**: every response wrapped in `TApiResponse<T>` via `buildApiResponseDTO()`.
- **Swagger is mandatory** on every endpoint: `@ApiOperation`, `@ApiResponse(apiSuccessDTO(...))`, Zod-derived DTOs from `shared-types`. Must ship in the same commit as the controller change.
- **Imports**: relative imports use the `.js` extension (NodeNext).
- **Tests** colocate in `__tests__/` next to the source (`commands/__tests__/LoginHandler.spec.ts`). Build test data via domain entity constructors — never raw Mongo inserts.

### Frontend conventions (Angular 21, signals-first)

- `signal()` / `computed()` / `effect()` for all new state. No `BehaviorSubject`. No `subscribe()` in components — use `toSignal()` or `async` pipe.
- Signal-based `input()` / `output()` (not `@Input` / `@Output`). All components `standalone: true`.
- `inject()` in services, functional route guards (`CanActivateFn`).
- **Reuse before you create**: check `app/shared/` first (`ButtonComponent`, `BadgeComponent`, `StatusBadgeComponent`, `AvatarComponent`, `InlineConfirmComponent`, `LoadingStateComponent`, `EmptyStateComponent`, `ViewToggleComponent`, `PillSelectorComponent`, `IconComponent`, …).
- **Design tokens only**: CSS variables from `src/styles/_tokens.css` — never hardcode colors/spacing/fonts.
- **SCSS mixins**: `@use "mixins" as m;` from `src/styles/mixins/` when needed. Domain-specific mixins (`rating-dots`, `buttons`) live in `src/app/shared/styles/`.

## Architecture & quality bar

Non-negotiable. Flag any existing code that violates these and either fix it in scope or open a TODO entry — never extend a violation.

### SOLID (how it applies here)

- **SRP** — one reason to change per class/file. Handlers do _one_ thing (one command → one handler → one outcome). Components render; services orchestrate; repositories persist. If a unit grows a second responsibility, split it.
- **OCP** — extend via new handlers, strategies, adapters; don't grow `switch`/`if` ladders on a type discriminant. Prefer a registry or polymorphism over conditional branching on kind.
- **LSP** — subtypes must be substitutable. No narrowing preconditions, no throwing from overrides that the base contract doesn't declare. Zod schemas stay structurally compatible; entity subclasses respect parent invariants.
- **ISP** — keep interfaces narrow. Split fat service contracts; a consumer depends only on the methods it actually calls. Repositories expose read vs. write surfaces separately when both exist.
- **DIP** — domain depends on abstractions, infra on concretions. Handlers depend on repository _interfaces_, never on Mongo models. Injection tokens for cross-cutting infra (mailer, storage, clock). Angular: `inject()` interface-typed services.

### Clean boundaries

- **Dependency direction**: `domain` ← `application` (handlers, use-cases) ← `infrastructure` (Mongo, HTTP, adapters). Domain imports nothing framework-specific — no Nest decorators, no Mongoose, no Zod leaking inward.
- **CQRS discipline**: Commands return void or an ID, never a read model. Queries never mutate. No cross-calls between a command handler and a query handler — share through the domain or repositories.
- **Shared types are the contract**: DTOs derive from Zod schemas in `packages/shared-types`. Never hand-write a DTO that shadows a Zod type.
- **Entities enforce invariants**: validation lives in the entity constructor / factory. Controllers and handlers do not re-validate what the entity already guarantees.

### Code quality (enforced locally, not just "nice to have")

- **No `any`, no `as unknown as T`, no `@ts-ignore`, no `eslint-disable`.** If types fight you, the model is wrong — fix the model.
- **Small units**: functions ≲40 lines, files ≲300. If a handler grows, extract a domain service or a pure helper — don't inline more branches.
- **Pure where possible**: domain logic is pure + deterministic. Side effects (I/O, time, randomness) cross an explicit port (repository, clock, id generator).
- **Errors by category**: `DomainError` / `BusinessError` / `TechnicalError` (see [`sh3-error-handling.md`](apps/backend/documentation/sh3-error-handling.md)). Never throw raw `Error` from application or domain code. Never swallow errors silently.
- **Tests with the change**: every new handler/service/component ships with unit tests colocated in `__tests__/`. Domain logic is tested without Nest; handlers with mocked ports; no raw Mongo inserts in test factories.
- **Reuse before create** (frontend): scan `app/shared/` and existing mixins/tokens first. Duplicating a component is a review-blocker.
- **Signals purity** (frontend): `computed()` must be pure; side effects go in `effect()`. No reading a signal from a non-reactive context that should be reactive.

When in doubt: prefer the boring, explicit, well-typed solution over the clever one. Readability and a correct type model beat brevity.

## Commits

- **Atomic & conventional**: `feat(scope)`, `fix(scope)`, `docs(scope)`, `refactor(scope)`. One concern per commit. Message explains _why_.
- **Docs ship with code**: update the relevant technical doc or TODO in the same commit (or an immediately following `docs:` commit). Never leave docs stale. Technical doc → `apps/backend/documentation/`. TODO/roadmap → `documentation/todos/`.
- Use Mermaid diagrams in technical docs for non-trivial flows.

## Quality gates

Three tiers enforced top-down; see [`sh3-quality-gates.md`](apps/backend/documentation/sh3-quality-gates.md) for details.

1. **Pre-commit** (`.githooks/pre-commit`): `lint-staged` — ESLint `--fix` + Prettier. No typecheck.
2. **Pre-push** (`.githooks/pre-push`): `tsc --noEmit` + `eslint` per changed app. If `packages/shared-types/**` changed, all downstream apps re-check. Tests run in CI, not here. Hooks self-install on `pnpm install`; manual fallback: `pnpm run setup:hooks`.
3. **CI** (`.github/workflows/ci.yml`): build shared-types, lint + typecheck + unit tests per app, frontend production build, `ci-gate` as the single required status check.

Before touching a module in the backend ESLint `ignores`: remove it from `ignores` and fix existing errors first. No `eslint-disable`. Never commit failing tests.

Manual gate commands:

```bash
pnpm --filter @sh3pherd/backend lint         # or: exec tsc --noEmit   / test
pnpm --filter audio-processor lint           # or: exec tsc --noEmit   / test
pnpm --filter frontend-webapp exec tsc --noEmit   # + test / build
```

## Useful commands

```bash
# Dev
pnpm run dev:backend
pnpm run dev:webapp

# Build
pnpm --filter @sh3pherd/shared-types build   # prerequisite for others
pnpm --filter @sh3pherd/backend build
pnpm --filter frontend-webapp build
```

WebStorm users: one-click configs live in `.run/` (`Dev all`, `backend > test`, etc.). See [`documentation/WEBSTORM-RUN-CONFIGS.md`](documentation/WEBSTORM-RUN-CONFIGS.md).

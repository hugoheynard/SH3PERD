# SH3PHERD — E2E Test Infrastructure

End-to-end test framework for the NestJS backend. Tests run against
an **in-memory MongoDB replica set** (via `mongodb-memory-server`'s
`MongoMemoryReplSet`, single node — transactions require a replset)
and exercise the full HTTP stack (guards, pipes, interceptors,
filters, database) via `supertest`. No external MongoDB installation,
no `.env.*`, and no RSA keys on disk required — the jest globalSetup
boots the DB, seeds the env, and generates throwaway keys itself.

---

## Quick start

```bash
# Run the full backend suite (unit + E2E). The script pins
# NODE_ENV=test, --runInBand, and --forceExit — just invoke it.
pnpm --filter @sh3pherd/backend test

# Run only the E2E suites:
pnpm --filter @sh3pherd/backend test src/E2E/

# Run only auth E2E:
pnpm --filter @sh3pherd/backend test src/E2E/auth

# Run with verbose output:
pnpm --filter @sh3pherd/backend test --verbose
```

**No prerequisites** — `mongodb-memory-server` downloads and runs a
MongoDB binary automatically on first run. No MongoDB installation,
no `.env.app`, no `keys/*.pem` needed; the jest globalSetup seeds
everything (see "Env seeding" below). The audio processor on `:3001`
is only needed for music processing tests (master, pitch-shift).

---

## How it works

### MongoDB in-memory — the ONLY supported mode

```
jest.config.cjs
  ├── globalSetup:    src/E2E/global-setup.ts   → starts MongoMemoryReplSet
  └── globalTeardown: src/E2E/global-teardown.ts → stops it
package.json "test"    → NODE_ENV=test jest --runInBand --forceExit
```

1. `global-setup.ts` starts a **single-node `MongoMemoryReplSet`** on a
   random port, seeds every env var the app needs at module-load time,
   and generates throwaway RSA keys on disk.
2. Writes the URI to `.e2e-mongo-uri` (temp file, gitignored).
3. `bootstrap.ts` reads the URI and passes it to the NestJS app.
4. After all tests, `global-teardown.ts` stops the replset and deletes
   the temp file.

#### Hard rule — no real-database fallback

If `.e2e-mongo-uri` is missing or empty, `bootstrap.ts` **throws**
rather than falling back to whatever `ATLAS_URI` happens to be set in
the shell. E2E tests perform destructive operations
(`resetAllCollections()`, raw inserts via factories,
soft-delete/flush helpers) — pointing them at a real staging or
production database by accident would wipe it. The committed
`.env.app` even points at prod Atlas on at least one developer's
machine, so a single missing temp file would have been a disaster.
The old fallback is gone; the bootstrap throws with a clear message.

If you genuinely want integration tests against a real MongoDB, write
them in a separate suite with its own bootstrap that takes the URI as
an explicit constructor argument, never from ambient env.

#### Why `MongoMemoryReplSet` (not `MongoMemoryServer`)

`RegisterUserHandler` and several other commands wrap their inserts in
`session.withTransaction()`. MongoDB refuses that on a standalone
instance with:

```
MongoServerError: Transaction numbers are only allowed on a
replica set member or mongos
```

A cached MongoDB binary on a developer laptop sometimes happened to
cover for this; CI runners boot clean and it always failed. The
single-node replset advertises the `setName` / `primary` capability
transactions need, at the cost of one extra init step (~2 s). There's
no real replication, but there doesn't need to be.

#### Env seeding so CI doesn't need `.env.app`

`.env.app`, `.env.test`, and `keys/{private,public}.pem` are all
gitignored and therefore absent on every fresh CI runner. Instead of
checking in secrets, `global-setup.ts`:

- Sets safe defaults for every var the app checks at module-load time
  (`PORT`, `TOKEN_KEY`, `AUTH_TOKEN_TTL_MS`, `REFRESH_TOKEN_TTL_MS`,
  `COOKIE_*`, `FRONTEND_URL`) via a `setDefault()` helper that never
  overrides values the environment has already provided. Local dev
  setups with a real `.env.app` keep working.
- Generates an ephemeral RSA 2048 key-pair with `node:crypto` and
  writes it to `keys/{private,public}.pem` if either file is missing.
  Regenerated every fresh run, never shared, only used to sign test
  JWTs — the path is gitignored so nothing leaks into commits.

`loadEnv()` was relaxed in parallel: when `envName === 'test'` it
logs and continues past missing `.env.*` files instead of throwing.
Dev / prod modes keep the strict behaviour — a missing `.env` there
is still a hard error. The required-var validation at the end of
`loadEnv` stays, so any misconfigured CI that forgot to seed
`ATLAS_URI` / `CORE_DB_NAME` / `PORT` fails loudly.

#### The `override: !isTest` rule (local ≠ CI trap)

`bootstrapE2E()` forces `ATLAS_URI`, `CORE_DB_NAME`, `NODE_ENV` onto
`process.env` before calling `loadEnv('test')`. For the seed to
survive, `loadEnv` **must not** override those values when it finds a
`.env.app` or `.env.test` on disk:

```ts
// loadEnv.ts — test mode loads files in "merge" mode (fill blanks only)
dotenv.config({ path: envPath, override: !isTest });
```

Why this matters:

- CI runners are clean — no `.env.app`, no `.env.test`. `loadEnv`
  skips both, the globalSetup seed wins by default, and the suite
  runs against `MongoMemoryReplSet` as intended.
- Developer machines have a real `.env.app` on disk (usually pointing
  `ATLAS_URI` at a staging or prod Atlas cluster so `pnpm dev` works
  out of the box). If `loadEnv` were to call `dotenv.config({
override: true })` in test mode, that `ATLAS_URI` would **silently
  replace** the in-memory URI set by `bootstrapE2E()`, and E2E tests
  would hit the developer's real database — passing in CI, failing
  (or corrupting data) locally.

The symptoms of that trap were: unique-index collisions on existing
emails, `resetAllCollections()` wiping developer data, schema drift
between the factories and whatever's in the real DB — everything
pointing at a local / CI divergence with no obvious root cause.

Keep the `override: !isTest` flag. Dev / prod paths still override as
before (`.env.app` is the source of truth there); only test mode is
protected.

### Serial execution via `--runInBand`

Every spec in the backend — unit and E2E — runs through the single
MongoMemoryReplSet that globalSetup boots. Parallel jest workers
share that instance, so two E2E suites running at once race on
`resetAllCollections()` between tests and the later one sees the
earlier one's writes.

The `test` script pins `--runInBand` (everything runs in the main
process, no workers). `maxWorkers: 1` in the jest config is **not**
equivalent — jest still spawns one worker child, and the env-var
hand-off to that worker is just enough out of sync with globalSetup
on cold runs to produce sporadic `workspace.e2e-spec.ts` failures.
Stick with `--runInBand`.

The `NODE_ENV=test` prefix on the script is load-bearing too: the
`ThrottlerModule` in `app.module.ts` reads it at module-load time to
bump the per-endpoint limit from 30/min to 10 000/min. Setting it
later inside `bootstrapE2E` is already past the window where it
matters.

#### CI pitfall: `pnpm test -- --flag`

pnpm 10 forwards the literal `--` to the underlying script, so

    pnpm --filter frontend-webapp test -- --ci --runInBand

becomes

    jest --config ... -- --ci --runInBand

and to jest, `--` means "stop parsing options, treat the rest as
positional file-pattern args". Jest then matches the strings
`--ci` and `--runInBand` against test paths, finds zero tests, and
**exits 0 or 1 with no tests run**. Frontend CI was silently
not-running for commits before 613f0812 for this reason.

Drop the `--` — pass jest flags directly:

    pnpm --filter frontend-webapp test --ci --runInBand

### Throttler bypass

The `ThrottlerGuard` is monkey-patched after `app.init()` so it
always passes. This prevents per-endpoint `@Throttle()` decorators
(e.g. auth register has `limit: 3`) from causing 429s in tests.

---

## Directory structure

```
apps/backend/src/E2E/
├── global-setup.ts            — starts MongoMemoryServer (jest globalSetup)
├── global-teardown.ts         — stops MongoMemoryServer (jest globalTeardown)
├── utils/
│   ├── index.ts               — barrel export
│   ├── bootstrap.ts           — bootstrapE2E() / teardownE2E()
│   ├── db-cleanup.ts          — resetAllCollections / domain-specific cleanups
│   ├── user.builder.ts        — UserBuilder (HTTP-based: register, login, refresh, logout)
│   ├── workspace.setup.ts     — WorkspaceSetup (HTTP-based: user + company + contract)
│   └── factories.ts           — DB Factories (direct MongoDB inserts, 300× faster)
├── fixtures/                  — test audio files, seed data (future)
├── auth.e2e-spec.ts           — auth flow tests (18 tests)
└── workspace.e2e-spec.ts      — workspace setup tests (6 tests)
```

---

## Two seeding strategies

### 1. HTTP Builders (slow, tests the full stack)

Use when the setup **IS** the test — you're verifying that the HTTP
endpoints work correctly end-to-end.

```typescript
// ~3 seconds per call (4 HTTP round-trips)
const ws = await WorkspaceSetup.init(app)
  .withUser({ email: 'test@e2e.local', password: 'Test123!' })
  .withCompany('Studio X')
  .build();

// ws.user.getAuthHeader() → 'Bearer eyJ...'
// ws.contractHeader → { 'X-Contract-Id': 'contract_xxx' }
```

### 2. DB Factories (fast, direct MongoDB inserts)

Use when the setup is **overhead** — you just need a workspace context
to test a different feature (music, orgchart, playlists).

```typescript
// ~10 ms per call (direct inserts + JWT signing)
const seed = await seedWorkspace(db, {
  email: 'fast@e2e.local',
  companyName: 'Fast Studio',
});

// seed.authHeader → 'Bearer eyJ...' (signed with the app's RSA key)
// seed.contractHeader → { 'X-Contract-Id': 'contract_xxx' }
```

### When to use which

| Scenario                                                | Use                            |
| ------------------------------------------------------- | ------------------------------ |
| Testing auth endpoints (register, login, refresh)       | `UserBuilder`                  |
| Testing company/contract creation                       | `WorkspaceSetup`               |
| Testing music CRUD (need a workspace but testing music) | `seedWorkspace()`              |
| Testing orgchart mutations (need a workspace)           | `seedWorkspace()`              |
| Testing with 50+ entities (performance matters)         | `seedUser()` + `seedCompany()` |

---

## Rule: factories ALWAYS use domain entities

**Never insert raw objects into MongoDB in test code.** Factories
construct real domain entities via their constructors, then insert
`entity.toDomain` — the same plain-object snapshot the production
repositories persist.

```typescript
// ❌ NEVER — hardcoded fields drift from the real schema silently
await db.collection('user_credentials').insertOne({
  id: 'user_xxx',
  email: 'test@test.com',
  password: 'hash',
  active: true,
  // If a required field is added to UserCredentialEntity,
  // this insert succeeds with invalid data → false green tests
});

// ✅ ALWAYS — entity constructor enforces invariants + generates correct IDs
const entity = new UserCredentialEntity({
  email: 'test@test.com',
  password: 'hash',
  active: true,
  email_verified: false,
  is_guest: false,
});
await db.collection('user_credentials').insertOne(entity.toDomain);
// If the entity evolves, the factory breaks at compile time
```

**Why this matters:**

- Entity constructors validate invariants (non-empty name, valid
  status, required fields) — test data passes the same checks as
  production data.
- `toDomain` returns the exact field set the repositories expect —
  no missing fields, no extra fields, no wrong types.
- ID prefixes (`userCredential_`, `company_`, `contract_`) are
  generated by the base `Entity` class, not hardcoded.
- If the schema evolves, the factory's `new Entity({...})` call
  breaks at compile time — the error is caught immediately, not
  after a silent green test run.

This rule applies to **all** test code: E2E factories, unit test
fixtures, seed scripts, migration scripts. If you're inserting into
a collection that has a domain entity, use the entity.

---

## DB Factories API

```typescript
import { seedUser, seedCompany, seedWorkspace } from './utils';

// Seed just a user (credentials + profile + preferences + JWT)
const user = await seedUser(db, {
  email: 'alice@e2e.local', // optional, auto-generated
  firstName: 'Alice', // optional, default: 'Factory'
  lastName: 'Test', // optional, default: 'User'
});
// user.userId, user.email, user.authToken, user.authHeader

// Seed a company + owner contract for an existing user
const company = await seedCompany(db, user.userId, {
  name: 'Studio X', // optional, default: 'Factory Company'
});
// company.companyId, company.contractId, company.companyName

// Seed everything at once (user + company + contract + workspace pref)
const seed = await seedWorkspace(db, {
  email: 'full@e2e.local',
  companyName: 'Full Studio',
});
// seed.userId, seed.companyId, seed.contractId
// seed.authToken, seed.authHeader, seed.contractHeader
```

**Under the hood**, each `seed*()` function constructs real domain
entities (`UserCredentialEntity`, `CompanyEntity`, `ContractEntity`,
etc.) and inserts `entity.toDomain` into MongoDB. The JWT is signed
with the app's RSA private key (from `keys/private.pem`) so the
`AuthGuard` accepts it as a valid token.

**Entities used by the factories:**

| Factory           | Entities                                                       | Collections                                             |
| ----------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| `seedUser()`      | `UserCredentialEntity`, `UserProfileEntity`, `UserPreferences` | `user_credentials`, `user_profiles`, `user_preferences` |
| `seedCompany()`   | `CompanyEntity`, `ContractEntity`                              | `companies`, `contracts`                                |
| `seedWorkspace()` | All of the above                                               | All of the above                                        |

---

## DB Cleanup

```typescript
import {
  resetAllCollections, // nuke everything
  resetCollections, // specific collections
  resetAuthCollections, // user_credentials + profiles + preferences + refresh_tokens
  resetCompanyCollections, // companies + contracts + org_nodes + guest_company
  resetMusicCollections, // music_references + repertoire + versions + tab_configs
} from './utils';
```

All cleanup functions are guarded by `NODE_ENV` — they throw if not in
`test`, `e2e`, or `ci` environment.

### Cleanup patterns

```typescript
// Pattern A: full isolation (each test starts clean)
afterEach(async () => {
  await resetAllCollections(db);
});

// Pattern B: preserve workspace, clean feature data only
afterEach(async () => {
  await resetMusicCollections(db);
});

// Pattern C: always clean at the end of the suite
afterAll(async () => {
  await resetAllCollections(db);
  await teardownE2E(app);
});
```

---

## Snapshot / contract testing

Tests use `toMatchObject` for API response shape verification:

```typescript
// Good: verifies the contract, tolerates extra fields
expect(res.body).toMatchObject({
  id: expect.any(String),
  email: 'alice@test.com',
  active: true,
  is_guest: false,
});

// Good: error contract verification
expect(res.body).toMatchObject({
  statusCode: 409,
  errorCode: expect.any(String),
  message: expect.any(String),
});
```

---

## Test suites

| File                    | Tests  | What it covers                                                                      |
| ----------------------- | ------ | ----------------------------------------------------------------------------------- |
| `auth.e2e-spec.ts`      | 18     | Register (5), Login (3), Refresh (3), Logout (2), AuthGuard (4), Full lifecycle (1) |
| `workspace.e2e-spec.ts` | 6      | WorkspaceSetup chain (4), Multiple workspaces (1), DB cleanup (1)                   |
| **Total**               | **24** |                                                                                     |

---

## Running in CI

The backend's `test` script is already fully self-contained:

```yaml
- name: Unit tests
  run: pnpm --filter @sh3pherd/backend test
```

That expands to `NODE_ENV=test jest --runInBand --forceExit`. CI does
NOT need:

- a MongoDB service container (`mongodb-memory-server` downloads and
  runs a binary on first invocation, cached thereafter),
- a committed `.env.app` / `.env.test` (globalSetup seeds defaults),
- committed `keys/{private,public}.pem` (globalSetup generates them),
- any Atlas URI / production credentials in secrets.

The only external dependency is the audio-processor microservice on
`:3001`, and it's only needed for music processing tests (master /
pitch-shift) — not for auth / workspace / music CRUD.

### Do not add `--` before jest flags

See the "CI pitfall" section above. `pnpm --filter @sh3pherd/backend
test -- --anything` silently breaks jest's option parser on pnpm 10.
Pass jest flags to the script directly, or add them to the `test`
script in `package.json`.

---

## Key design decisions

### Why `--runInBand` (not `maxWorkers: 1`)?

Covered in detail in "Serial execution" above. Short version:
`maxWorkers: 1` still spawns a worker child, and the env-var
hand-off to that child races globalSetup on cold runs. `--runInBand`
runs in the main process with no workers. We saw sporadic
`workspace.e2e-spec.ts` failures with `maxWorkers: 1` that went
away once the `test` script moved to `--runInBand`.

### Why `--forceExit`?

The NestJS app keeps open handles (TCP client proxy for the audio
processor, MongoDB connection pool). `teardownE2E()` closes the app
gracefully, but Jest sometimes detects lingering handles. `--forceExit`
prevents the test runner from hanging.

### Why monkey-patch ThrottlerGuard?

`overrideGuard()` and `overrideProvider()` don't catch guards registered
via `APP_GUARD` multi-providers or per-endpoint `@Throttle()` decorator
overrides. The prototype patch after `app.init()` is the only approach
that reliably disables all throttle checks.

### Why we delete `ng generate` / `nest g` stub specs on sight

The big CI unblocking pass in April 2026 removed **71** spec files
whose entire body was a single `expect(x).toBeTruthy()` or
`expect(controller).toBeDefined()` over a freshly-injected service
or scaffolded component. Every one came straight from the Angular /
Nest CLI template, none had been updated since, and many referenced
class names that had been renamed months earlier
(`RoomLayoutDirectiveDirective`, `PlannerDnDInitService`,
`SlotPreviewComponent`, …).

Policy going forward:

- **Do not commit the auto-generated stub** when you run
  `nest g controller foo` or `ng generate component bar`. Delete the
  `*.spec.ts` the CLI drops in, or immediately replace its body with
  a meaningful assertion. A placeholder that only checks
  "the thing can be constructed when every dep is mocked" is worse
  than no test — it shows up in coverage reports, inflates suite
  time, and silently breaks when the constructor gains a dep.
- **Prefer E2E coverage for controllers.** `auth.e2e-spec.ts` and
  `workspace.e2e-spec.ts` already exercise the controllers through
  real HTTP + guards + validation pipes + Mongo, which is the
  coverage that matters. Per-controller `should be defined` stubs
  duplicate nothing and stop compiling every time a new guard
  token gets added.
- **Prefer handler specs for CQRS logic.** Where you need tight
  coverage of a command or query, write a colocated
  `__tests__/XxxHandler.spec.ts` that mocks the repos directly,
  instead of a controller stub.

### Why factories sign their own JWTs?

Direct DB inserts bypass the HTTP register/login flow. Without a valid
JWT, the `AuthGuard` would reject every request. The factory reads the
app's RSA private key from `keys/private.pem` and signs a token with
the same algorithm (`RS256`) the production auth uses. The resulting
token is indistinguishable from a real one.

---

## Related docs

- `sh3-music-library.md` — music feature roadmap
- `sh3-music-mastering.md` — AI mastering architecture
- `sh3-music-audio-player.md` — audio player layer

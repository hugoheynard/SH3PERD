# SH3PHERD — E2E Test Infrastructure

End-to-end test framework for the NestJS backend. Tests run against
an **in-memory MongoDB** (via `mongodb-memory-server`) and exercise the
full HTTP stack (guards, pipes, interceptors, filters, database) via
`supertest`. No external MongoDB installation required.

---

## Quick start

```bash
cd apps/backend

# Run all E2E tests (MongoDB starts automatically in-memory):
NODE_ENV=test npx jest --config jest.config.cjs "src/E2E/" --runInBand --forceExit

# Run auth tests only:
NODE_ENV=test npx jest --config jest.config.cjs "src/E2E/auth" --runInBand --forceExit

# Run with verbose output:
NODE_ENV=test npx jest --config jest.config.cjs "src/E2E/" --runInBand --forceExit --verbose
```

**No prerequisites** — `mongodb-memory-server` downloads and runs a
MongoDB binary automatically on first run. The audio processor on
`:3001` is only needed for music processing tests (master, pitch-shift).

---

## How it works

### MongoDB in-memory

```
jest.config.cjs
  ├── globalSetup:    src/E2E/global-setup.ts   → starts MongoMemoryServer
  └── globalTeardown: src/E2E/global-teardown.ts → stops MongoMemoryServer
```

1. `global-setup.ts` starts a `MongoMemoryServer` on a random port
2. Writes the URI to `.e2e-mongo-uri` (temp file, gitignored)
3. `bootstrap.ts` reads the URI and passes it to the NestJS app
4. After all tests, `global-teardown.ts` stops the server

**Fallback**: if `.e2e-mongo-uri` doesn't exist, `bootstrap.ts` uses
`ATLAS_URI` from env — so you can also run against a real MongoDB
for staging/integration tests.

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

| Scenario | Use |
|----------|-----|
| Testing auth endpoints (register, login, refresh) | `UserBuilder` |
| Testing company/contract creation | `WorkspaceSetup` |
| Testing music CRUD (need a workspace but testing music) | `seedWorkspace()` |
| Testing orgchart mutations (need a workspace) | `seedWorkspace()` |
| Testing with 50+ entities (performance matters) | `seedUser()` + `seedCompany()` |

---

## DB Factories API

```typescript
import { seedUser, seedCompany, seedWorkspace } from './utils';

// Seed just a user (credentials + profile + preferences + JWT)
const user = await seedUser(db, {
  email: 'alice@e2e.local',     // optional, auto-generated
  firstName: 'Alice',            // optional, default: 'Factory'
  lastName: 'Test',              // optional, default: 'User'
});
// user.userId, user.email, user.authToken, user.authHeader

// Seed a company + owner contract for an existing user
const company = await seedCompany(db, user.userId, {
  name: 'Studio X',              // optional, default: 'Factory Company'
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

The JWT is signed with the app's RSA private key (from `keys/private.pem`)
so the `AuthGuard` accepts it as a valid token.

---

## DB Cleanup

```typescript
import {
  resetAllCollections,   // nuke everything
  resetCollections,       // specific collections
  resetAuthCollections,   // user_credentials + profiles + preferences + refresh_tokens
  resetCompanyCollections, // companies + contracts + org_nodes + guest_company
  resetMusicCollections,  // music_references + repertoire + versions + tab_configs
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

| File | Tests | What it covers |
|------|-------|---------------|
| `auth.e2e-spec.ts` | 18 | Register (5), Login (3), Refresh (3), Logout (2), AuthGuard (4), Full lifecycle (1) |
| `workspace.e2e-spec.ts` | 6 | WorkspaceSetup chain (4), Multiple workspaces (1), DB cleanup (1) |
| **Total** | **24** | |

---

## Running in CI

```yaml
# GitHub Actions example
e2e-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with: { node-version: '22' }
    - run: corepack enable pnpm && pnpm install
    - run: cd apps/backend && NODE_ENV=test npx jest --config jest.config.cjs "src/E2E/" --runInBand --forceExit
```

No MongoDB service container needed — `mongodb-memory-server` handles
everything. The only external dependency is the audio-processor
microservice for processing tests (not needed for auth/workspace).

---

## Key design decisions

### Why `--runInBand`?

All E2E suites share the same in-memory MongoDB. Running them in
parallel causes data collisions. `--runInBand` serialises execution.
For parallel E2E, each suite would need its own DB name — possible
but not worth the complexity at this scale.

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

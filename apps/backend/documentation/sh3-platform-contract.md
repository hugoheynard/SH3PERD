# SH3PHERD — Platform Contract

Architecture documentation for the platform contract system — the SaaS
subscription model that controls access to personal features (music
library, playlists, etc.) independently from company employment contracts.

---

## Concept

SH3PHERD has **two types of contracts**:

| | Platform Contract | Company Contract |
|---|---|---|
| **Represents** | SaaS subscription (Free/Pro/Band/Business) | Employment relationship with a company |
| **Scope** | Personal features (music library, playlists) | Company features (orgchart, contracts, settings) |
| **Created when** | User registers (one per user, automatic) | Company is created or user is hired |
| **How many per user** | Exactly 1 | 0 to N (one per company) |
| **Resolved via** | `user_id` lookup (no header needed) | `X-Contract-Id` header or DB preferences |
| **Decorator** | `@PlatformScoped()` | `@ContractScoped()` |
| **Guard** | `PlatformContractContextGuard` | `ContractContextGuard` |
| **Entity** | `PlatformContractEntity` | `ContractEntity` |
| **Collection** | `platform_contracts` | `contracts` |
| **Roles** | `TPlatformRole` (plan_free, plan_pro, ...) | `TContractRole` (owner, admin, artist, viewer) |
| **Role templates** | `PLATFORM_ROLE_TEMPLATES` | `ROLE_TEMPLATES` |

A user can have **both**: a platform contract (personal music access)
AND one or more company contracts (company management access). The two
are completely independent.

Example — a manager at a label:
```
Hugo (user)
  ├── Platform Contract: plan_business    → full personal music access
  ├── Company Contract (Label X): owner   → manage Label X (orgchart, contracts)
  └── Company Contract (Studio Y): admin  → manage Studio Y
```

---

## Architecture

### Entity

```
apps/backend/src/platform-contract/
├── domain/
│   └── PlatformContractEntity.ts    — entity with plan + status + mutations
├── infra/
│   └── PlatformContractMongoRepo.ts — findByUserId() + base CRUD
├── api/
│   └── platform-contract-context.guard.ts — resolves from user_id
└── platform-contract.module.ts      — NestJS module
```

**`PlatformContractEntity`** extends `Entity<TPlatformContractDomainModel>`:
- `plan: TPlatformRole` — the subscription tier
- `status: 'active' | 'suspended'`
- `startDate: Date`
- `user_id: TUserId`
- Methods: `changePlan()`, `suspend()`, `reactivate()`
- ID prefix: `platformContract_`

**`TPlatformContractDomainModel`** (in `packages/shared-types`):
```ts
interface TPlatformContractDomainModel {
  id: string;
  user_id: TUserId;
  plan: TPlatformRole;
  status: 'active' | 'suspended';
  startDate: Date;
}
```

### Plans and permissions

```ts
type TPlatformRole = 'plan_free' | 'plan_pro' | 'plan_band' | 'plan_business';
```

| Plan | Music Library | Tracks | Playlists | Setlists | Events |
|------|:---:|:---:|:---:|:---:|:---:|
| `plan_free` | Read + Write | Read + Write | Read | — | — |
| `plan_pro` | Read + Write | Read + Write + Delete | Read + Write + Delete + Own | Read + Write | — |
| `plan_band` | `music:*` | `music:*` | `music:*` | `music:*` | — |
| `plan_business` | `music:*` | `music:*` | `music:*` | `music:*` | `event:*` |

**Important**: permissions control _whether_ a user can perform an
action at all. _Quantity_ limits (50 songs for free, 3 masters/month)
are a separate concern handled by `MusicPolicy` quotas — not by the
permission system. A free user CAN create songs, they just can't
create MORE than 50.

### Guard resolution flow

```
HTTP Request
    │
    ▼
AuthGuard (global)
    │ → extracts user_id from JWT → attaches req.user_id
    ▼
PlatformContractContextGuard (on @PlatformScoped routes)
    │ 1. Read user_id from request
    │ 2. Query: db.platform_contracts.findOne({ user_id })
    │ 3. Check status === 'active'
    │ 4. Attach req.contract_roles = [platformContract.plan]
    │    e.g. ['plan_free']
    ▼
PermissionGuard (on @RequirePermission routes)
    │ 1. Read req.contract_roles → ['plan_free']
    │ 2. Expand via PLATFORM_ROLE_TEMPLATES
    │    → ['music:library:read', 'music:library:write', ...]
    │ 3. Check required permission is in the expanded set
    │ 4. Pass (200) or reject (403)
    ▼
Handler
```

Key difference from company contracts: **no header needed**. The guard
queries the platform contract by `user_id` directly. Each user has
exactly one, so there's no ambiguity to resolve.

### `expandRolesToPermissions()` — unified

The `RequirePermission` guard's `expandRolesToPermissions()` function
checks BOTH `ROLE_TEMPLATES` (company) and `PLATFORM_ROLE_TEMPLATES`
(platform). Since the role strings are disjoint (`'owner'` vs
`'plan_free'`), only one template matches per role:

```ts
function expandRolesToPermissions(roles: (TContractRole | TPlatformRole)[]): TPermission[] {
  for (const role of roles) {
    // Check company templates first
    if (ROLE_TEMPLATES[role]) { ... }
    // Then platform templates
    if (PLATFORM_ROLE_TEMPLATES[role]) { ... }
  }
}
```

---

## Usage in controllers

### Music controllers (platform-scoped)

```ts
import { PlatformScoped } from '../../utils/nest/decorators/PlatformScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { P } from '@sh3pherd/shared-types';

@PlatformScoped()       // ← resolves platform contract from user_id
@Controller('library')
export class MusicLibraryController {

  @RequirePermission(P.Music.Library.Read)   // ← checks against plan permissions
  @Get('me')
  async getMyLibrary(@ActorId() actorId: TUserId) { ... }
}
```

### Company controllers (contract-scoped, unchanged)

```ts
@ContractScoped()       // ← resolves company contract from X-Contract-Id header
@Controller()
export class OrgChartViewsController {

  @RequirePermission(P.Company.OrgChart.Read)  // ← checks against company role
  @Get(':id/orgchart')
  async getOrgChart(@Param('id') id: TCompanyId) { ... }
}
```

### When to use which

| Feature | Decorator | Why |
|---------|-----------|-----|
| Music library | `@PlatformScoped()` | Personal feature, user-owned data |
| Playlists | `@PlatformScoped()` | Personal feature |
| Orgchart | `@ContractScoped()` | Company feature, shared data |
| Contracts | `@ContractScoped()` | Company feature |
| Company settings | `@ContractScoped()` | Company feature |
| User profile | Neither (just `@ActorId()`) | User's own profile, no scope needed |
| Auth | `@Public()` | No auth at all |

---

## Lifecycle

### Creation

Platform contracts are created in the `RegisterUserHandler` inside
the same MongoDB transaction as credentials + profile:

```ts
const platformContract = new PlatformContractEntity({
  user_id: credentials.id,
  plan: 'plan_free',
  status: 'active',
  startDate: new Date(),
});
```

### Upgrade / downgrade

```ts
const contract = await platformContractRepo.findByUserId(userId);
const entity = PlatformContractEntity.fromRecord(contract);
entity.changePlan('plan_pro');
await platformContractRepo.save(entity.toDomain);
```

Currently no endpoint for this — upgrade flow will be built with the
payment integration (Stripe). For now, plans can be changed manually
in MongoDB or via a future admin endpoint.

### Suspension

When a payment fails or an admin intervenes:

```ts
entity.suspend();
// → any @PlatformScoped() route returns 401 "Platform subscription is suspended"
```

Reactivation:
```ts
entity.reactivate();
// → routes work again
```

---

## Frontend impact

**None for music API calls.** Music services (`MusicLibraryApiService`,
`MusicTrackApiService`, etc.) already use `this.http` directly — they
don't send `X-Contract-Id`. The backend resolves the platform contract
server-side from `user_id`.

Company services continue using `this.scopedHttp.withContract()` which
sends `X-Contract-Id` — unchanged.

---

## E2E testing

The `seedUser()` factory automatically creates a platform contract
with `plan: 'plan_free'`:

```ts
const seed = await seedWorkspace(db, { companyName: 'Studio X' });
// seed has:
// - A user with credentials + profile + preferences
// - A platform contract (plan_free)
// - A company + owner contract
```

The `resetAuthCollections()` cleanup includes `platform_contracts`.

---

## Migration

For existing users registered before the platform contract feature:

```bash
node apps/backend/src/migrations/add-platform-contracts.mjs
```

Idempotent: skips users who already have a platform contract. Creates
one with `plan: 'plan_free'` for every user missing one.

---

## File map

| File | Role |
|------|------|
| `packages/shared-types/src/permissions.types.ts` | TPlatformRole, PLATFORM_ROLE_TEMPLATES |
| `packages/shared-types/src/platform-contract.types.ts` | TPlatformContractDomainModel |
| `apps/backend/src/platform-contract/domain/PlatformContractEntity.ts` | Entity |
| `apps/backend/src/platform-contract/infra/PlatformContractMongoRepo.ts` | Repository |
| `apps/backend/src/platform-contract/api/platform-contract-context.guard.ts` | Guard |
| `apps/backend/src/platform-contract/platform-contract.module.ts` | Module |
| `apps/backend/src/utils/nest/decorators/PlatformScoped.ts` | Decorator |
| `apps/backend/src/utils/nest/guards/RequirePermission.ts` | expandRolesToPermissions (both templates) |
| `apps/backend/src/auth/application/commands/RegisterUserCommand.ts` | Creates platform contract at registration |
| `apps/backend/src/appBootstrap/nestTokens.ts` | PLATFORM_CONTRACT_REPO token |
| `apps/backend/src/migrations/add-platform-contracts.mjs` | Backfill migration |

---

## TODO

### Payment integration (Stripe)
- [ ] `POST /platform-contract/upgrade` — changes plan, creates Stripe checkout session
- [ ] Stripe webhook handler — on `checkout.session.completed`, call `changePlan()`
- [ ] Stripe webhook — on `invoice.payment_failed`, call `suspend()`
- [ ] Stripe webhook — on `invoice.paid` (after retry), call `reactivate()`
- [ ] Frontend: plan picker component in user settings

### Quota enforcement
- [ ] `MusicPolicy` reads the platform contract plan to determine limits:
  - Free: 50 repertoire entries, 3 masters/month, 500 Mo storage
  - Pro: unlimited entries, unlimited masters, 5 Go storage
  - Band: unlimited, 20 Go shared
  - Business: unlimited, 100 Go
- [ ] Quota check runs BEFORE the domain command — 402 Payment Required
  if exceeded
- [ ] Usage tracking collection: `platform_usage` with monthly counters

### Admin endpoints
- [ ] `GET /admin/platform-contracts` — list all, filter by plan/status
- [ ] `PATCH /admin/platform-contracts/:id` — change plan, suspend, reactivate
- [ ] Dashboard: revenue by plan, active/suspended/churned counts

### Team plans (Band/Business)
- [ ] Band plan: invite up to 8 members who share the platform contract
- [ ] Business plan: invite up to 25 members
- [ ] `POST /platform-contract/invite` — adds a member to the team plan
- [ ] Invited members get their own platform contract with the team plan's role
- [ ] Owner sees all team members + usage in settings

---

## Related docs

- `sh3-writing-a-controller.md` — controller patterns (how @PlatformScoped fits alongside @ContractScoped)
- `sh3-e2e-tests.md` — how factories create platform contracts for tests
- `sh3-music-library.md` — music feature roadmap (features gated by platform plans)

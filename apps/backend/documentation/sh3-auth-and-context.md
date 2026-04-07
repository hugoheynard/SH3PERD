# SH3PHERD — Authentication, Contract Context & Permissions

## Overview

Every protected request goes through a pipeline that resolves **who** the user is, **which contract** they're acting under, and **what** they're allowed to do.

```
Request
  │
  ├─ Authorization: Bearer <jwt>
  │     → AuthGuard
  │     → request.user_id
  │
  ├─ X-Contract-Id: contract_abc-123   (optional header)
  │     → ContractContextGuard
  │     → request.contract_id
  │     → request.contract_roles
  │
  └─ Controller
       → @ActorId()         → TUserId
       → @ContractId()      → TContractId
       → @ContractRoles()   → TContractRole[]
       → @RequirePermission('company:settings:write')
```

---

## 1. Authentication — AuthGuard

**File:** `src/auth/api/auth.guard.ts`

Runs on all protected routes (global guard on `/protected/*`).

1. Extracts `Bearer <token>` from `Authorization` header
2. Verifies JWT via injected `verifyAuthTokenFn`
3. Sets `request.user_id` from the decoded token payload
4. Throws `401 Unauthorized` if token is missing or invalid

**Bypass:** Routes marked with `@IsPublic()` skip this guard.

### Decorator: `@ActorId()`

**File:** `src/utils/nest/decorators/ActorId.ts`

Reads `request.user_id` (set by AuthGuard).

```ts
@Get('me')
getMe(@ActorId() userId: TUserId) { ... }
```

---

## 2. Contract Context — ContractContextGuard

**File:** `src/contracts/api/contract-context.guard.ts`

Only activates on routes marked with `@ContractScoped()`. Resolves the active contract and attaches it to the request.

### Resolution order

1. **Header `X-Contract-Id`** — preferred. The frontend sends this via `ScopedHttpClient.withContract()`
2. **Database fallback** — reads `contract_workspace` from UserPreferences

### What it does

Once the contract ID is resolved:

1. Loads the full contract record: `contractRepo.findOne({ id, user_id })`
2. Verifies the contract belongs to the authenticated user
3. Attaches to request:
   - `request.contract_id` — the resolved `TContractId`
   - `request.contract_roles` — the `TContractRole[]` from the contract (e.g. `['owner']`, `['admin', 'artist']`)

Throws `401 Unauthorized` if:
- No contract ID found (neither header nor preferences)
- Contract doesn't exist or doesn't belong to this user

### Decorator: `@ContractScoped()`

**File:** `src/utils/nest/decorators/ContractScoped.ts`

Applies `ContractContextGuard` + sets metadata. Can be used on a controller or a method.

```ts
// On entire controller — all routes require contract context
@ContractScoped()
@Controller('playlists')
export class PlaylistController { ... }

// On a single method
@ContractScoped()
@Post('create')
create(...) { ... }
```

### Decorator: `@ContractId()`

**File:** `src/utils/nest/decorators/ContractId.ts`

Reads `request.contract_id` (set by ContractContextGuard). Throws if not present.

```ts
@ContractScoped()
@Get('data')
getData(@ContractId() contractId: TContractId) { ... }
```

### Decorator: `@ContractRoles()`

**File:** `src/utils/nest/decorators/ContractRoles.ts`

Reads `request.contract_roles` (set by ContractContextGuard). Returns `[]` if not present.

Rarely needed in handlers — prefer `@RequirePermission()` to guard access.
Only use `@ContractRoles()` when the handler logic needs to **adapt its response** based on roles (e.g. return different data for admins vs viewers).

```ts
@ContractScoped()
@RequirePermission('company:settings:read')
@Get('settings')
getSettings(@ContractRoles() roles: TContractRole[]) {
  // Permission is already checked — roles used here to tailor the response
  return this.queryBus.execute(new GetSettingsQuery(roles));
}
```

### Legacy decorators

These older decorators still work but the new ones above are preferred:

- **`@CurrentContract()`** (`src/utils/nest/decorators/CurrentContract.ts`) — same as `@ContractId()` but without validation
- **`@ContractScopedContext()`** (`src/utils/nest/decorators/Context.ts`) — returns `{ user_scope, contract_scope }` object
- **`@UserScopedContext()`** (`src/utils/nest/decorators/Context.ts`) — returns `{ user_scope }` object

---

## 3. Permissions — RequirePermission

**File:** `src/utils/nest/guards/RequirePermission.ts`

### How it works

1. Reads `request.contract_roles` (e.g. `['admin', 'artist']`)
2. Expands roles into permissions using `ROLE_TEMPLATES` from `@sh3pherd/shared-types`
3. Checks if the expanded permissions match the required permission(s)
4. Throws `403 Forbidden` if not

### The `P` object — single source of truth

**File:** `packages/shared-types/src/permissions.types.ts`

All permissions are defined in a single nested object `P`. The `TPermission` type is **derived from its values** — if a permission isn't in `P`, it doesn't exist.

```ts
import { P } from '@sh3pherd/shared-types';

P.Company.Settings.Read   // → 'company:settings:read'
P.Company.Settings.Write  // → 'company:settings:write'
P.Music.Playlist.Own      // → 'music:playlist:own'
P.Event.Planning.Read     // → 'event:planning:read'

P.Company.Playlist        // ✗ compile error — Playlist doesn't exist under Company
```

Structure:

```ts
export const P = {
  Company: {
    Settings: { Read, Write, Delete },
    Members:  { Read, Write, Invite },
  },
  Music: {
    Playlist: { Read, Write, Delete, Own },
    Setlist:  { Read, Write },
    Library:  { Read, Write },
    Track:    { Read, Write, Delete },
  },
  Event: {
    Planning: { Read, Write },
  },
} as const;
```

### Decorator: `@RequirePermission(...permissions)`

Direct, no template literals, full autocompletion:

```ts
import { P } from '@sh3pherd/shared-types';

@ContractScoped()
@RequirePermission(P.Company.Settings.Write)
@Patch('settings')
updateSettings(...) { ... }

// Multiple permissions (ALL must be granted)
@ContractScoped()
@RequirePermission(P.Music.Playlist.Write, P.Music.Setlist.Read)
@Post('playlist')
createPlaylist(...) { ... }
```

### Role Templates

Uses `P` for exact permissions and string wildcards for broad grants:

```ts
export const ROLE_TEMPLATES: Record<TContractRole, TPermission[]> = {
  owner: ['*'],
  admin: ['company:*', 'music:*:read', 'event:*', P.Company.Members.Invite],
  artist: [P.Music.Playlist.Own, P.Music.Setlist.Read, P.Event.Planning.Read],
  viewer: [P.Music.Playlist.Read, P.Event.Planning.Read, P.Company.Settings.Read],
};
```

**Resolved values:**

| Role | Permissions |
|------|------------|
| `owner` | `*` (everything) |
| `admin` | `company:*`, `music:*:read`, `event:*`, `company:members:invite` |
| `artist` | `music:playlist:own`, `music:setlist:read`, `event:planning:read` |
| `viewer` | `music:playlist:read`, `event:planning:read`, `company:settings:read` |

### Team-level permissions

Team roles use a separate type `TTeamPermission` (branded string) because they don't include a domain prefix — the domain is resolved at runtime from the team's `type` field.

```ts
// Format: resource:action (no domain prefix)
export const TEAM_ROLE_TEMPLATES: Record<TTeamRole, TTeamPermission[]> = {
  director: ['*', 'members:read', 'members:write', 'members:invite'],
  manager:  ['*:read', '*:write', '*:delete', 'members:read'],
  member:   ['*:own'],
  viewer:   ['*:read'],
};
```

### Wildcard matching

Permission strings use the format `domain:resource:action`. Wildcards (`*`) match any segment:

| Granted | Required | Match? |
|---------|----------|--------|
| `*` | anything | Yes |
| `company:*` | `company:settings:write` | Yes |
| `music:*:read` | `music:playlist:read` | Yes |
| `music:playlist:read` | `music:playlist:write` | No |
| `event:*` | `event:planning:read` | Yes |

### Permission Registry (auto-populated)

Every call to `@RequirePermission()` automatically registers its permissions in a global `PermissionRegistry` at decoration time (module evaluation). The code is the source of truth — no config file to maintain.

```ts
import { PermissionRegistry } from '../utils/nest/guards/RequirePermission.js';

PermissionRegistry.getAll();   // → ['company:settings:write', 'music:playlist:read', ...]
PermissionRegistry.has('music:playlist:read');  // true
PermissionRegistry.size;       // number of unique permissions
```

**Use cases:**
- Expose via an admin/debug endpoint to list all permissions in the system
- Validate `ROLE_TEMPLATES` against actual permissions at startup
- Generate permission documentation automatically

### Adding a new permission

1. Add the permission to `P` in `permissions.types.ts` (one place)
2. Use `@RequirePermission(P.Company.Invoice.Read)` on the endpoint — auto-registered
3. If a role should have it by default, add it to `ROLE_TEMPLATES`

```ts
// 1. Add to P (this is the only step needed to create a permission)
export const P = {
  Company: {
    Settings: { ... },
    Members:  { ... },
    Invoice: {                          // ← new resource
      Read:  'company:invoice:read',
      Write: 'company:invoice:write',
    },
  },
  ...
} as const;

// 2. Use on endpoint (auto-registered in PermissionRegistry)
@RequirePermission(P.Company.Invoice.Read)

// 3. Grant to roles (if needed)
admin: [..., P.Company.Invoice.Read],
```

### Future: per-user overrides

The `TPermissionOverride` type (`{ grant, revoke }`) is defined in shared-types and stored on `TTeamMember`. When implemented, it will be applied after role template expansion:

```
roles → ROLE_TEMPLATES → base permissions
  + override.grant
  - override.revoke
  = effective permissions
```

---

## 4. Frontend — Sending Contract Context

**File:** `apps/frontend-webapp/src/app/core/utils/ScopedHttpClient.ts`

The `ScopedHttpClient` reads the current contract ID from `UserContextService.currentContractId()` and adds it as an `X-Contract-Id` header.

```ts
// Usage in a service
this.scopedHttp
  .withContract()           // adds X-Contract-Id header
  .withFeature('playlists') // adds X-Feature header (optional)
  .get('/api/protected/playlists');
```

The contract ID comes from `UserContextService.currentContractId`, which is a computed signal derived from the user's preferences (`contract_workspace`).

---

## 5. Complete Request Flow

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│                                                          │
│  ScopedHttpClient.withContract()                         │
│    → Authorization: Bearer <jwt>                         │
│    → X-Contract-Id: contract_abc-123                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                      BACKEND                             │
│                                                          │
│  1. AuthGuard                                            │
│     └─ JWT → request.user_id                             │
│                                                          │
│  2. ContractContextGuard  (if @ContractScoped)           │
│     ├─ Header X-Contract-Id (or DB fallback)             │
│     ├─ Load contract + verify ownership                  │
│     └─ request.contract_id + request.contract_roles      │
│                                                          │
│  3. PermissionGuard  (if @RequirePermission)             │
│     ├─ Expand roles → permissions (ROLE_TEMPLATES)       │
│     └─ Match required vs granted (wildcard support)      │
│                                                          │
│  4. Controller                                           │
│     ├─ @ActorId()        → TUserId                       │
│     ├─ @ContractId()     → TContractId                   │
│     └─ @ContractRoles()  → TContractRole[]               │
└─────────────────────────────────────────────────────────┘
```

---

## File locations

| Concern | File |
|---------|------|
| AuthGuard | `src/auth/api/auth.guard.ts` |
| ContractContextGuard | `src/contracts/api/contract-context.guard.ts` |
| PermissionGuard + Registry | `src/utils/nest/guards/RequirePermission.ts` |
| PermissionResolver (runtime) | `src/permissions/PermissionResolver.ts` |
| `@ActorId()` | `src/utils/nest/decorators/ActorId.ts` |
| `@ContractId()` | `src/utils/nest/decorators/ContractId.ts` |
| `@ContractRoles()` | `src/utils/nest/decorators/ContractRoles.ts` |
| `@ContractScoped()` | `src/utils/nest/decorators/ContractScoped.ts` |
| `@RequirePermission()` | `src/utils/nest/guards/RequirePermission.ts` |
| `P` object + `TPermission` type | `packages/shared-types/src/permissions.types.ts` |
| `ROLE_TEMPLATES` | `packages/shared-types/src/permissions.types.ts` |
| Express type extensions | `src/types/express/express.d.ts` |
| CORS config | `src/main.ts` |
| Frontend ScopedHttpClient | `apps/frontend-webapp/src/app/core/utils/ScopedHttpClient.ts` |

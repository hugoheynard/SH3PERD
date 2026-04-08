# SH3PHERD — Writing a Controller

Complete guide to writing a NestJS controller in the SH3PHERD backend, covering routing, auth, permissions, Swagger, and response formatting.

---

## Anatomy of a controller

```ts
import { Body, Controller, Param, Patch } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { buildApiResponseDTO } from '../../music/codes.js';
import { apiRequestDTO, apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { type TCompanyId, type TCompanyInfo, type TUserId, type TApiResponse, SCompanyInfo, P } from '@sh3pherd/shared-types';
import { COMPANY_CODES_SUCCESS } from '../company.codes.js';
import { UpdateCompanyInfoCommand } from '../application/commands/UpdateCompanyInfoCommand.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';
import { CompanyInfoPayload } from '../dto/company.dto.js';

@ApiTags('company-settings / info')        // Swagger group
@ApiBearerAuth('bearer')                   // Swagger auth badge
@ContractScoped()                          // All routes require active contract
@Controller()
export class CompanyInfoSettingsController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Update company info',
    description: 'Updates the company name, description and address.',
  })
  @ApiParam({ name: 'id', description: 'Company ID', example: 'company_abc-123' })
  @ApiBody(apiRequestDTO(CompanyInfoPayload))
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.UPDATE_COMPANY_INFO, CompanyInfoPayload))
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  @RequirePermission(P.Company.Settings.Write)    // guards + auto 403 Swagger
  @Patch(':id/settings/info')
  async updateCompanyInfo(
    @Param('id') id: TCompanyId,
    @Body(new ZodValidationPipe(SCompanyInfo)) body: TCompanyInfo,
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TCompanyInfo>> {
    const result = await this.commandBus.execute<UpdateCompanyInfoCommand, TCompanyInfo>(
      new UpdateCompanyInfoCommand({ company_id: id, ...body }, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.UPDATE_COMPANY_INFO, result);
  }
}
```

---

## Step by step

### 1. Choose the scope

Every controller falls into one of 3 auth scopes:

| Scope | Decorator | Example |
|-------|-----------|---------|
| **Unscoped** | `@ActorId()` only | `GET /user/me`, `GET /contracts/me` |
| **Contract-scoped** | `@ContractScoped()` on class or method | `PATCH /company/:id/settings/info` |
| **Platform-level** | `@ActorId()` only (for now) | `POST /companies` (create company) |

**Contract-scoped** routes require the user to have an active contract. The `ContractContextGuard` resolves the contract from the `X-Contract-Id` header (or falls back to DB preferences), loads the contract, verifies ownership, and attaches `request.contract_id` + `request.contract_roles`.

```ts
// All routes in this controller need a contract
@ContractScoped()
@Controller()
export class MyController { ... }

// Or on a single method
@ContractScoped()
@Patch('settings')
updateSettings(...) { ... }
```

### 2. Add permissions

Use `@RequirePermission()` with values from the `P` object. This decorator does 3 things:

1. **Guards** the route at runtime (403 if denied)
2. **Registers** the permission in the global `PermissionRegistry`
3. **Adds** `@ApiResponse({ status: 403 })` to Swagger automatically

```ts
import { P } from '@sh3pherd/shared-types';

@RequirePermission(P.Company.Settings.Write)        // single permission
@RequirePermission(P.Music.Playlist.Write, P.Music.Setlist.Read)  // multiple (ALL required)
```

Available permissions — autocomplete from `P`:

```
P.Company.Settings.{Read, Write, Delete}
P.Company.Members.{Read, Write, Invite}
P.Company.OrgChart.{Read, Write}
P.Music.Playlist.{Read, Write, Delete, Own}
P.Music.Setlist.{Read, Write}
P.Music.Library.{Read, Write}
P.Music.Track.{Read, Write, Delete}
P.Event.Planning.{Read, Write}
```

> **No need to add `@ApiResponse({ status: 403 })` manually** — `@RequirePermission` handles it.

### 3. Create the DTO (Swagger payload)

DTOs are Zod-derived classes that Swagger uses to document request/response shapes.

```ts
// In src/<domain>/dto/<domain>.dto.ts
import { createZodDto } from 'nestjs-zod';
import { ApiModel } from '../../utils/swagger/api-model.swagger.util.js';
import { SCompanyInfo } from '@sh3pherd/shared-types';

@ApiModel()  // auto-registers in Swagger extraModels
export class CompanyInfoPayload extends createZodDto(SCompanyInfo) {}
```

If no Zod schema exists, use manual `@ApiProperty()`:

```ts
@ApiModel()
export class CompanyDetailPayload {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ required: false }) description?: string;
}
```

### 4. Define API codes

Each domain has a `codes.ts` file with business response codes:

```ts
// src/<domain>/api/codes/<domain>.codes.ts
import type { TApiMessage } from '@sh3pherd/shared-types';

export const COMPANY_CODES_SUCCESS = {
  UPDATE_COMPANY_INFO: {
    code: 'COMPANY_INFO_UPDATED',
    message: 'Company info updated successfully.',
  },
} as const satisfies Record<string, TApiMessage>;
```

### 5. Wire the Swagger decorators

```ts
// Summary + description
@ApiOperation({
  summary: 'Update company info',
  description: 'Detailed description of what the endpoint does.',
})

// Path params
@ApiParam({ name: 'id', description: 'Company ID', example: 'company_abc-123' })

// Request body — references the DTO
@ApiBody(apiRequestDTO(CompanyInfoPayload))

// Success response — wraps in the { code, message, data } envelope
@ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.UPDATE_COMPANY_INFO, CompanyInfoPayload))
@ApiResponse(apiSuccessDTO(CODE, Payload, 201))  // custom status

// Error responses (403 is auto-added by @RequirePermission)
@ApiResponse({ status: 400, description: 'Validation failed.' })
@ApiResponse({ status: 404, description: 'Not found.' })
```

### 6. Validate the request body

Use `ZodValidationPipe` with the Zod schema from shared-types:

```ts
@Body(new ZodValidationPipe(SCompanyInfo)) body: TCompanyInfo
```

### 7. Extract context from the request

Available parameter decorators:

| Decorator | Returns | Requires |
|-----------|---------|----------|
| `@ActorId()` | `TUserId` | AuthGuard (always present on `/protected/*`) |
| `@ContractId()` | `TContractId` | `@ContractScoped()` |
| `@ContractRoles()` | `TContractRole[]` | `@ContractScoped()` |

```ts
async myHandler(
  @Param('id') id: TCompanyId,
  @Body(new ZodValidationPipe(SMySchema)) body: TMyType,
  @ActorId() actorId: TUserId,
  @ContractId() contractId: TContractId,   // if contract-scoped
): Promise<TApiResponse<TMyType>> { ... }
```

### 8. Execute via CQRS and return

Commands for mutations, queries for reads:

```ts
// Command
const result = await this.commandBus.execute<MyCommand, TMyDomainModel>(
  new MyCommand(dto, actorId),
);

// Query
const result = await this.queryBus.execute<MyQuery, TMyViewModel>(
  new MyQuery(id),
);
```

Always wrap the return in `buildApiResponseDTO`:

```ts
return buildApiResponseDTO(MY_CODES.SUCCESS, result);
// → { code: 'MY_SUCCESS', message: 'Done.', data: result }
```

Type the return as `Promise<TApiResponse<T>>`:

```ts
async myHandler(...): Promise<TApiResponse<TCompanyInfo>> { ... }
```

---

## Complete decorator stack (top to bottom)

```ts
@ApiTags('domain / sub-group')           // Swagger grouping
@ApiBearerAuth('bearer')                 // Swagger auth indicator
@ContractScoped()                        // contract context guard (class or method level)
@Controller()                            // NestJS route prefix
export class MyController {

  @ApiOperation({ summary, description })   // Swagger endpoint doc
  @ApiParam({ name, description, example }) // Swagger path params
  @ApiBody(apiRequestDTO(MyPayload))        // Swagger request body (POST/PATCH/PUT)
  @ApiResponse(apiSuccessDTO(CODE, Payload))// Swagger 200 response
  @ApiResponse({ status: 400, ... })        // Swagger error responses
  @RequirePermission(P.Domain.Resource.Act) // permission guard + auto 403 Swagger + registry
  @Patch(':id')                             // HTTP method + route
  async myHandler(
    @Param('id') id: TMyId,                 // path param
    @Body(new ZodValidationPipe(S)) body: T,// validated body
    @ActorId() actorId: TUserId,            // authenticated user
  ): Promise<TApiResponse<T>> {
    const result = await this.commandBus.execute(new MyCommand(body, actorId));
    return buildApiResponseDTO(CODE, result);
  }
}
```

---

## Controller organization

One controller per concern. Split by action group, not by entity:

```
company/api/
├── company.controller.ts              # CRUD (create, get, delete) — NOT contract-scoped
├── orgchart-views.controller.ts       # GET orgchart + org-nodes — contract-scoped
├── orgnode.controller.ts              # Org node CRUD — contract-scoped
├── orgnode-members.controller.ts      # Org node members — contract-scoped
└── settings/
    ├── company-info-settings.controller.ts   # PATCH settings/info — contract-scoped
    └── org-layers-settings.controller.ts     # PATCH settings/org-layers — contract-scoped
```

**Why split?**
- `@ContractScoped()` works at both class and method level, but class-level is cleaner when all routes share the same scope
- Splitting avoids mixing scoped and unscoped endpoints in the same controller
- Each file is short (~50 lines), easy to read
- A dev opens one file and sees the full context: scope, permission, Swagger, handler

> **Tip:** If a controller has a mix of scoped and unscoped routes, use `@ContractScoped()` at method level on individual routes instead of splitting.

---

## File locations

| What | Where |
|------|-------|
| Controller | `src/<domain>/api/<name>.controller.ts` |
| DTO (Swagger) | `src/<domain>/dto/<domain>.dto.ts` |
| API codes | `src/<domain>/api/codes/<domain>.codes.ts` |
| Command/Query handler | `src/<domain>/application/commands/` or `queries/` |
| Zod schemas | `packages/shared-types/src/` |
| Permission registry (`P`) | `packages/shared-types/src/permissions.types.ts` |
| Module registration | `src/<domain>/<domain>.module.ts` |

---

## Checklist

- [ ] Controller class created with `@ApiTags`, `@ApiBearerAuth`, `@Controller`
- [ ] Scope chosen: `@ContractScoped()` if needed, or just `@ActorId()`
- [ ] Permission set: `@RequirePermission(P.X.Y.Z)` (auto-generates 403 Swagger)
- [ ] DTO created: `@ApiModel() class XPayload extends createZodDto(SSchema) {}`
- [ ] API codes defined in `codes.ts`
- [ ] Swagger wired: `@ApiOperation`, `@ApiBody(apiRequestDTO(...))`, `@ApiResponse(apiSuccessDTO(...))`
- [ ] Body validated: `@Body(new ZodValidationPipe(SSchema))`
- [ ] Handler executes via `commandBus` or `queryBus`
- [ ] Return wrapped: `buildApiResponseDTO(CODE, result)`
- [ ] Return typed: `Promise<TApiResponse<T>>`
- [ ] Controller registered in `<domain>.module.ts`

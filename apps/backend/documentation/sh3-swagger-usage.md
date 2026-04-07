# SH3PHERD - Swagger Documentation Pattern

## Overview

The project uses a **Zod-first approach** to Swagger documentation:
1. Domain models are defined as Zod schemas in `@sh3pherd/shared-types`
2. DTOs are derived from those schemas via `createZodDto` (from `nestjs-zod`)
3. DTOs are registered globally with `@ApiModel()`
4. Responses are wrapped in a standardized `{ code, message, data }` envelope via `apiSuccessDTO()`

This keeps a **single source of truth** (the Zod schema) for validation, TypeScript types, AND Swagger docs.

---

## Architecture

```
shared-types (Zod schema)
       |
       v
  createZodDto()  -->  DTO class (nestjs-zod)
       |
       v
  @ApiModel()     -->  registered globally in Swagger extraModels
       |
       v
  apiSuccessDTO() -->  @ApiResponse() with standardized envelope
```

---

## Step-by-step: Documenting an endpoint

### 1. Zod schema (shared-types)

The schema lives in `packages/shared-types/src/`. It defines the shape AND serves as the runtime validator.

```ts
// packages/shared-types/src/user/user.viewModel.ts
export const SUserMeViewModel = z.object({
  id:          SUserId,
  profile:     SUserProfileDomainModel,
  preferences: SUserPreferences,
});
export type TUserMeViewModel = z.infer<typeof SUserMeViewModel>;
```

### 2. DTO class (backend)

In the domain's `dto/` folder (or co-located with the query/command), derive a class from the Zod schema. The `@ApiModel()` decorator auto-registers it in Swagger's `extraModels`.

```ts
// src/user/dtos/user.dto.ts
import { SUserMeViewModel } from '@sh3pherd/shared-types';
import { ApiModel } from '../../utils/swagger/api-model.swagger.util.js';
import { createZodDto } from 'nestjs-zod';

@ApiModel()
export class UserMeViewModelPayload extends createZodDto(SUserMeViewModel) {}
```

**Key points:**
- `createZodDto(schema)` generates a NestJS-compatible class with Swagger metadata derived from the Zod schema
- `@ApiModel()` pushes the class into a global registry so `SwaggerModule.createDocument()` picks it up via `extraModels: getApiModels()`
- Naming convention: `<DomainObject>Payload` (e.g. `UserMeViewModelPayload`, `VersionTrackPayload`)

### 3. API codes

Each domain defines its success/error codes as a `Record<string, TApiMessage>`:

```ts
// src/user/api/codes/user.codes.ts
import type { TApiMessage } from '@sh3pherd/shared-types';

export const USER_CODES_SUCCESS = {
  GET_USER_ME: {
    code: 'GET_USER_ME_SUCCESS',
    message: 'Session User information retrieved successfully',
  },
} as const satisfies Record<string, TApiMessage>;
```

### 4. Controller endpoint

Wire it all together with `@ApiResponse(apiSuccessDTO(...))`:

```ts
// src/user/api/user.controller.ts
@ApiTags('user')
@ApiBearerAuth('bearer')
@Controller()
export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get current user informations',
    description: "Returns the current user's profile and preferences.",
  })
  @ApiResponse(apiSuccessDTO(USER_CODES_SUCCESS.GET_USER_ME, UserMeViewModelPayload, 200))
  @Get('me')
  async getUserMe(@ActorId() id: TUserId): TAsyncApiResponseDTO<TUserMeViewModel> {
    return buildApiResponseDTO<TUserMeViewModel>(
      USER_CODES_SUCCESS.GET_USER_ME,
      await this.queryBus.execute(new GetCurrentUserViewModelQuery(id)),
    );
  }
}
```

---

## Key utilities reference

### `@ApiModel()` - `src/utils/swagger/api-model.swagger.util.ts`

Class decorator that registers a DTO in a global metadata store. All registered models are injected into Swagger via `getApiModels()` in `main.ts`:

```ts
const document = SwaggerModule.createDocument(app, config, {
  extraModels: getApiModels(),
});
```

### `apiSuccessDTO()` - `src/utils/swagger/api-response.swagger.util.ts`

Generates a Swagger `@ApiResponse` config that wraps the DTO in the standard envelope:

```ts
apiSuccessDTO(code: { code: string; message: string }, model: Type, status?: number, description?: string)
```

**Produces this Swagger schema:**
```json
{
  "code": "GET_USER_ME_SUCCESS",
  "message": "Session User information retrieved successfully",
  "data": { "$ref": "#/components/schemas/UserMeViewModelPayload" }
}
```

### `buildApiResponseDTO()` - `src/music/codes.ts`

Runtime wrapper that builds the actual response payload matching the Swagger shape:

```ts
function buildApiResponseDTO<T>(entry: TApiMessage, data: T): TApiResponse<T>
// Returns: { code: string, message: string, data: T }
```

### `@ResPayloadValidator()` - `src/utils/nest/ResPayloadValidator.decorator.ts`

Optional runtime interceptor that validates the response payload against the DTO schema before sending. Currently used with `{ active: false }` (disabled) but can be toggled on for strict validation:

```ts
@ResPayloadValidator(UserMeViewModelPayload, { active: false })
```

---

## Response envelope format

All API responses follow the `TApiResponse<T>` shape:

```ts
type TApiResponse<T> = {
  code: string;     // business code (e.g. "GET_USER_ME_SUCCESS")
  message: string;  // human-readable message
  data: T;          // the actual payload
};
```

---

## Two DTO approaches in the codebase

### Approach A: Zod-derived (preferred for new code)

Best when a Zod schema already exists in shared-types. Zero duplication.

```ts
@ApiModel()
export class UserMeViewModelPayload extends createZodDto(SUserMeViewModel) {}
```

### Approach B: Manual @ApiProperty (legacy / complex shapes)

Used when the shape doesn't map 1:1 to a Zod schema, or for nested view models with computed fields:

```ts
@ApiModel()
export class CompanyDetailViewModelPayload {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() owner_id!: string;
  @ApiProperty() status!: string;
  @ApiProperty() activeTeamCount!: number;
  @ApiProperty() activeContractCount!: number;
}
```

**Prefer Approach A** whenever possible. Use Approach B only when Zod-derived metadata is insufficient (e.g. the Swagger output needs custom `example` or `description` on individual fields).

---

## Checklist for adding Swagger to a new endpoint

1. Ensure a Zod schema exists in `@sh3pherd/shared-types` for the response shape
2. Create a DTO class: `@ApiModel() export class XPayload extends createZodDto(SSchema) {}`
3. Define API codes in the domain's `codes.ts` file
4. On the controller method:
   - `@ApiOperation({ summary, description })`
   - `@ApiResponse(apiSuccessDTO(CODE, PayloadDTO, httpStatus))`
5. Wrap the handler return with `buildApiResponseDTO(CODE, data)`
6. Type the return as `TAsyncApiResponseDTO<TDomainType>`

---

## File locations

| Concern | Location |
|---------|----------|
| Zod schemas | `packages/shared-types/src/` |
| DTO classes | `src/<domain>/dto/<domain>.dto.ts` or co-located with query/command |
| API codes | `src/<domain>/api/codes/<domain>.codes.ts` or `src/<domain>/codes.ts` |
| `@ApiModel()` decorator | `src/utils/swagger/api-model.swagger.util.ts` |
| `apiSuccessDTO()` / `apiError()` | `src/utils/swagger/api-response.swagger.util.ts` |
| `buildApiResponseDTO()` | `src/music/codes.ts` (shared, should be moved to utils) |
| `@ResPayloadValidator()` | `src/utils/nest/ResPayloadValidator.decorator.ts` |
| Swagger bootstrap | `src/main.ts` (DocumentBuilder + SwaggerModule) |

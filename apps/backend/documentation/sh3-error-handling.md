# SH3PHERD — Error Handling Pipeline

## Overview

All errors flow through a single `GlobalExceptionFilter` that maps each error type to a consistent JSON response. The client always receives:

```json
{
  "statusCode": 404,
  "errorCode": "COMPANY_NOT_FOUND",
  "message": "Company not found"
}
```

---

## Error Classes

Three custom error classes, each for a different layer:

### DomainError — entity/aggregate invariant violation

**Thrown from:** entities, aggregates, policies
**HTTP status:** always 400
**Client sees:** the error message + code

```ts
throw new DomainError('Name cannot be empty', {
  code: 'COMPANY_NAME_REQUIRED',
  context: { field: 'name' },        // optional — for debugging
});
```

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `message` | `string` | yes | Human-readable description |
| `code` | `string` | yes | Machine-readable error code |
| `context` | `Record<string, unknown>` | no | Debug metadata (field name, value, etc.) |

### BusinessError — use-case level error

**Thrown from:** command/query handlers, controllers
**HTTP status:** its own `status` field (404, 403, 409, etc.)
**Client sees:** the error message + code

```ts
throw new BusinessError('Company not found', {
  code: 'COMPANY_NOT_FOUND',
  status: 404,
});
```

| Field | Type | Required | Default | Purpose |
|-------|------|----------|---------|---------|
| `message` | `string` | yes | — | Human-readable description |
| `code` | `string` | yes | — | Machine-readable error code |
| `status` | `number` | no | `400` | HTTP status code |

### TechnicalError — infrastructure failure

**Thrown from:** repositories, external service calls, DB operations
**HTTP status:** always 500
**Client sees:** generic "An internal error occurred" (no details leaked)
**Server logs:** full details including cause chain and context

```ts
throw new TechnicalError('Failed to update company', {
  code: 'COMPANY_UPDATE_FAILED',
  cause: mongoError,                   // optional — chained Error (ES2022)
  context: {                           // optional — debug metadata
    companyId: 'company_abc',
    operation: 'updateOne',
  },
});
```

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `message` | `string` | yes | Internal description (not sent to client) |
| `code` | `string` | yes | Machine-readable error code |
| `cause` | `Error` | no | Original error (chained via ES2022 `Error.cause`) |
| `context` | `Record<string, unknown>` | no | IDs, operation name, metadata for investigation |

---

## GlobalExceptionFilter

**File:** `src/utils/errorManagement/GlobalExceptionFilter.ts`
**Registered:** globally via `APP_FILTER` in `app.module.ts`

### Resolution table

| Exception type | HTTP status | Error code source | Client message | Logged |
|----------------|-------------|-------------------|----------------|--------|
| `DomainError` | 400 | `error.code` | error message | no |
| `BusinessError` | `error.status` | `error.code` | error message | no |
| `TechnicalError` | 500 | `error.code` | "An internal error occurred." | yes (+ cause + context) |
| `HttpException` (NestJS) | exception status | from response body | from response body | no |
| Generic `Error` with `UPPER_CASE` message | 400 | error message | error message | no |
| Unknown | 500 | `INTERNAL_ERROR` | "An unexpected error occurred." | yes |

### Logging behavior

- **4xx errors** — not logged (expected behavior)
- **5xx errors** — logged with full stack trace
- **TechnicalError** — additionally logs `cause.stack` and `context` for investigation

---

## When to use which

```
Entity validates input          → DomainError   (400)
Handler: not found              → BusinessError (404)
Handler: forbidden              → BusinessError (403)
Handler: conflict               → BusinessError (409)
Handler: invalid input          → BusinessError (400)
Auth: bad credentials           → BusinessError (400)
Auth: deactivated               → BusinessError (403)
Auth: token issue               → BusinessError (401)
DB write failed                 → TechnicalError(500)
External service timeout        → TechnicalError(500)
Transaction failed              → TechnicalError(500)
```

---

## Error code conventions

- **UPPER_SNAKE_CASE** — e.g. `COMPANY_NOT_FOUND`, `ORGNODE_NAME_REQUIRED`
- **Prefix with domain** — `COMPANY_`, `ORGNODE_`, `CONTRACT_`, `USER_`
- **Suffix with nature** — `_NOT_FOUND`, `_REQUIRED`, `_FORBIDDEN`, `_FAILED`, `_ALREADY_EXISTS`

---

## File locations

| File | Purpose |
|------|---------|
| `src/utils/errorManagement/errorClasses/DomainError.ts` | Domain rule violations |
| `src/utils/errorManagement/errorClasses/BusinessError.ts` | Use-case level errors |
| `src/utils/errorManagement/errorClasses/TechnicalError.ts` | Infrastructure failures |
| `src/utils/errorManagement/GlobalExceptionFilter.ts` | Global catch-all filter |

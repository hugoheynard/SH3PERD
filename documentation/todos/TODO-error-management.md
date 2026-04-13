# TODO — 2026-04-08

## Theme: Error handling pipeline (backend → frontend)

### 1. Refactor error classes ✅
- [x] Review `BusinessError`, `TechnicalError`, `DomainError` — clarify when to use each
- [x] Define a clear taxonomy:
  - **DomainError** — entity/aggregate invariant violation (thrown from entities/policies)
  - **BusinessError** — use-case level error (not found, forbidden, conflict)
  - **TechnicalError** — infra failure (DB down, external service timeout)
- [x] Standardize constructor signatures:
  - `DomainError(message, { code, context? })`
  - `BusinessError(message, { code, status? })`
  - `TechnicalError(message, { code, cause?, context? })`
- [x] Ensure all errors carry a machine-readable `code` (mandatory on all 3 classes)
- [x] Migrate ~35 usages across the codebase

### 2. NestJS exception filter pipeline ✅
- [x] `GlobalExceptionFilter` already existed — updated for new property names
- [x] Mapping:
  - DomainError → 400
  - BusinessError → its `status` field (404, 403, 409...)
  - TechnicalError → 500 (logs cause + context, generic message to client)
  - HttpException (NestJS) → its status
  - Unknown → 500
- [x] Standardized response shape: `{ statusCode, errorCode, message }`
- [x] Guards throw NestJS exceptions (UnauthorizedException, ForbiddenException) — filter handles them

### 3. Frontend error handling ✅
- [x] Created `errorInterceptor` — global HTTP error handler
- [x] Strategy: 401 → logout, 403 → toast, 500 → toast, 400/404 → caller handles
- [x] Uses backend `message` directly in toasts (no frontend mapping needed)
- [x] Re-throws errors so `.subscribe({ error })` still fires
- [x] Registered in `app.config.ts` after `authInterceptor`
- [x] Documented in `frontend-webapp/documentation/sh3-error-handling.md`

### 4. Test & verify
- [x] Backend error classes tested (21 tests passing)
- [x] GlobalExceptionFilter tested (DomainError, BusinessError, TechnicalError, HttpException, unknown)
- [ ] E2E: trigger each error type from the UI and verify toasts
- [ ] E2E: verify 401 logout + redirect
- [x] Backend doc: `documentation/sh3-error-handling.md`
- [x] Frontend doc: `frontend-webapp/documentation/sh3-error-handling.md`

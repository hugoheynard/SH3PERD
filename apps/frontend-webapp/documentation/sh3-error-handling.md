# SH3PHERD Frontend — Error Handling

## Overview

HTTP errors are handled in two layers:
1. **`errorInterceptor`** — global, handles common cases (401, 403, 500, network errors)
2. **Store/component `.subscribe({ error })`** — specific, handles domain-specific cases (form validation, redirects)

The interceptor shows toasts and re-throws — the error always reaches the subscriber.

---

## Error Interceptor

**File:** `src/interceptors/error.interceptor.ts`
**Registered in:** `app.config.ts` (after `authInterceptor`)

### Behavior table

| HTTP status | Action | Toast message |
|-------------|--------|---------------|
| **401** | `AuthService.logout()` + redirect to login | none (redirect) |
| **403** | toast | Backend message or "You don't have permission" |
| **500+** | toast | Backend message or "Something went wrong" |
| **0** (network) | toast | "Unable to reach the server" |
| **400, 404, 409** | nothing — caller handles | — |

### Why 400/404 are not toasted globally

- **400** — often a form validation error → should be displayed inline, not as a toast
- **404** — sometimes expected (e.g. checking if a resource exists) → caller decides

### Interceptor chain order

```
Request
  → authInterceptor    (attaches Bearer token, retries on 401 via refresh)
  → errorInterceptor   (toasts for 403/500, logout on 401 after retry failed)
  → server
```

If the `authInterceptor` successfully refreshes on 401, the error never reaches `errorInterceptor`.
If the refresh fails, the 401 passes through and `errorInterceptor` logs the user out.

---

## Backend Error Response Shape

Every error from the backend follows this shape:

```json
{
  "statusCode": 404,
  "errorCode": "COMPANY_NOT_FOUND",
  "message": "Company not found"
}
```

The interceptor reads `error.error.message` to get the human-readable backend message for toasts.

---

## Store/Component Error Handling

### Pattern 1: Let the interceptor handle it (most common)

```ts
this.service.updateSettings(dto).subscribe({
  next: (res) => { /* success */ },
  // No error handler needed — interceptor toasts 403/500 automatically
});
```

### Pattern 2: Custom error handling (redirect, reset state)

```ts
this.service.loadCompany(id).subscribe({
  next: (res) => this._company.set(res.data),
  error: (err) => {
    // Interceptor already toasted if 403/500
    // Here we handle the specific case: reset state + redirect
    this._company.set(null);
    this.router.navigate(['/app/company']);
  },
});
```

### Pattern 3: Form validation errors (400)

```ts
this.service.createUser(form).subscribe({
  next: () => { /* success */ },
  error: (err: HttpErrorResponse) => {
    if (err.status === 400) {
      // Display inline error from backend
      this.formError.set(err.error.message);
    }
    // 403/500 already toasted by interceptor
  },
});
```

---

## When to add error handling in a store/component

| Situation | What to do |
|-----------|------------|
| Normal CRUD (success or toast) | Nothing — interceptor handles errors |
| Need to reset state on failure | Add `error:` handler to reset signals |
| Need to redirect on failure | Add `error:` handler with `router.navigate` |
| Form validation (400) | Add `error:` handler to display inline |
| Custom toast message | Add `error:` handler with `toast.show(custom)` |

---

## File Locations

| File | Purpose |
|------|---------|
| `src/interceptors/error.interceptor.ts` | Global HTTP error interceptor |
| `src/interceptors/auth.interceptor.ts` | Auth token + 401 refresh |
| `src/app/app.config.ts` | Interceptor registration |
| `src/app/shared/toast/toast.service.ts` | Toast notification service |

---

> **Maintenance note:** Any change to the error handling pipeline (interceptor behavior, new status code handling, toast strategy) must be accompanied by an update to this document.

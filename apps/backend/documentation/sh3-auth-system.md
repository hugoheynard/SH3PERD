# SH3PHERD — Authentication System

Complete technical documentation for the authentication system: registration, login, token lifecycle, password management, and security hardening.

> For the request pipeline (guards, contract context, permissions), see [sh3-auth-and-context.md](sh3-auth-and-context.md).

---

## Architecture Overview

```mermaid
graph TB
    subgraph Frontend
        UI[Angular App]
        AI[Auth Interceptor]
        AS[Auth Service]
    end

    subgraph Backend["Backend (NestJS)"]
        AC[Auth Controller]
        subgraph CQRS[Command Handlers]
            REG[RegisterUser]
            LOG[Login]
            REF[RefreshSession]
            OUT[Logout]
            CHP[ChangePassword]
            FGT[ForgotPassword]
            RST[ResetPassword]
        end
        subgraph Core[Auth Core Services]
            JWT[JwtService<br/>RS256]
            RTS[RefreshTokenService<br/>SHA-256 hashing]
            PWD[PasswordService<br/>Argon2id + auto-migration]
            TSV[TurnstileService<br/>captcha verify]
        end
        subgraph Repos[Repositories]
            UCRED[(user_credentials)]
            RTDB[(refreshToken)]
            PRTDB[(password_reset_tokens)]
        end
    end

    CFAPI[(Cloudflare<br/>siteverify)]

    UI --> AI --> AS --> AC
    AC --> TSV
    TSV -->|POST| CFAPI
    AC --> CQRS
    CQRS --> Core
    CQRS --> Repos
    Core --> Repos
```

---

## Token Architecture

```mermaid
sequenceDiagram
    participant B as Browser
    participant F as Frontend
    participant A as Backend

    Note over B,A: === LOGIN ===
    F->>A: POST /auth/login {email, password, turnstileToken}
    A->>A: Verify Turnstile token (see Captcha section)
    A->>A: Verify password (Argon2id)
    A->>A: Generate JWT access token (RS256, 15min)
    A->>A: Generate refresh token
    A->>A: Hash refresh token (SHA-256)
    A->>A: Store hash in DB
    A-->>B: Set-Cookie: sh3pherd_refreshToken (HttpOnly, raw token)
    A-->>F: { authToken, user_id }
    F->>F: Store authToken in memory signal

    Note over B,A: === AUTHENTICATED REQUEST ===
    F->>A: GET /api/protected/... + Authorization: Bearer <jwt>
    A->>A: AuthGuard verifies JWT
    A-->>F: 200 OK

    Note over B,A: === TOKEN REFRESH (JWT expired) ===
    F->>A: GET /api/protected/... + Authorization: Bearer <expired_jwt>
    A-->>F: 401 Unauthorized
    F->>A: POST /auth/refresh (cookie sent automatically)
    A->>A: Hash cookie value → find in DB
    A->>A: Verify: not revoked, not expired
    A->>A: Mark old token as revoked (soft-delete)
    A->>A: Generate new JWT + new refresh token
    A->>A: Hash new refresh token → store
    A-->>B: Set-Cookie: new refresh token
    A-->>F: { authToken, user_id }
    F->>A: Retry original request with new JWT

    Note over B,A: === LOGOUT ===
    F->>A: POST /auth/logout + cookie
    A->>A: Hash cookie → find token family
    A->>A: Soft-delete entire family (isRevoked: true)
    A-->>B: Clear-Cookie
```

---

## Token Storage Security

| Token                    | Where stored             | How stored                            | Lifetime   |
| ------------------------ | ------------------------ | ------------------------------------- | ---------- |
| **Access token (JWT)**   | Frontend memory (signal) | Raw — not persisted to disk           | 15 minutes |
| **Refresh token**        | Browser HttpOnly cookie  | Raw in cookie, **SHA-256 hash** in DB | 7 days     |
| **Password reset token** | Email/console            | Raw in link, **SHA-256 hash** in DB   | 1 hour     |

### Why hash refresh tokens?

A database breach exposes all stored tokens. If tokens are stored in plain text, an attacker can immediately hijack all active sessions. With SHA-256 hashing, the stored hash is useless without the raw token (which only exists in the user's HttpOnly cookie).

```mermaid
graph LR
    RT[Raw Token<br/>refreshToken_abc-123] -->|SHA-256| H[Hash<br/>a1b2c3...64 hex chars]
    RT -->|sent to| C[HttpOnly Cookie]
    H -->|stored in| DB[(MongoDB)]

    style RT fill:#f9f,stroke:#333
    style C fill:#9f9,stroke:#333
    style DB fill:#99f,stroke:#333
```

---

## Password Security

### Hashing Strategy

```mermaid
graph TD
    P[Plain password] -->|PasswordService.hashPassword| S{Current strategy}
    S -->|argon2id:v1| A[Argon2id<br/>timeCost=3, memory=128MB<br/>parallelism=2, hashLength=32]
    S -->|bcrypt:v1| B[Bcrypt<br/>saltRounds=12]
    A --> H[Versioned hash<br/>argon2id:v1$2026-04-13$salt$hash]
    B --> H
```

**Auto-migration on login:**

```mermaid
flowchart TD
    L[Login attempt] --> V{Password valid?}
    V -->|No| F[❌ 400 Invalid credentials]
    V -->|Yes| R{Needs rehash?}
    R -->|Different algorithm| Y[Rehash with current strategy]
    R -->|Hash > 30 days old| Y
    R -->|Same algo, recent| N[Skip rehash]
    Y --> S[Save new hash to DB]
    S --> OK[✅ Login success]
    N --> OK
```

### Account Lockout

```mermaid
stateDiagram-v2
    [*] --> Normal
    Normal --> Attempt1: Failed login
    Attempt1 --> Attempt2: Failed login
    Attempt2 --> Attempt3: Failed login
    Attempt3 --> Attempt4: Failed login
    Attempt4 --> Locked: Failed login (5th)
    Locked --> Normal: 15 min elapsed
    Attempt1 --> Normal: Successful login (reset counter)
    Attempt2 --> Normal: Successful login (reset counter)
    Attempt3 --> Normal: Successful login (reset counter)
    Attempt4 --> Normal: Successful login (reset counter)

    Locked: ⛔ HTTP 429
    Locked: locked_until = now + 15min
```

**Fields on `UserCredential`:**

- `failed_login_count` — incremented on each wrong password, reset to 0 on success
- `locked_until` — set to `now + 15min` when `failed_login_count >= 5`

---

## Password Reset Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Backend
    participant DB as MongoDB

    Note over U,DB: === FORGOT PASSWORD ===
    U->>F: Click "Forgot password"
    F->>A: POST /auth/forgot-password {email}
    A->>DB: Find user by email
    alt User exists
        A->>A: Generate raw token (pwReset_uuid)
        A->>A: Hash token (SHA-256)
        A->>DB: Delete old reset tokens for user
        A->>DB: Store {token: hash, user_id, expiresAt: +1h, usedAt: null}
        A->>A: Log reset link (TODO: send email)
    end
    A-->>F: 200 "If account exists, link sent"

    Note over U,DB: === RESET PASSWORD ===
    U->>F: Click reset link with token
    F->>A: POST /auth/reset-password {token, newPassword}
    A->>A: Hash incoming token (SHA-256)
    A->>DB: Find by hashed token
    A->>A: Validate: exists + not expired + not used
    A->>A: Hash new password (Argon2id)
    A->>DB: Update password + reset lockout fields
    A->>DB: Mark token as used (usedAt = now)
    A->>DB: Delete all refresh tokens (force re-login)
    A-->>F: 200 "Password reset successfully"
```

---

## Refresh Token Rotation & Theft Detection

```mermaid
graph TD
    subgraph "Token Family (same login session)"
        T1[Token A<br/>family: fam-1] -->|refresh| T2[Token B<br/>family: fam-1]
        T2 -->|refresh| T3[Token C<br/>family: fam-1]
    end

    T1 -.->|revoked| R1[isRevoked: true]
    T2 -.->|revoked| R2[isRevoked: true]

    subgraph "Theft Detection"
        STOLEN[Attacker uses Token A again]
        STOLEN -->|"Token A is revoked!"| ALARM[🚨 Entire family invalidated]
        ALARM --> DEL[Delete all tokens<br/>with family_id = fam-1]
    end
```

**How it works:**

1. Each login creates a new **token family** (random UUID)
2. Each refresh **rotates** the token: old token soft-deleted (`isRevoked: true`), new token created in same family
3. If a **revoked token is reused** → entire family is invalidated (attacker + legitimate user both lose access)
4. Legitimate user must re-login — better than allowing an attacker to maintain access

---

## Cookie Configuration

| Property   | Dev              | Production                 |
| ---------- | ---------------- | -------------------------- |
| `httpOnly` | `true` (default) | **Always `true`** (forced) |
| `secure`   | `false`          | `true`                     |
| `sameSite` | `lax`            | `strict`                   |
| `path`     | `/api/auth`      | `/api/auth`                |
| `maxAge`   | 7 days           | 7 days                     |

**File:** `src/appBootstrap/config/secureCookieConfig.ts`

The cookie path `/api/auth` covers all auth endpoints (refresh, logout, change-password). Previously was `/api/auth/refresh` which prevented the cookie from being sent on logout.

---

## API Endpoints

| Method | Path                    | Auth            | Throttle | Description                               |
| ------ | ----------------------- | --------------- | -------- | ----------------------------------------- |
| `POST` | `/auth/register`        | Public          | 10/min   | Create account (email + password + name)  |
| `POST` | `/auth/login`           | Public          | 20/min   | Authenticate → JWT + refresh cookie       |
| `POST` | `/auth/refresh`         | Public (cookie) | 10/min   | Rotate tokens via HttpOnly cookie         |
| `POST` | `/auth/logout`          | Bearer          | 30/min   | Revoke token family + clear cookie        |
| `POST` | `/auth/change-password` | Bearer          | 3/min    | Change password + invalidate all sessions |
| `POST` | `/auth/forgot-password` | Public          | 3/min    | Request password reset link               |
| `POST` | `/auth/reset-password`  | Public          | 3/min    | Reset password with token                 |
| `GET`  | `/auth/ping`            | Public          | None     | Health check                              |

---

## Module Structure

```
auth/
├── api/
│   ├── auth.controller.ts              # All auth endpoints
│   ├── auth.guard.ts                   # Global JWT verification guard
│   └── __tests__/
├── application/commands/
│   ├── RegisterUserCommand.ts          # Register → credentials + profile + platform contract
│   ├── LoginCommand.ts                 # Login → lockout check + password verify + session
│   ├── RefreshSessionCommand.ts        # Refresh → hash lookup + rotation + theft detection
│   ├── LogoutCommand.ts                # Logout → soft-delete token family
│   ├── ChangePasswordCommand.ts        # Change password → verify old + wipe sessions
│   ├── ForgotPasswordCommand.ts        # Forgot → generate hashed token + log link
│   ├── ResetPasswordCommand.ts         # Reset → validate token + set password + wipe sessions
│   └── __tests__/                      # Colocated command tests
├── core/
│   ├── auth.service.ts                 # AuthService — orchestrates JWT + refresh creation
│   ├── auth-core.module.ts             # DI wiring for core services
│   ├── TokenFunctions.module.ts        # Exposes verify functions for AuthGuard
│   ├── __tests__/
│   ├── password-manager/
│   │   ├── PasswordService.ts          # Hash + compare + auto-migration
│   │   ├── hasherRegistry/             # Strategy registry (argon2id, bcrypt)
│   │   ├── strategies/                 # Argon2Hasher, BcryptHasher, BaseHasherStrategy
│   │   ├── utils/                      # HashParser, isRehashDue
│   │   └── types/
│   └── token-manager/
│       ├── JwtService.ts               # RS256 JWT sign + verify
│       ├── RefreshTokenService.ts      # Generate, verify, revoke refresh tokens
│       ├── hashToken.ts                # SHA-256 token hashing utility
│       └── __tests__/
├── repositories/
│   ├── RefreshTokenMongoRepository.ts
│   └── PasswordResetTokenMongoRepo.ts
├── types/
│   ├── auth.core.contracts.ts          # Function type signatures
│   ├── auth.domain.config.ts           # TAuthConfig (keys, TTL)
│   └── auth.domain.tokens.ts           # TAuthTokenPayload, TSecureCookieConfig, etc.
├── __tests__/
│   ├── test-helpers.ts                 # Shared mocks and factories
│   └── E2E/                            # End-to-end auth tests
├── auth.module.ts                      # NestJS module (controller + handlers)
├── auth.constants.ts                   # Cookie name + path
└── auth.tokens.ts                      # DI symbols (PASSWORD_SERVICE, etc.)
```

---

## Collections

| Collection              | Purpose            | Key fields                                                                            |
| ----------------------- | ------------------ | ------------------------------------------------------------------------------------- |
| `user_credentials`      | User accounts      | `id`, `email`, `password` (hashed), `active`, `failed_login_count`, `locked_until`    |
| `refreshToken`          | Active sessions    | `id`, `refreshToken` (SHA-256 hash), `user_id`, `family_id`, `isRevoked`, `expiresAt` |
| `password_reset_tokens` | Reset requests     | `id`, `token` (SHA-256 hash), `user_id`, `expiresAt`, `usedAt`                        |
| `platform_contracts`    | SaaS subscriptions | `id`, `user_id`, `plan`, `status`                                                     |

---

## Security Summary

| Measure                                                  | Status                       |
| -------------------------------------------------------- | ---------------------------- |
| JWT RS256 asymmetric signing                             | ✅                           |
| Refresh tokens hashed (SHA-256) before storage           | ✅                           |
| Token family rotation with reuse detection               | ✅                           |
| HttpOnly + Secure + SameSite cookies                     | ✅                           |
| Argon2id password hashing with auto-migration            | ✅                           |
| Account lockout (5 attempts → 15 min)                    | ✅                           |
| Auth failure logging                                     | ✅                           |
| CORS from environment variable                           | ✅                           |
| Password change invalidates all sessions                 | ✅                           |
| Password reset with single-use tokens                    | ✅                           |
| Rate limiting per endpoint                               | ✅                           |
| Cloudflare Turnstile captcha on `/login` and `/register` | ✅                           |
| Email verification                                       | ❌ (blocked by mailer setup) |
| 2FA/MFA                                                  | ❌ (v2)                      |

---

## Captcha (Cloudflare Turnstile)

`/auth/login` and `/auth/register` are protected by [Cloudflare Turnstile].
The widget is progressive by design — most human traffic clears it invisibly,
bots get an interactive challenge. We delegate all bot scoring to Cloudflare
and keep zero local state.

[Cloudflare Turnstile]: https://developers.cloudflare.com/turnstile/

### Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant CF as Cloudflare Turnstile
    participant A as Backend

    U->>F: Open login / register
    F->>CF: Load widget (api.js)
    CF-->>F: Silent challenge
    Note over CF,F: Interactive only if suspicious
    F->>A: POST /auth/login { email, password, turnstileToken }
    A->>CF: POST siteverify { secret, response, remoteip }
    alt Cloudflare says success
        CF-->>A: { success: true }
        A->>A: LoginCommand (password check, JWT issue)
        A-->>F: 200 { authToken, refresh cookie }
    else Cloudflare says failure
        CF-->>A: { success: false, error-codes }
        A-->>F: 400 CAPTCHA_FAILED
    else Token missing
        A-->>F: 400 CAPTCHA_REQUIRED
    else Cloudflare unreachable
        A->>A: log warn, fail-open
        A->>A: LoginCommand runs
        A-->>F: 200 (throttling + lockout still apply)
    end
```

### Config

| Env var                | Required  | Default                                                     | Purpose                                                       |
| ---------------------- | --------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| `TURNSTILE_SECRET_KEY` | prod only | —                                                           | Cloudflare server-side secret. Absent = bypass mode (dev/CI). |
| `TURNSTILE_VERIFY_URL` | no        | `https://challenges.cloudflare.com/turnstile/v0/siteverify` | Override for testing / self-hosted proxy.                     |

### Failure mode: fail-open on Cloudflare outage

If the siteverify call fails (network error, 5xx, parse failure) the
service logs a warn and lets the request through. Cloudflare outages
are rare and short; blocking 100% of logins during one would be a
worse incident than a brief window of less-protected traffic.

Three defenses remain active during a fail-open window:

- `@Throttle({ limit: 20, ttl: 60_000 })` on `/login` — 20 attempts/min/IP
- `@Throttle({ limit: 10, ttl: 60_000 })` on `/register` — 10 attempts/min/IP
- Account lockout after 5 failed passwords → 15 min

### Why a 20/min throttle isn't the primary defence

The login/register throttles are intentionally loose. They exist as a
**DDoS floor** (stop a single IP from flooding thousands of requests
per minute), not as the fine-grained brute-force gate. The real gates
are:

- **Captcha (Turnstile)** — tokens are single-use and ~5 min TTL, so
  each request needs a freshly-solved challenge. Legitimate humans get
  this silently (managed mode); bots have to burn a challenge per
  attempt, which Cloudflare scores and progressively blocks.
- **Account lockout** — 5 failed passwords per account → 15 min
  cooldown. Targets credential stuffing directly (per-email, not per-IP).

A tight 5/min throttle would false-positive on legitimate users with
typos, shared NAT (office, campus, mobile carrier), or password manager
replays. The 20/min limit gives humans room to breathe while still
catching the extreme abuse patterns the throttle is actually designed
to stop.

### Error codes

| HTTP | Code               | When                                                                                 |
| ---- | ------------------ | ------------------------------------------------------------------------------------ |
| 400  | `CAPTCHA_REQUIRED` | Captcha enabled, token missing or empty                                              |
| 400  | `CAPTCHA_FAILED`   | Cloudflare returned `success: false` (reused/expired token, hostname mismatch, etc.) |

### Why Turnstile

- **No fingerprinting** — no third-party cookies, GDPR-friendly.
- **Free tier** — 1 M siteverify calls/month.
- **Progressive** — managed mode auto-decides invisible vs interactive.
- **No local state** — captcha logic is entirely offloaded to Cloudflare,
  so we don't need the audit-event infrastructure (see roadmap) to get
  bot protection shipped.

### Implementation

- Service: `src/auth/turnstile/TurnstileService.ts` — verify + fail-open
- Module: `src/auth/turnstile/turnstile.module.ts` — DI wiring under `TURNSTILE_SERVICE`
- Config: `src/auth/turnstile/getTurnstileConfig.ts` — reads env vars
- Wiring: `src/auth/api/auth.controller.ts` — called before the command bus on both endpoints
- Shared-types: `SLoginRequestDTO`, `SRegisterUserRequestDTO` carry the optional `turnstileToken`

---

## CORS Configuration

**File:** `src/main.ts`

```
Origin:         process.env['CORS_ORIGIN'] ?? 'http://localhost:4200'
Credentials:    true
Allowed Headers: Content-Type, Authorization, X-Feature, X-Contract-Id,
                 X-Print-Token, X-Skip-Auth, X-Retry
```

CSRF protection is provided by the combination of:

1. **SameSite cookies** — `strict` in prod, `lax` in dev
2. **Bearer token in Authorization header** — cannot be forged by cross-origin requests
3. **CORS strict origin** — only the configured origin can make credentialed requests

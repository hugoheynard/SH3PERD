# Secrets management

> How environment secrets are loaded, stored, and rotated across SH3PHERD
> apps. Any new secret — service credential, API key, signing key —
> MUST go through the process described here. Do not commit plaintext
> secrets to git.

---

## 1. Storage model

Secrets live in **three** places; never more.

### 1.1 Local `.env` files (gitignored)

| App                    | File                                                                    | Loaded by                            |
| ---------------------- | ----------------------------------------------------------------------- | ------------------------------------ |
| `apps/backend`         | `apps/backend/.env.app` (base) + `.env.dev` / `.env.prod` / `.env.test` | `src/appBootstrap/config/loadEnv.ts` |
| `apps/audio-processor` | `apps/audio-processor/.env`                                             | standard dotenv                      |
| `apps/frontend-webapp` | `src/environments/env.dev.ts` / `env.prod.ts`                           | Angular `fileReplacements`           |

`.env*` is blanket-ignored via [.gitignore](../.gitignore) — if a secret
shows up in `git status`, the ignore list is bypassed, abort the commit.

Backend env semantics (see [loadEnv.ts](../apps/backend/src/appBootstrap/config/loadEnv.ts)):

- `NODE_ENV=dev` → `.env.app` + `.env.dev` (`override: true`)
- `NODE_ENV=prod` → `.env.app` + `.env.prod` (`override: true`)
- `NODE_ENV=test` → `.env.app` + `.env.test` with `override: false`
  — the jest `globalSetup` has already seeded mongo-memory values;
  the merge mode prevents a developer's real `.env.app` from
  silently redirecting the E2E suite at a live DB.

Frontend env semantics: Angular swaps `environment.ts` with
`env.dev.ts` or `env.prod.ts` at build time via the
`fileReplacements` array in `angular.json`. **Frontend env values
are bundled into the client bundle and are publicly visible** — only
put site keys and other PUBLIC identifiers there.

### 1.2 Production host (the server running `node dist/main`)

Prod backend reads the same `process.env` keys but resolves them from
the hosting platform's environment (Fly.io, Render, Railway, systemd,
etc. — pick one and document where). **No `.env.prod` file is shipped
to prod.** The production process gets its variables injected by the
platform.

### 1.3 Team vault (out-of-band, shared copy of truth)

A shared password manager (1Password / Bitwarden) holds the canonical
current values for every prod secret. The vault entry for each secret
MUST include:

- Current value
- Last-rotated date
- Dashboard / console URL to rotate it
- Owner (team member responsible)

When a secret rotates, update the vault AND the prod host at the same
time, then log the rotation in [`documentation/SECRETS.md`](SECRETS.md)
under "Rotation log" at the bottom.

---

## 2. Adding a new secret — step-by-step

Follow this order. Skipping a step is how secrets leak into git.

1. **Name the key.** `SCREAMING_SNAKE_CASE`, prefixed with the system
   it belongs to (`SLACK_`, `TURNSTILE_`, `S3_`, `JWT_`).
2. **Add it to `.gitignore`-already-covered files.** Create or update
   the relevant local env file:
   - Backend shared: `apps/backend/.env.app`
   - Backend per-env: `apps/backend/.env.dev` or `.env.prod`
   - Audio: `apps/audio-processor/.env`
   - Frontend (public only!): `src/environments/env.{dev,prod}.ts`
3. **Read it through a typed accessor.** Never `process.env['FOO']`
   scattered at call sites — add a `getFooConfig()` like
   [`getTurnstileConfig`](../apps/backend/src/auth/turnstile/getTurnstileConfig.ts) or
   [`getAuthConfig`](../apps/backend/src/appBootstrap/config/getAuthConfig.ts)
   so the boundary is explicit and the type flows through DI.
4. **Wire a safe fallback for dev / CI.** Tests must pass without the
   secret. Patterns in use today:
   - Bypass mode — service is a no-op when the secret is absent
     (Turnstile, PrintService fallback).
   - Load-from-file — `.pem` files on disk in dev, env vars only in prod
     (JWT keys).
5. **Fail loudly in prod when missing.** Either throw at bootstrap
   (JWT keys) or log a warn (Turnstile). Never silently bypass prod.
6. **Add it to the inventory below.** Even a one-line entry is better
   than a surprise.
7. **Store the value in the team vault** before setting it on the prod
   host.
8. **Set it on the prod host.** See §3.
9. **Update the rotation log** at the bottom of this file (new section:
   date + secret added).

---

## 3. Setting / rotating a secret in production

> Replace `$HOST_PROVIDER` with whichever platform hosts the backend.
> The process steps are platform-agnostic; the commands depend.

1. **Rotate at the source.** Generate the new value in the vendor
   dashboard (Cloudflare, Slack, MongoDB Atlas, R2, etc.). Keep the
   old one valid until step 3 succeeds.
2. **Update the team vault.** Edit the entry with the new value AND
   update the "Last rotated" date.
3. **Set on the host.**
   - Fly.io: `fly secrets set FOO=$value --app $APP_NAME`
   - Render/Railway: via the dashboard → Environment
   - systemd: edit `/etc/systemd/system/$SERVICE.env`, then
     `systemctl restart $SERVICE`
4. **Verify.** Hit a health endpoint that exercises the secret (e.g.
   `/auth/ping` for the auth stack, `/integrations/slack/status` for
   Slack). Confirm logs don't show fallback warnings.
5. **Revoke the old value** at the vendor.
6. **Log the rotation** at the bottom of this file.

### 3.1 Turnstile — first-time prod setup

1. Cloudflare dashboard → Turnstile → **Create widget**.
   - Widget mode: **Managed** (progressive challenge, mostly invisible).
   - Hostname: your production domain (the site key is bound to it).
   - Pre-clearance: off (unless you also need it for page-level
     bot-scoring).
2. Copy the **site key** (public) → `apps/frontend-webapp/src/environments/env.prod.ts`
   `turnstileSiteKey` field. Commit & deploy.
3. Copy the **secret key** (private) → team vault → host as
   `TURNSTILE_SECRET_KEY`.
4. Optional: `TURNSTILE_VERIFY_URL` — leave unset unless you proxy
   through your own domain.
5. Hit `/auth/login` in prod — the Turnstile widget should render; the
   backend warn `TURNSTILE_SECRET_KEY is not configured — captcha
verification is bypassed.` should be gone from the logs.
6. Log the rotation (see §4).

### 3.2 Dev test keys (do not use in prod)

Cloudflare publishes keys that always pass and always fail — use them
for local dev and CI. These are **not** secrets; they are public test
fixtures.

| Purpose                 | Site key                   | Secret key                            |
| ----------------------- | -------------------------- | ------------------------------------- |
| Always passes (dev, CI) | `1x00000000000000000000AA` | `1x0000000000000000000000000000000AA` |
| Always fails            | `2x00000000000000000000AB` | `2x0000000000000000000000000000000AA` |
| Forces interactive      | `3x00000000000000000000FF` | `1x0000000000000000000000000000000AA` |

Source: [Cloudflare — Testing Turnstile](https://developers.cloudflare.com/turnstile/troubleshooting/testing/).

---

## 4. Current inventory

### Backend (`apps/backend`)

| Env var                                                                      | Scope | Secret?                     | Source                                         | Consumer                                                                            |
| ---------------------------------------------------------------------------- | ----- | --------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| `ATLAS_URI`                                                                  | all   | **YES**                     | MongoDB Atlas connection string                | [app.module](../apps/backend/src/appBootstrap/app.module.ts)                        |
| `CORE_DB_NAME`                                                               | all   | no                          | dev/prod DB name                               | mongo client                                                                        |
| `PORT`                                                                       | all   | no                          | bootstrap                                      | [main.ts](../apps/backend/src/main.ts)                                              |
| `NODE_ENV`                                                                   | all   | no                          | process                                        | several                                                                             |
| `JWT_PRIVATE_KEY`                                                            | prod  | **YES**                     | RSA key pair (dev: `keys/private.pem` on disk) | [getAuthConfig](../apps/backend/src/appBootstrap/config/getAuthConfig.ts)           |
| `JWT_PUBLIC_KEY`                                                             | prod  | no (public by design)       | same pair                                      | idem                                                                                |
| `TOKEN_KEY`                                                                  | all   | **YES**                     | legacy — audit and remove if unused            | `.env.app`                                                                          |
| `DB_PASSWORD`                                                                | all   | **YES**                     | redundant with `ATLAS_URI`; audit              | `.env.app`                                                                          |
| `COOKIE_HTTP_ONLY` / `COOKIE_SECURE` / `COOKIE_SAME_SITE` / `COOKIE_MAX_AGE` | all   | no                          | cookie hardening                               | [secureCookieConfig](../apps/backend/src/appBootstrap/config/secureCookieConfig.ts) |
| `CORS_ORIGIN`                                                                | all   | no                          | allowed origin                                 | [main.ts](../apps/backend/src/main.ts)                                              |
| `FRONTEND_URL`                                                               | all   | no                          | reset-link base                                | [configuration](../apps/backend/src/appBootstrap/config/configuration.ts)           |
| `TURNSTILE_SECRET_KEY`                                                       | prod  | **YES**                     | Cloudflare dashboard                           | [getTurnstileConfig](../apps/backend/src/auth/turnstile/getTurnstileConfig.ts)      |
| `TURNSTILE_VERIFY_URL`                                                       | all   | no                          | override — default fine                        | idem                                                                                |
| `SLACK_CLIENT_ID`                                                            | prod  | no (public OAuth client id) | Slack app config                               | [configuration](../apps/backend/src/appBootstrap/config/configuration.ts)           |
| `SLACK_CLIENT_SECRET`                                                        | prod  | **YES**                     | Slack app config                               | idem                                                                                |
| `SLACK_REDIRECT_URI`                                                         | prod  | no                          | Slack app config                               | idem                                                                                |
| `S3_ACCESS_KEY_ID`                                                           | all   | **YES**                     | R2 access key                                  | storage package                                                                     |
| `S3_SECRET_ACCESS_KEY`                                                       | all   | **YES**                     | R2 secret                                      | storage package                                                                     |
| `S3_BUCKET_NAME` / `S3_ENDPOINT` / `S3_REGION`                               | all   | no                          | R2 config                                      | idem                                                                                |
| `PRINT_SECRET`                                                               | prod  | **YES**                     | HMAC key for single-use print JWT              | [configuration](../apps/backend/src/appBootstrap/config/configuration.ts)           |
| `CHROMIUM_EXECUTABLE_PATH`                                                   | prod  | no                          | optional override                              | idem                                                                                |
| `PRINT_POOL_SIZE` / `PRINT_PAGE_TIMEOUT_MS` / `PRINT_READY_TIMEOUT_MS`       | all   | no                          | tuning                                         | idem                                                                                |

### Audio processor (`apps/audio-processor`)

| Env var                   | Secret? | Purpose                |
| ------------------------- | ------- | ---------------------- |
| `DEEPAFX_CHECKPOINT_PATH` | no      | path to model weights  |
| `DEEPAFX_PYTHON`          | no      | python binary override |
| `DEEPAFX_WORKER_PATH`     | no      | worker script path     |

### Frontend (`apps/frontend-webapp`)

**Every value in `src/environments/env.*.ts` is bundled into the client
and publicly visible.** Never put a real secret here.

| Field                    | Secret?               | Notes                                |
| ------------------------ | --------------------- | ------------------------------------ |
| `apiBaseUrl` / `baseURL` | no                    |                                      |
| `turnstileSiteKey`       | no (public by design) | Cloudflare site key — safe to commit |

---

## 5. Red flags

- A commit that adds a line like `APIKEY=sk-...` to any tracked file
  → stop, rotate that key immediately, rebase it out of history.
- A `process.env['FOO']` access not wrapped in a typed config
  accessor → refactor before merging.
- A new secret that has no dev fallback → the first CI run without
  the secret will break. Add a bypass path.
- An `.env.*` file showing up in `git status` → `.gitignore` was
  bypassed; do not commit.

---

## 6. Rotation log

Append-only. Keep the last ~24 months, then archive.

| Date (YYYY-MM-DD)             | Secret | Reason | Operator |
| ----------------------------- | ------ | ------ | -------- |
| _(initial setup in progress)_ |        |        |          |

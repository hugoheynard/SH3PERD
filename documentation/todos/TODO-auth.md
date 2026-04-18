# Auth — TODO & Roadmap

> Dernière mise à jour : 2026-04-18 — objectif ship backend lundi 2026-04-20

---

## 🚨 Ship-blocker lundi 2026-04-20 — ordre à suivre

Samedi 2026-04-18 = captcha (**fait**) + mailer + email verification.
Dimanche = audit events. Lundi matin = revérif + push. Dans l'ordre :

### 1. Mailer service — **samedi matin** ✅

Livré 2026-04-18. Provider : **Resend**, wrappé derrière
`IMailerService.send({ to, template, data })` pour pouvoir swap si
besoin (SES, SendGrid) sans toucher les appels. Template-only API
(pas de méthode bas-niveau exposée aux callers).

- [ ] Créer un compte Resend + domaine vérifié (SPF/DKIM) — à faire
      côté prod, procédure dans `SECRETS.md` §3.2.
- [x] `MailerModule` + `MailerService` dans `src/mailer/` avec
      l'interface `IMailerService`. API publique template-only via
      discriminated union sur `template`.
- [x] Adapter Resend interne (`ResendMailerAdapter`) — le reste de
      l'app ne connait que l'interface via le token DI `MAILER_SERVICE`.
- [x] Templates HTML minimaux (inline CSS, pas de framework) :
      `password-reset`, `email-verification`. HTML-escape sur tous les
      champs user-interpolated. Welcome mail reporté post-ship.
- [x] Config via env : `RESEND_API_KEY`, `MAILER_FROM_ADDRESS`,
      `MAILER_REPLY_TO`. **Dry-run mode** actif quand la clé est
      absente — `DryRunMailerAdapter` log la payload au lieu d'envoyer.
- [x] Unit tests colocated : 30 specs sur le module (5 suites :
      config, dry-run, Resend adapter, renderTemplate, htmlEscape).
- [x] Branché sur `ForgotPasswordHandler` — 6 specs au total dont
      happy path, profil manquant, swallow des erreurs mailer (anti
      email-enumeration).
- [x] Doc technique `sh3-mailer.md` + mise à jour de `sh3-auth-system.md`
      (flow password-reset) + index `CLAUDE.md`.
- [x] `SECRETS.md` §3.2 (first-time Resend setup) + §4 (3 env vars).

### 2. Email verification — **samedi après-midi (2-3h)**

Câble la plomberie existante sur le mailer.

- [ ] `UserRegisteredHandler` génère un `EmailVerificationToken`
      (même pattern que `PasswordResetToken` — SHA-256 hashé, 24h TTL,
      single-use).
- [ ] Endpoint `POST /auth/verify-email` qui consomme le token et
      met `email_verified: true` sur `UserCredentials`. Rate-limité
      à `3/min`.
- [ ] Endpoint `POST /auth/resend-verification` — même rate limit.
- [ ] `LoginHandler` rejette avec `EMAIL_NOT_VERIFIED` (403) si
      `email_verified === false` et `active === true`. **Ne pas
      bloquer** si `active === false` — c'est un cas différent
      (déjà géré par USER_DEACTIVATED).
- [ ] Spec d'intégration : register → token emitté → verify endpoint →
      login passe. Et : register → verify token wrong → verify token
      expired → verify token reused.
- [ ] Docs : mettre à jour `sh3-auth-system.md` pour inclure le flow
      email verification (diagramme Mermaid).

### 3. Logs audit events sensibles — **dimanche matin (1h)**

Reuse l'analytics event store existant, pas de nouvelle infra.

- [ ] Events à persister : `auth.login.success`, `auth.login.fail`,
      `auth.login.lockout`, `auth.password.change`,
      `auth.password.reset`, `auth.email.verified`, `auth.logout`.
- [ ] Payload minimal : `{ user_id?, email?, ip, user_agent, ts }`.
- [ ] Handler `AuthAuditHandler` qui consomme ces events et écrit
      dans la collection analytics existante. Pas de query endpoint —
      on récupère via Mongo Compass le temps d'en avoir besoin.

### 4. CAPTCHA sur login + register — ✅ **fait (backend + frontend + docs)**

Livré avec Cloudflare Turnstile en `appearance: interaction-only` —
le challenge est invisible pour le trafic légitime (95% des cas en
managed mode) et apparaît en modal quand Cloudflare détecte du trafic
suspect, plutôt qu'un trigger local "après 2 échecs". Avantages :

- Pas besoin d'audit events (étape 3) pour être protégé dès maintenant
- Protection dès le premier hit, pas seulement après 2 échecs
- Couvre `/login` ET `/register` (bot signups)
- Zéro state en DB côté nous
- Tokens single-use + 5min TTL = rate limit naturel anti-bot

**Backend** :

- [x] `TurnstileService` + `TurnstileModule` avec config via env
      (`TURNSTILE_SECRET_KEY`, `TURNSTILE_VERIFY_URL`). Fallback
      bypass si la clé est absente (dev/CI).
- [x] Câblage sur `/auth/login` et `/auth/register` — vérif avant
      d'atteindre le command bus.
- [x] **Fail-open sur panne Cloudflare** (log warn) — throttling
      et lockout restent les garde-fous.
- [x] **Throttle relaxé** — `/login` 5→20/min, `/register` 3→10/min.
      Le throttle reste un garde-fou DDoS, le captcha + lockout sont
      les vraies défenses anti brute-force.
- [x] 15 unit tests sur le service + 4 sur le controller
      (integration captcha ✓ / captcha manquant ✗ / captcha rejeté ✗).

**Frontend** :

- [x] Widget `sh3-turnstile` standalone, signals-first, lazy script
      loader. Tourne en `NgZone.runOutsideAngular` pour ne pas
      déstabiliser l'app.
- [x] Intégré dans `login-form` + wizard `register` (step 3).
      `turnstileToken` propagé dans le body. Le bouton submit reste
      désactivé tant que le token n'est pas présent.
- [x] **Skip SSR** — le widget n'est rendu que côté browser
      (`isPlatformBrowser`) pour ne pas polluer les logs dev watch.
- [x] Env `turnstileSiteKey` dans `src/environments/env.{dev,prod}.ts`
      — dev pointe sur la testkey always-passes de Cloudflare.
- [x] **AuthResult type** — `login$` et `register$` renvoient
      `{ ok, code?, status? }` pour réagir spécifiquement aux
      erreurs captcha (toast dédié + reset du widget).
- [x] **Autocomplete hints** — `email`, `current-password`,
      `new-password`, `given-name`, `family-name`, `organization`
      pour password managers + silence du warning DOM.

**Docs** :

- [x] `sh3-auth-system.md` — diagramme Mermaid du flow captcha +
      section dédiée (config, fail-open rationale, error codes).
- [x] `SECRETS.md` — process management des secrets + §3.1 first-time
      prod setup Turnstile + §3.3 visual testing recipes (4 scénarios).

**Reste à faire côté prod** :

- [ ] **Prod setup Turnstile** — créer le widget dans Cloudflare
      dashboard, remplacer `REPLACE_WITH_PROD_TURNSTILE_SITE_KEY`
      dans `env.prod.ts`, set `TURNSTILE_SECRET_KEY` sur le host.
      Procédure complète dans `SECRETS.md` §3.1.

### 5. Vérif finale + push — **lundi 9h-11h**

- [ ] `pnpm --filter @sh3pherd/backend test` — tout vert (viser ~200+
      specs après email verification).
- [ ] `pnpm --filter @sh3pherd/backend exec tsc --noEmit` — clean.
- [ ] Tester manuellement le flow register → email → verify → login
      avec le vrai mailer (pas dry-run) sur un compte perso.
- [ ] Vérifier que les cookies ont `Secure: true` quand
      `NODE_ENV=production`.
- [ ] Vérifier les variables d'env de prod sur le host.
- [ ] Push sur `dev`, ouvrir PR vers `main`, merger, déployer.

---

## ⏸ Reporté post-ship (pas bloquant lundi)

- **Register Wizard — Company creation at signup** (backend side) — si
  non urgent pour les premiers users, laisser côté frontend wizard
  faire un `POST /auth/register` puis un `POST /companies` séparément.
- **Auth0 / Social login** — tout le bloc plus bas.
- **2FA / MFA** — tout le bloc plus bas.
- **Session Management UI** — "Logout all devices" existe déjà au niveau
  endpoint, la page UI peut attendre.
- **JWKS endpoint + key rotation** — nécessaire pour SOC2 mais pas pour
  ship B2C. Noter dans le backlog sécurité.
- **Password expiration policy** — pas demandé, pas urgent.

---

## Done — avant cette session

- [x] JWT RS256 asymmetric signing
- [x] Refresh token rotation with SHA-256 hashing + theft detection
- [x] HttpOnly + Secure + SameSite cookies
- [x] Argon2id password hashing with auto-migration from bcrypt
- [x] Account lockout (5 attempts → 15 min)
- [x] Password change endpoint + session invalidation
- [x] Password reset (forgot-password + reset-password)
- [x] Auth failure logging (NestJS Logger)
- [x] CORS from environment variable
- [x] Password strength validation (8+ chars, upper, lower, digit)
- [x] UserRegisteredEvent emitted after registration
- [x] Swagger decorators on all auth endpoints
- [x] Module restructured (colocated tests, merged modules, dead code removed)
- [x] 100 unit tests passing

## Done — session 2026-04-17 (+80 specs, 117 → ~197)

- [x] **Malformed Authorization headers** — 6 classes d'entrée verrouillées
      sur `AuthGuard` (`auth.guard.test.ts` → 12 specs)
- [x] **ContractContextGuard** — stub "should be defined" remplacé par 8
      scénarios d'intégration : header priority, DB fallback, array-header
      defense, tenant isolation, missing contract, role defaulting
      (`contract-context.guard.spec.ts`)
- [x] **RefreshSessionHandler — findOne hashing contract** — le lookup par
      hash est désormais asserté explicitement (happy path + theft path),
      pas seulement implicite via le `updateOne` filter
      (`RefreshSessionHandler.spec.ts` → 7 specs)
- [x] **LoginHandler — race lockout documentée** — deux 5e tentatives
      concurrentes : les deux `updateOne` écrivent count=5 + locked_until ;
      comportement non-atomique pinné pour surfaces un passage à `$inc`
      comme diff conscient (`LoginHandler.spec.ts` → 13 specs)
- [x] **@Throttle / @SkipThrottle metadata** sur `AuthController` — 9
      endpoints asserting le couple exact `(limit, ttl)` + logout qui
      hérite du global + ping marqué `@SkipThrottle()`
      (`auth.controller.throttling.spec.ts` → 16 specs)
- [x] **PermissionGuard + expandRolesToPermissions + matchPermission** —
      27 specs couvrant runtime (owner/admin/viewer denials, multi-perm
      AND semantics, fail-closed sur missing contract_roles), expansion
      contract+platform roles, wildcard matcher avec ses edge cases
      (`RequirePermission.spec.ts` → 27 specs)

Résultat suite auth/contracts/permissions : **180 specs, 27 suites, all passing**.

## Done — session 2026-04-18 (captcha + frontend + docs)

- [x] **Cloudflare Turnstile** bout-en-bout — `TurnstileService`
      backend (15 unit tests + 4 controller specs), widget Angular
      `sh3-turnstile` frontend (standalone, signals, NgZone-safe,
      SSR-safe), câblé sur login + register.
- [x] **AuthResult type** sur `login$` / `register$` — propagation
      du code d'erreur backend pour UX captcha.
- [x] **Throttle relaxé** — `/login` 5→20/min, `/register` 3→10/min.
      Doc + spec throttling à jour.
- [x] **Autocomplete hints** sur les 5 champs des forms auth.
- [x] **SECRETS.md** — process secrets documenté (stockage, rotation,
      inventaire complet, visual testing recipes).

**Résultats test suite** : backend 465/465 ✓ (58 suites), frontend 225/225 ✓ (74 suites).

## Backlog — Short Term

### Register Wizard — Company Creation at Signup

- [ ] Extend `RegisterUserCommand` (or create `RegisterCompanyCommand`) to accept `account_type: 'artist' | 'company'`
- [ ] If `account_type === 'company'` and `company_name` is provided:
  - Create `CompanyEntity` with the given name
  - Create a `ContractEntity` linking the user to the company with role `owner`
  - All in the same transaction as user creation
- [ ] Add `account_type` and `company_name` optional fields to `TRegisterUserRequestDTO` + Zod schema
- [ ] Frontend already sends the wizard data — backend just needs to handle it

### Auth0 Integration (Social Login / SSO)

- [ ] Intégrer Auth0 comme provider OAuth supplémentaire (Google, Apple, GitHub)
- [ ] Flow : Auth0 renvoie un `id_token` → backend vérifie le token → crée ou lie un user local
- [ ] Mapping Auth0 user → `UserCredentialEntity` (champ `auth_provider?: 'local' | 'auth0'`, `auth0_sub?: string`)
- [ ] Si l'email Auth0 existe déjà en local → lier les comptes (merge)
- [ ] Si nouvel email → créer le user + platform contract (comme register, mais sans password)
- [ ] Frontend : bouton "Continue with Google/Apple" sur la page login
- [ ] Garder le login local (email/password) en parallèle — Auth0 est un provider en plus, pas un remplacement
- [ ] Config : `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` dans les env vars

### Session Management

- [ ] Endpoint `GET /auth/sessions` — liste les sessions actives (device, IP, date)
- [ ] Endpoint `DELETE /auth/sessions/:familyId` — révoquer une session spécifique
- [ ] Frontend : page "Active sessions" dans le profil utilisateur

## Backlog — Long Term

### 2FA / MFA (TOTP)

- [ ] Endpoint `POST /auth/2fa/setup` — génère un secret TOTP + QR code
- [ ] Endpoint `POST /auth/2fa/verify` — valide le code TOTP
- [ ] Endpoint `POST /auth/2fa/disable` — désactive le 2FA
- [ ] Modifier le login flow : si 2FA activé → demande le code après le password
- [ ] Recovery codes (10 codes à usage unique)

### Advanced Security

- [ ] JWK endpoint (`GET /auth/.well-known/jwks.json`) pour rotation des clés
- [ ] IP-based suspicious activity detection
- [ ] Device fingerprinting (user-agent + IP → device tracking)
- [ ] Password expiration policy (optionnel, configurable par plan)

## Architecture Decisions

- **Auth0 en complément, pas en remplacement** — on garde le système auth local (email/password) et on ajoute Auth0 comme provider OAuth. Un user peut avoir les deux.
- **Pas de Passport.js** — notre AuthGuard + CQRS est plus explicite et testable que les strategies Passport
- **Mailer avant Auth0** — l'email verification est plus critique que le social login pour un SaaS B2B

# Auth — TODO & Roadmap

> Dernière mise à jour : 2026-04-17 — objectif ship backend lundi 2026-04-20

---

## 🚨 Ship-blocker lundi 2026-04-20 — ordre à suivre

Le vendredi soir on finit la couverture de test (**fait**). Samedi + dimanche
= mailer + email verification. Lundi matin = revérif + push. Dans l'ordre :

### 1. Mailer service — **samedi matin (3-4h)**

Sans ça rien ne ship. Choix et implé :

- [ ] **Choisir le provider** : recommandation **Resend** (DX la plus rapide,
      domaine custom en 5 min, 100 mails/jour en free tier pour tester).
      Fallback SES si le compte AWS est déjà prêt.
- [ ] `MailerModule` + `MailerService` dans `src/mailer/` avec un seul
      `send({ to, template, data })` — pas d'API bas-niveau exposée.
- [ ] Templates HTML minimaux (inline CSS, pas de framework) :
      `email-verification.html`, `password-reset.html`. **Welcome mail
      peut attendre post-ship.**
- [ ] Config : `MAILER_API_KEY`, `MAILER_FROM_ADDRESS`, `MAILER_REPLY_TO`
      en env vars — et **fallback en "dry-run" mode** (logguer au lieu
      d'envoyer) pour les tests et le dev sans clé.
- [ ] Unit test du service avec un provider mocké + `.spec.ts` colocated.

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

### 4. CAPTCHA progressif sur login — ✅ **fait (backend)**

Livré avec Cloudflare Turnstile en mode "managed" — le challenge est
progressif côté Cloudflare (invisible pour le trafic légitime,
interactif pour les bots), plutôt qu'un trigger local "après 2 échecs".
Avantages du choix :

- Pas besoin d'audit events (étape 3) pour être protégé dès maintenant
- Protection dès le premier hit, pas seulement après 2 échecs
- Couvre aussi `/register` (bot signups)
- Zéro state en DB côté nous

- [x] `TurnstileService` + `TurnstileModule` avec config via env
      (`TURNSTILE_SECRET_KEY`, `TURNSTILE_VERIFY_URL`). Fallback
      bypass si la clé est absente (dev/CI).
- [x] Câblage sur `/auth/login` et `/auth/register` — vérif avant
      d'atteindre le command bus.
- [x] **Fail-open sur panne Cloudflare** (log warn) — throttling
      et lockout restent les garde-fous.
- [x] 15 unit tests sur le service + 4 sur le controller
      (integration captcha ✓ / captcha manquant ✗ / captcha rejeté ✗).
- [x] Doc mise à jour — `sh3-auth-system.md` avec diagramme Mermaid.
- [x] **Frontend** — widget Turnstile sur `login` et `register`,
      `turnstileToken` propagé dans le body. Env `turnstileSiteKey`
      dans `src/environments/env.{dev,prod}.ts`.
- [x] **AuthResult type** — `login$` et `register$` renvoient
      `{ ok, code?, status? }` pour réagir spécifiquement aux
      erreurs captcha (toast dédié + reset du widget).
- [x] **Process secrets documenté** — [`documentation/SECRETS.md`](../SECRETS.md)
      couvre le flow dev/prod, la rotation, l'inventaire complet
      (Turnstile, JWT, Slack, R2, Print, Mongo).
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

## In Progress

- [ ] **Email verification** — voir § Ship-blocker lundi #2 ci-dessus.
      Bloquant pour ship B2C.

## Backlog — Short Term

### Mailer Service

- [ ] Choisir un provider (SendGrid / AWS SES / Resend)
- [ ] Créer `MailerModule` + `MailerService` dans `src/mailer/`
- [ ] Templates HTML transactionnels (verification, password reset, welcome)
- [ ] Brancher `UserRegisteredHandler` et `ForgotPasswordHandler` sur le mailer

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

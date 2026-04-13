# Auth — TODO & Roadmap

> Dernière mise à jour : 2026-04-13

## Done

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

## In Progress

- [ ] **Email verification** — blocked by mailer setup (see TODO-email-verification.md)

## Backlog — Short Term

### Mailer Service
- [ ] Choisir un provider (SendGrid / AWS SES / Resend)
- [ ] Créer `MailerModule` + `MailerService` dans `src/mailer/`
- [ ] Templates HTML transactionnels (verification, password reset, welcome)
- [ ] Brancher `UserRegisteredHandler` et `ForgotPasswordHandler` sur le mailer

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

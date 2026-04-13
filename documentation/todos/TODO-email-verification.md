# Email Verification — TODO

> Bloqué par : aucun système de mail configuré (nodemailer/SendGrid/SES)

## Context

À l'inscription, l'email n'est pas vérifié. Le champ `email_verified` existe sur `UserCredential` mais est toujours `false`. Il faut envoyer un email de vérification et bloquer certaines fonctionnalités tant que l'email n'est pas confirmé.

## Plan d'implémentation

### Phase 1 — Configurer un système de mail

- [ ] Choisir un provider (SendGrid / AWS SES / Resend / nodemailer + SMTP)
- [ ] Créer un `MailerModule` + `MailerService` dans `src/mailer/`
- [ ] Configurer les env vars (`MAILER_HOST`, `MAILER_API_KEY`, etc.)
- [ ] Template HTML de base pour les emails transactionnels

### Phase 2 — UserRegisteredEvent + verification email

- [ ] Émettre un `UserRegisteredEvent` dans `RegisterUserCommand` après la transaction
- [ ] Créer un `SendVerificationEmailHandler` (event handler CQRS) qui :
  - Génère un token de vérification (même pattern SHA-256 que password reset)
  - Stocke le hash en `email_verification_tokens` collection
  - Envoie l'email avec le lien `GET /auth/verify-email?token=xxx`
- [ ] TTL du token : 24h
- [ ] Single-use (champ `usedAt`)

### Phase 3 — Endpoint de vérification

- [ ] `GET /auth/verify-email?token=xxx` (public) — valide le token, set `email_verified: true`
- [ ] Endpoint de renvoi : `POST /auth/resend-verification` (authentifié) — génère un nouveau token

### Phase 4 — Enforcement

- [ ] Décider quelles fonctionnalités sont bloquées sans email vérifié
- [ ] Ajouter un guard ou un check dans les handlers concernés
- [ ] Frontend : bannière "Verify your email" si `email_verified === false`

### Phase 5 — Appliquer le même système au password reset

- [ ] Remplacer le `console.log` dans `ForgotPasswordHandler` par un vrai envoi d'email
- [ ] Template HTML spécifique pour le password reset

## Dépendances

- `RegisterUserCommand` (existe, Phase 2 ajoute l'event)
- `UserCredentialEntity.email_verified` (existe, toujours `false`)
- `hashToken()` (existe, réutilisable)
- `password_reset_tokens` pattern (existe, même architecture)

## Questions ouvertes

- Faut-il bloquer le login si l'email n'est pas vérifié ? Ou juste limiter les fonctionnalités ?
- Quelle fréquence max pour le renvoi du mail de vérification ? (éviter le spam)

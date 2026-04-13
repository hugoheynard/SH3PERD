# Email Verification — TODO

> Bloqué par : configuration DNS (SPF/DKIM/DMARC) sur le domaine + Resend API key

## Context

À l'inscription, l'email n'est pas vérifié. Le champ `email_verified` existe sur `UserCredential` mais est toujours `false`. Il faut envoyer un email de vérification et bloquer certaines fonctionnalités tant que l'email n'est pas confirmé.

## Choix technique : Resend

**Provider retenu : [Resend](https://resend.com)** — API moderne, SDK TypeScript natif, 3000 mails/mois gratuits.

Pas de micro-service dédié pour le mail — un simple `MailerModule` dans le backend suffit pour le volume actuel. Si le volume justifie un découplage, on extraira en micro-service TCP (même pattern que audio-processor).

## Prérequis DNS (à faire dans GoDaddy)

- [ ] Créer un compte Resend → ajouter le domaine `sh3pherd.com`
- [ ] Ajouter les records DNS fournis par Resend :
  - SPF (`TXT` record)
  - DKIM (`CNAME` records)
  - DMARC (`TXT` record)
- [ ] Vérifier le domaine dans Resend dashboard
- [ ] Récupérer l'API key

## Plan d'implémentation

### Phase 1 — MailerModule (Resend)

- [ ] `pnpm add resend` dans le backend
- [ ] Créer `src/mailer/mailer.module.ts` + `src/mailer/mailer.service.ts`
- [ ] Env vars : `RESEND_API_KEY`, `MAILER_FROM` (ex: `noreply@sh3pherd.com`)
- [ ] Méthode `send({ to, subject, html })` — wrapper autour de `resend.emails.send()`
- [ ] Template HTML de base pour les emails transactionnels

### Phase 2 — Brancher le password reset

- [ ] Remplacer le `console.log` dans `ForgotPasswordHandler` par `mailerService.send()`
- [ ] Template HTML spécifique pour le password reset
- [ ] Tester en dev avec l'API key Resend

### Phase 3 — Email verification à l'inscription

- [ ] `UserRegisteredEvent` existe déjà (émis par `RegisterUserCommand`)
- [ ] Modifier `UserRegisteredHandler` pour :
  - Générer un token de vérification (même pattern SHA-256 que password reset)
  - Stocker le hash en `email_verification_tokens` collection
  - Envoyer l'email via `mailerService.send()` avec le lien `GET /auth/verify-email?token=xxx`
- [ ] TTL du token : 24h
- [ ] Single-use (champ `usedAt`)

### Phase 4 — Endpoint de vérification

- [ ] `GET /auth/verify-email?token=xxx` (public) — valide le token, set `email_verified: true`
- [ ] Endpoint de renvoi : `POST /auth/resend-verification` (authentifié) — génère un nouveau token

### Phase 5 — Enforcement

- [ ] Décider quelles fonctionnalités sont bloquées sans email vérifié
- [ ] Ajouter un guard ou un check dans les handlers concernés
- [ ] Frontend : bannière "Verify your email" si `email_verified === false`

## Dépendances

- `UserRegisteredEvent` (✅ existe, émis après registration)
- `UserRegisteredHandler` (✅ existe, placeholder pour le mail)
- `UserCredentialEntity.email_verified` (✅ existe, toujours `false`)
- `hashToken()` (✅ existe, réutilisable)
- `password_reset_tokens` pattern (✅ existe, même architecture)

## Questions ouvertes

- Faut-il bloquer le login si l'email n'est pas vérifié ? Ou juste limiter les fonctionnalités ?
- Quelle fréquence max pour le renvoi du mail de vérification ? (éviter le spam)

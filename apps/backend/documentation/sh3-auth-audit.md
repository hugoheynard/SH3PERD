# SH3PHERD — Auth Audit (2026-04-18)

> Revue ciblée du module `apps/backend/src/auth` pour préparer le ship
> B2C du 2026-04-20. Lecture des fichiers source + croisement avec
> [`sh3-auth-system.md`](sh3-auth-system.md), [`sh3-auth-and-context.md`](sh3-auth-and-context.md)
> et [`TODO-auth.md`](../../../documentation/todos/TODO-auth.md).
>
> **Portée :** `AuthController`, `AuthGuard`, commands (`Login`, `Register`,
> `Refresh`, `Logout`, `ChangePassword`, `ForgotPassword`, `ResetPassword`,
> `DeactivateAccount`), `AuthService`, `JwtService`, `RefreshTokenService`,
> `TurnstileService`, `UserRegisteredHandler`.
>
> **Hors scope :** `PasswordService` + hasher registry (audit distinct —
> déjà couvert par la suite `PasswordManager.integration.test.ts`),
> `ContractContextGuard` et `PermissionGuard` (audit dans `sh3-auth-and-context.md`).

---

## TL;DR — Verdict

Le module est **solide pour shipper**. Les fondamentaux sécuritaires sont
en place (JWT RS256, hash SHA-256 des refresh, rotation avec reuse
detection, Argon2id auto-migration, lockout, captcha, cookies durcis).
La suite de tests est dense (465 specs backend).

Quelques **points à surveiller** (aucun bloquant) :

1. **Timing attack sur `/login`** — enumeration possible via le délai
   Argon2 (user inconnu répond vite, user connu passe par la vérif).
2. **Enumeration via codes d'erreur différenciés** — `USER_DEACTIVATED`
   et `GUEST_NOT_ACTIVATED` (403) vs `INVALID_CREDENTIALS` (400) leakent
   l'existence de comptes. Probablement une décision UX délibérée
   (flow invite), mais à valider.
3. **Lockout non-atomique** — race déjà documentée dans les tests
   (`LoginHandler.spec.ts`). Migration `$inc` à faire post-ship.
4. **Reset token en query string** — acceptable vu le TTL 1h / single-use,
   mais le path fragment (`#token=`) réduirait la surface de leak.
5. **Logout sans refresh token → nuke global** — intentionnel mais
   asymétrique avec le logout normal (revoke une seule famille).
6. **Pas d'audit events sensibles** — déjà TODO dimanche (§3 de
   `TODO-auth.md`).

---

## Robustesse — scoring par dimension

Évaluation qualitative sur 5, calibrée "SaaS B2C early-stage shippable vs
SOC2-ready vs banque". `3/5` = shippable avec confiance, `4/5` = au-dessus
du standard marché, `5/5` = best-in-class.

| Dimension                         | Score | Justification                                                                                                                                                                                                                                                                                                      |
| --------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Cryptographie — tokens**        | 5/5   | RS256 asymétrique (clé privée jamais exposée au frontend), SHA-256 sur tous les tokens persistés (refresh + reset), `randomUUID()` pour le family_id. Aucune primitive faible.                                                                                                                                     |
| **Cryptographie — mots de passe** | 5/5   | Argon2id par défaut (timeCost=3, mem=128MB, parallelism=2), bcrypt en fallback, **auto-migration** sur login. Strategy registry propre, hash versionnés (`argon2id:v1$date$salt$hash`).                                                                                                                            |
| **Rotation & session lifecycle**  | 4/5   | Rotation sur chaque refresh + reuse detection via token family (gold standard OWASP). -1 : single-session per user non documenté + pas de JWK rotation endpoint.                                                                                                                                                   |
| **Protection brute-force**        | 4/5   | Captcha Turnstile (login + register) + throttle par endpoint + lockout 5/15min. -1 : timing attack sur `/login` (user existe vs pas) non mitigé.                                                                                                                                                                   |
| **Anti-enumeration**              | 3/5   | `/forgot-password` bien protégé (always 200, errors swallowed). `/login` leak via codes d'erreur différenciés (USER_DEACTIVATED, GUEST_NOT_ACTIVATED, ACCOUNT_LOCKED). `/register` leak via `USER_ALREADY_EXISTS` 409. Décisions probablement UX-driven mais pas documentées comme tel.                            |
| **Atomicité DB**                  | 4/5   | Register dans une transaction multi-collection (user_credentials + profile + platform_contract). ResetPassword wipe sessions + mark used en séquence. -1 : lockout counter en read-modify-write (race pinnée, patch `$inc` prévu).                                                                                 |
| **Durcissement cookies**          | 5/5   | `HttpOnly` forcé, `Secure` + `SameSite=strict` en prod, `path=/api/auth` scoped, `maxAge` aligné sur refresh TTL. Clear cookie sur logout/change/deactivate.                                                                                                                                                       |
| **Captcha (bot defense)**         | 4/5   | Turnstile managed mode (invisible legit, interactive bots), single-use tokens 5min TTL, `remoteip` forward, bypass dev propre. -1 : pas de retry sur siteverify (fail-open direct).                                                                                                                                |
| **Error handling & logs**         | 3/5   | `BusinessError` / `TechnicalError` typés, `GlobalExceptionFilter` masque les détails techniques au client. Logs warn sur login fails, lockout, captcha rejected. -2 : pas d'audit events persistés (TODO), AuthGuard silencieux sur tokens invalides, mailer errors swallowed (nécessaire mais monitoring faible). |
| **Validation input**              | 5/5   | `ZodValidationPipe` sur tous les endpoints, shared-types `S*DTO` schemas depuis `@sh3pherd/shared-types` (source of truth front/back). Aucune validation ad-hoc.                                                                                                                                                   |
| **Tests**                         | 4/5   | 465 specs backend, couverture explicite des edge cases sensibles (malformed headers, reuse detection, throttle metadata, race lockout pinnée). -1 : pas de benchmark timing explicite sur login, pas de test "reset token cross-user".                                                                             |
| **DI & testabilité**              | 5/5   | Tout passé par tokens DI (`AUTH_SERVICE`, `PASSWORD_SERVICE`, `TURNSTILE_SERVICE`, `MAILER_SERVICE`, …), handlers CQRS isolés, fonctions contractuelles (`TVerifyAuthTokenFn`) injectables. Refactoring sans douleur.                                                                                              |
| **Architecture & lisibilité**     | 5/5   | CQRS propre (api/application/core/repositories), naming cohérent, tests colocés, decorators documentés (`@ContractScoped`, `@RequirePermission`, `@ActorId`). Doc technique dense (sh3-auth-system.md + sh3-auth-and-context.md).                                                                                  |
| **Config & secrets**              | 4/5   | `SECRETS.md` exhaustif, accesseurs typés (`getAuthConfig`, `getTurnstileConfig`, `getMailerConfig`), bypass dev propre sur secrets manquants, fail loud en prod. -1 : `FRONTEND_URL` default localhost non asserté au boot prod.                                                                                   |
| **Flows multi-device**            | 2/5   | `createAuthSession` fait `deleteMany({ user_id })` → un login kill toutes les autres sessions. Session Management UI en backlog. Acceptable pour MVP, limitant pour un B2B à terme.                                                                                                                                |

### Score global pondéré

Moyenne simple : **4.1 / 5**.

Pondérée "sécu + architecture avant UX multi-device" (poids 2 sur crypto
/ tokens / cookies / captcha / input / tests) : **4.3 / 5**.

### Lecture stratégique

- **Les 5/5** sont les fondamentaux — ils sont solides, pas de dette
  technique cachée, pas de "on verra plus tard" qui traîne.
- **Les 4/5** sont des "-1 identifié, remédiation connue" : rien à
  restructurer, juste à patcher quand le temps le permet.
- **Les 3/5 (anti-enumeration, error/logs)** sont les zones où la dette
  est consciente et supportée par d'autres contrôles (captcha compense
  l'enumeration, throttle compense l'absence d'audit). Mais ce sont les
  deux leviers à activer pour franchir le cap "B2C shippable → B2B serious".
- **Le 2/5 (multi-device)** est un choix produit, pas une faiblesse
  technique. À assumer et documenter.

### Positionnement

| Niveau                             | État                                                              |
| ---------------------------------- | ----------------------------------------------------------------- |
| **Prototype / MVP hacké**          | ✓ largement dépassé                                               |
| **SaaS B2C early-stage shippable** | ✓ **position actuelle**                                           |
| **SaaS B2B production-grade**      | ⚠ manque audit events + multi-device + JWK rotation               |
| **SOC2-ready**                     | ❌ manque audit log structuré + key rotation + session visibility |
| **Banque / fintech**               | ❌ hors-scope (2FA obligatoire, HSM, etc.)                        |

Le gap pour passer "B2C → B2B production-grade" est estimé à **~2 semaines
d'effort** : audit events (§3 TODO-auth), JWK endpoint, Session Management UI,
harmonisation codes d'erreur login. Tout est dans le backlog, rien ne
nécessite de refactor architectural.

---

## 1. Architecture & structure

### Points forts

- **CQRS** propre : controller → `CommandBus` → handler → repo. Chaque
  command est dans son propre fichier avec le handler colocé et un
  dossier `__tests__/` attenant.
- **DI par tokens** (`PASSWORD_SERVICE`, `AUTH_SERVICE`,
  `REFRESH_TOKEN_SERVICE`, `MAILER_SERVICE`, `TURNSTILE_SERVICE`, …) —
  facile à mocker, facile à swap.
- **Module clean** : `auth.module.ts` n'importe que ce qu'il faut
  (CqrsModule + AuthCore + Analytics + Mailer + Turnstile). Tous les
  handlers listés explicitement.
- **Séparation core vs application** : JWT / RefreshToken / Password
  / Turnstile sont des services stateless sous `core/`, les handlers
  CQRS sous `application/`, les endpoints et guards sous `api/`.

### À surveiller

- **`auth.service.ts` ligne 93** — `createAuthSession` fait
  `deleteMany({ user_id })` avant chaque login. C'est du **single-session
  per user** : se connecter sur un 2e device kill le 1er. OK pour un
  MVP mais à documenter explicitement dans `sh3-auth-system.md`
  (actuellement pas mentionné dans la section "Token Architecture").

---

## 2. Endpoints (`auth.controller.ts`)

| Endpoint                   | Throttle        | Zod | Captcha | Auth   | Risque                                                     |
| -------------------------- | --------------- | --- | ------- | ------ | ---------------------------------------------------------- |
| `POST /register`           | 10/min          | ✅  | ✅      | public | bot signups — couvert                                      |
| `POST /login`              | 20/min          | ✅  | ✅      | public | credential stuffing — couvert (captcha + lockout)          |
| `POST /refresh`            | 10/min          | —   | ❌      | cookie | vol de cookie — couvert (family detection)                 |
| `POST /logout`             | 30/min (global) | —   | ❌      | Bearer | —                                                          |
| `POST /change-password`    | 3/min           | ✅  | ❌      | Bearer | —                                                          |
| `POST /deactivate-account` | 3/min           | ✅  | ❌      | Bearer | —                                                          |
| `POST /forgot-password`    | 3/min           | ✅  | ❌      | public | enumeration — **couvert** (always 200)                     |
| `POST /reset-password`     | 3/min           | ✅  | ❌      | public | token brute-force — mitigé (single-use + SHA-256 + 1h TTL) |
| `GET /ping`                | SkipThrottle    | —   | ❌      | public | —                                                          |

### Observations

- **Pas de captcha sur `/forgot-password`** — le rate-limit 3/min/IP +
  la réponse uniforme 200 suffisent à prévenir l'enumeration, mais un
  attaquant avec un pool d'IPs pourrait flooder le mailer. Le provider
  (Resend) a son propre rate-limit côté compte, donc risque ≈ budget.
  **Recommandation** : captcha aussi sur `/forgot-password` post-ship
  si budget email devient un problème.
- **Pas de captcha sur `/refresh`** — correct, le cookie est la preuve
  de possession.

---

## 3. `AuthGuard` (`api/auth.guard.ts`)

### Points forts

- Extraction bearer token robuste (split sur `' '`).
- Bypass `@IsPublic()` via `Reflector.getAllAndOverride` (method + class).
- Délègue la vérif à `VERIFY_AUTH_TOKEN_FN` injecté — testable sans JWT.

### À surveiller

- **Pas de log sur échec** — tokens manquants ou invalides sortent un
  `401` silencieux. Quand l'audit log (TODO-auth §3) sera câblé, il
  faudra émettre `auth.token.invalid` ici. C'est le seul signal pour
  détecter des patterns de probing.
- **Headers malformés** — la suite `auth.guard.test.ts` (12 specs)
  verrouille 6 classes d'entrée. RAS.

---

## 4. Login (`LoginCommand.ts`)

### Points forts

- Lockout après 5 tentatives (`MAX_FAILED_ATTEMPTS`), 15 min (`LOCKOUT_DURATION_MS`).
- Reset du compteur à 0 sur succès.
- Rehash auto si l'algo a été upgradé (bcrypt → argon2).
- Log warn sur chaque échec (email + compteur).

### À surveiller

#### 4.1 — Timing attack (enumeration)

```ts
// line 38-41 — early return
const user = await this.userCredRepo.findOne({ filter: { email } });
if (!user) {
  throw new BusinessError('Invalid credentials', { code: 'INVALID_CREDENTIALS', status: 400 });
}
```

Si `user` n'existe pas → retour immédiat (quelques ms).
Si `user` existe → Argon2 compare (timeCost=3, memory=128MB → ~250-400ms typique).

**Exploit** : un attaquant qui time les réponses peut distinguer "email
existe" de "email inconnu" avec un jeu de mesures suffisant. C'est la
même classe d'attaque qu'un `return 403` vs `return 400`, mais plus
subtile.

**Mitigation possible** : exécuter un compare "leurre" sur un hash
pré-calculé quand l'user n'existe pas, pour équilibrer les temps.
Pattern classique, quelques lignes.

**Priorité** : faible — le captcha Turnstile bloque le scan automatisé,
et le throttle 20/min/IP limite le débit. Mais à noter dans le
backlog sécu (après SOC2 si jamais).

#### 4.2 — Enumeration via codes d'erreur différenciés

Pour un email donné, le backend leak les états suivants :

| État du compte                              | HTTP | Code                  |
| ------------------------------------------- | ---- | --------------------- |
| inexistant                                  | 400  | `INVALID_CREDENTIALS` |
| existe + mauvais mot de passe               | 400  | `INVALID_CREDENTIALS` |
| existe + `active=false`                     | 403  | `USER_DEACTIVATED`    |
| existe + `password=null` (guest non activé) | 403  | `GUEST_NOT_ACTIVATED` |
| existe + locké                              | 429  | `ACCOUNT_LOCKED`      |

Les 3 derniers distinguent des comptes existants. Un attaquant peut
itérer sur une liste d'emails et identifier les comptes valides.

**Rationale vraisemblable** : UX pour le flow d'invitation guest (les
users inactifs doivent voir un message clair, pas un "invalid credentials"
frustrant). Mais c'est **inconsistant** avec l'effort anti-enumeration
de `/forgot-password`.

**Recommandation** : décider consciemment — soit retourner 400
`INVALID_CREDENTIALS` pour tous les cas (perte UX faible, gain sécu
mesurable), soit documenter ces codes comme "leak accepté" dans
`sh3-auth-system.md` avec la raison.

#### 4.3 — Lockout non-atomique (déjà pinné)

Lignes 76-86 : read → modify → write sans `$inc`. Deux 5e tentatives
concurrentes écrivent toutes les deux `count=5` + `locked_until`.
Résultat final quand même "locked" donc pas de bug fonctionnel, mais
pas atomique.

Déjà documenté dans `LoginHandler.spec.ts` (race test). Migration
`$inc` à faire — patch 3 lignes.

---

## 5. Register (`RegisterUserCommand.ts`)

### Points forts

- **Transaction multi-collection** (`withTransaction`) — user_credentials
  - user_profile + platform_contract atomiques. Rollback si l'un échoue.
- **Event émis APRÈS commit** — correct : les handlers (analytics, mailer)
  n'observent que l'état final.
- Vérif unicité email avant create — 409 `USER_ALREADY_EXISTS`.
- Password hashé via `PasswordService` (Argon2id par défaut).

### À surveiller

- **`USER_ALREADY_EXISTS` 409** — enumeration évidente. Un attaquant
  qui POST sur `/register` avec `foo@bar.com` apprend instantanément
  si le compte existe. Pas mitigé par captcha (le captcha valide la
  requête, pas le résultat).
  **Priorité** : faible si l'email verification va bientôt obliger les
  gens à cliquer avant connexion — la liste de comptes "enumerables"
  devient alors la liste des comptes actifs ET vérifiés, pas un avantage
  significatif pour un attaquant.
- **`UserRegisteredHandler`** ne fait actuellement que `log` + `analytics.track`.
  L'envoi de l'email de vérification est **TODO** (commentaire ligne 34).
  Avec le mailer shipped et le DNS Resend verified, c'est la prochaine
  étape (TODO-auth §2).

---

## 6. Refresh (`RefreshSessionCommand.ts`)

### Points forts

- **Hash SHA-256** du cookie avant lookup — le raw n'existe qu'en cookie.
- **Reuse detection** : si `isRevoked` → `deleteMany({ family_id })` +
  401 `TOKEN_REUSE_DETECTED`. Bon pattern.
- Rotation : l'ancien est soft-deleted (`isRevoked: true`, reste en DB
  pour la reuse detection), le nouveau est créé dans la même famille.

### À surveiller

- **`AuthController.refreshSession` renvoie `{ authToken: null, user_id: null }`
  avec HTTP 200** quand le cookie est absent (ligne 137-139 du controller).
  Sémantiquement bizarre : 401 serait plus propre. Le frontend doit
  gérer `null` comme "pas connecté". OK mais à documenter dans l'API.
- **`RefreshSessionHandler.findOne` avec hash** — assertion désormais
  explicite dans les specs (session 2026-04-17). RAS.

---

## 7. Logout (`LogoutCommand.ts`)

### Comportement

```ts
if (cmd.refreshToken) {
  // cas normal : soft-delete la famille (preserves reuse detection)
  await this.refreshTokenRepo.updateOne(
    { family_id: token.family_id },
    { $set: { isRevoked: true } },
  );
} else {
  // fallback : deleteMany sur user_id — "logout everywhere"
  await this.refreshTokenRepo.deleteMany({ user_id: cmd.userId });
}
```

### À surveiller

- **Asymmetry intentionnelle** : avec cookie → soft-delete (reuse detection
  possible après). Sans cookie → hard-delete global. Si un user fait
  logout depuis un device où le cookie est expiré mais le JWT encore
  valide, il kill toutes ses sessions — pas seulement cette device.
  **Priorité** : faible — nécessiterait que le JWT (15min) soit encore
  valide alors que le cookie (7j) est absent. Cas edge : cookie rejeté
  par le path scope, request cross-origin sans `credentials: include`, etc.
  À documenter comme "by design" dans l'API.
- **`req.user_id` obligatoire** (`@ActorId` côté controller) — l'endpoint
  n'est PAS `@Public()`. AuthGuard vérifie le JWT avant d'arriver ici.
  Donc un JWT invalide = 401 avant d'arriver au handler. ✓

---

## 8. ForgotPassword / ResetPassword

### Points forts

- **Silently succeed** si user inconnu ou `active=false` (ForgotPassword
  L52) — anti-enumeration.
- **Delete old tokens** avant d'en créer un nouveau — invalide les
  liens périmés automatiquement.
- **Token hashé** avant storage (SHA-256).
- **Mailer errors swallowed** dans try/catch — indispensable sinon un
  500 leakerait l'existence du compte.
- **ResetPassword wipe all sessions** (`deleteMany({ user_id })`) —
  sécurité correcte.
- **ResetPassword reset lockout fields** en même temps que le password
  (`failed_login_count: 0, locked_until: null`) — empêche un user de
  rester locké après un reset légitime.

### À surveiller

- **Reset URL en query string** (`ForgotPasswordCommand.ts` L79) :
  `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`.
  Le token finit dans l'historique du navigateur + les logs serveur
  si le frontend le proxifie. Mitigé par : single-use + SHA-256 hash
  - 1h TTL + wipe sessions post-reset.
    **Amélioration possible** : fragment (`#token=...`) pour que le token
    ne soit pas envoyé au serveur. Mais ça complique le parsing côté SPA.
    **Priorité** : faible.
- **`frontendUrl` default `http://localhost:4200`** (L78) — fallback
  dev. Si jamais `FRONTEND_URL` n'est pas set en prod → liens pointent
  sur localhost. Ajouter un assert-au-boot pour prod.

---

## 9. ChangePassword / DeactivateAccount

### Points forts

- ChangePassword vérifie l'ancien password avant de modifier. ✓
- ChangePassword **wipe all sessions** + clear cookie → re-login forcé
  partout. ✓
- DeactivateAccount vérifie le password avant soft-delete. ✓
- DeactivateAccount clear cookie + (implicitement via le Deactivate
  handler) devrait aussi wipe les sessions (à vérifier si besoin de lire
  le handler — non fait ici).
- Throttle 3/min/IP sur les deux — agressif, correct.

### À surveiller

- **ChangePassword ne met pas à jour `password_last_changed_at`** (si
  ce champ existe côté user_credentials). À vérifier si c'est un besoin
  pour une éventuelle future policy d'expiration. Pas bloquant.

---

## 10. Turnstile (`TurnstileService.ts`)

### Points forts

- **Fail-open** sur network / parse error (L62-73) avec log warn loud.
  Trade-off explicit et documenté.
- **Bypass** quand `enabled=false` (dev/CI sans clé) — pas de throw.
- **Rejet explicite** si token vide ou absent quand enabled (`CAPTCHA_REQUIRED`).
- **`remoteip` forwarded** à Cloudflare — binding IP anti-replay.

### À surveiller

- **Fail-open silencieux au client** — si Cloudflare tombe, le frontend
  ne sait pas que la vérif a été skippée. OK pour l'UX, mais un attaquant
  bénéficie aussi du fail-open. Le warn log doit feeder une alerte
  (Grafana / logs-based alert) quand ça arrive plus de N fois en M min.
- **Pas de retry** sur le fetch — un timeout réseau fait un direct
  fail-open. Acceptable vu la cadence (1 call par login/register), mais
  un 1-retry serait cheap.

---

## 11. JWT (`JwtService.ts`) & RefreshToken (`RefreshTokenService.ts`)

### Points forts

- **RS256** — signature asymétrique, clé privée ne quitte jamais le backend.
- **`verifyAuthToken` ne throw jamais** → retourne `null` sur erreur,
  `AuthGuard` convertit en 401. Pattern correct (pas de fuite de
  stack trace).
- **RefreshTokenService** :
  - Hash SHA-256 avant save (L66).
  - Famille générée par `randomUUID()` au login, réutilisée au refresh.
  - `expiresAt` = `now + secureCookieConfig.maxAge` — cohérent avec le cookie.
  - `verifyRefreshToken` : isRevoked check + expiry check.

### À surveiller

- **JWT payload** ne porte que `user_id`. Roles, contract, permissions
  sont résolus à chaque request par `ContractContextGuard`. Design
  correct (les tokens restent petits, les droits évoluent en DB),
  mais implique 1-2 DB reads par request protégée. Cache Redis possible
  plus tard si latence devient un problème.
- **Pas de JWK endpoint / rotation** — déjà backlog TODO-auth.md. Acceptable
  pour ship B2C, à prioriser pour SOC2.

---

## 12. Tests

| Sujet                                     | Suite                                                            | Specs |
| ----------------------------------------- | ---------------------------------------------------------------- | ----- |
| `AuthController` (endpoints + throttling) | `auth.controller.spec.ts` + `auth.controller.throttling.spec.ts` | 16+   |
| `AuthGuard`                               | `auth.guard.test.ts`                                             | 12    |
| `LoginHandler`                            | `LoginHandler.spec.ts`                                           | 13    |
| `RegisterUserHandler`                     | `RegisterUserHandler.spec.ts`                                    | ?     |
| `RefreshSessionHandler`                   | `RefreshSessionHandler.spec.ts`                                  | 7     |
| `LogoutHandler`                           | `LogoutHandler.spec.ts`                                          | ?     |
| `ChangePasswordHandler`                   | `ChangePasswordHandler.spec.ts`                                  | ?     |
| `DeactivateAccountHandler`                | `DeactivateAccountHandler.spec.ts`                               | ?     |
| `ForgotPasswordHandler`                   | `ForgotPasswordHandler.spec.ts`                                  | 6     |
| `ResetPasswordHandler`                    | `ResetPasswordHandler.spec.ts`                                   | ?     |
| `AuthService`                             | `AuthService.test.ts`                                            | ?     |
| `PasswordManager` (integration)           | `PasswordManager.integration.test.ts`                            | ?     |
| `Turnstile`                               | 15 unit + 4 controller                                           |

Total documenté : **465 backend specs ✓** au 2026-04-18.

### Couverture des edge cases clés (vérifiés)

- Lockout race (2 échecs concurrents sur la 5e tentative) — pinné.
- Token reuse detection (revoked + cookie replayed) — couvert.
- Malformed Authorization headers (6 classes) — couvert.
- Captcha missing / rejected / bypass — couvert.

### Gaps potentiels

- Pas de spec explicite sur **timing de login** (user inconnu vs connu).
  Pas trivial à tester en unit (dépendrait du hash), mais un benchmark
  en intégration serait utile.
- Pas de spec sur **Reset password avec un token d'un autre user**
  (doit toujours être "invalid" parce que le hash lookup ne match pas,
  mais worth pinning).

---

## 13. Dépendances & config

- **`FRONTEND_URL`** lu via `ConfigService` dans `ForgotPasswordCommand`.
  Default dev `http://localhost:4200`. ⚠ Assert au boot si `NODE_ENV=prod`.
- **`RESEND_API_KEY`** — DNS verified sur `sh3pherd.io` 2026-04-18, clé
  prod à générer au moment du déploiement (TODO-auth §1).
- **`TURNSTILE_SECRET_KEY`** — widget prod à créer côté Cloudflare
  (TODO-auth §4.reste).
- **`JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY`** — dev lit `.pem` files,
  prod via env. Fail au bootstrap si absent.
- **Cookies** : `COOKIE_SECURE=true` + `COOKIE_SAME_SITE=strict` en prod.
  À vérifier sur le host au déploiement (étape 5.4 du TODO-auth).

---

## 14. Recommandations — ordre de priorité

### Avant ship (lundi 2026-04-20)

1. ✅ **Compléter email verification** (TODO-auth §2) — sinon les comptes
   peuvent s'enregistrer avec des emails fakes.
2. ✅ **Générer clé Resend prod + set sur host** au déploiement (SECRETS.md §3.2).
3. ✅ **Vérifier `NODE_ENV=prod` → cookies Secure + SameSite=strict**
   sur le host (TODO-auth §5).
4. ⚠ **Documenter explicitement le choix "single session per user"**
   dans `sh3-auth-system.md` (actuellement implicite dans le code).

### Post-ship — court terme (1-2 semaines)

5. ⚠ **Harmoniser les codes d'erreur login** ou documenter la décision
   (cf. §4.2 de cet audit).
6. ⚠ **Migration `$inc` pour le lockout counter** (race déjà pinné, patch 3 lignes).
7. ⚠ **Audit events sensibles** (TODO-auth §3) — prérequis pour détecter
   des patterns d'abus post-ship.
8. ⚠ **Assert FRONTEND_URL au bootstrap en prod** (éviter les liens
   reset pointant localhost).

### Post-ship — moyen terme (après 2 semaines de trafic réel)

9. 💡 **Dummy compare anti-timing** dans `LoginHandler` si les logs
   d'audit remontent du probing par timing.
10. 💡 **Captcha sur `/forgot-password`** si le volume d'emails devient
    un coût ou un vecteur de spam.
11. 💡 **Retry+backoff sur Turnstile siteverify** (1 retry, 300ms timeout).
12. 💡 **DMARC → `p=quarantine`** après 2 semaines de monitoring des
    rapports `p=none` (cf. SECRETS.md §3.2).

### Backlog long terme

- JWK endpoint + key rotation (SOC2).
- 2FA/MFA TOTP.
- Session Management UI (endpoint déjà possible avec `deleteMany({ user_id })`).
- Auth0 / Social login.

---

## 15. Verdict final

Shippable en l'état pour un MVP B2C, à condition que l'email verification
soit câblée avant (TODO §2) et que la clé Resend + `TURNSTILE_SECRET_KEY`

- `NODE_ENV=prod` + `FRONTEND_URL` soient bien set sur le host.

Les points faibles identifiés sont tous **non bloquants** et ont des
chemins de remédiation clairs. Le module est au-dessus du standard
qu'on voit habituellement dans un SaaS B2C early-stage.

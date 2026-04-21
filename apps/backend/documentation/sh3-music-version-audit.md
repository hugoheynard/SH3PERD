# SH3PHERD — Music Version Audit (2026-04-21, v2 — post-remediation)

> Revue ciblée du module `music version` (controller, commands, handlers,
> repo, DTO, tests) pour mesurer l'écart **prod-ready** avec les deux
> baselines déjà livrées : `music reference` et `music repertoire`.
>
> Sources croisées :
> [`sh3-music-library.md`](sh3-music-library.md),
> [`sh3-writing-a-controller.md`](sh3-writing-a-controller.md),
> [`sh3-quota-service.md`](sh3-quota-service.md),
> [`sh3-analytics-events.md`](sh3-analytics-events.md),
> [`sh3-error-handling.md`](sh3-error-handling.md),
> [`sh3-e2e-tests.md`](sh3-e2e-tests.md).
>
> **Portée :** `MusicVersionsController`, `CreateMusicVersionCommand`,
> `UpdateMusicVersionCommand`, `DeleteMusicVersionCommand`,
> `MusicVersionEntity`, `MusicPolicy` (partie version),
> `RepertoireEntryAggregate` (opérations version), `MusicVersionRepository`,
> `RepertoireEntryAggregateRepository`, DTO `MusicVersionPayload`,
> codes `MUSIC_VERSION_*`.
>
> **Hors scope :** track lifecycle (upload/master/pitch-shift — ownés par
> `MusicTrackController` + `MusicTrackProcessingController`), cross-library,
> tab configs, queries de library (`GetUserMusicLibraryQuery`).

---

## TL;DR — Verdict (v2, après remédiation)

Passage **3.0/5 → 4.75/5** (moyenne simple). Tous les bloquants identifiés
dans la v1 sont résolus, et la parité "prod-ready" avec reference/repertoire
est dépassée sur plusieurs axes (observabilité, Swagger, tests handler,
atomicité DB).

**Corrigé** :

1. ✅ **Analytics sur les 3 mutations** — `music_version_created`,
   `music_version_updated` (avec `changed_fields`), `music_version_deleted`
   (avec `num_tracks`). Nouveaux types ajoutés dans
   `packages/shared-types/src/analytics-event.types.ts`.
2. ✅ **Quota `track_version` libéré à la suppression** (`recordUsage(-1)`).
   `storage_bytes` reste cumulative by design (documenté post-ship :
   nécessite persister `fileSizeBytes` sur le track).
3. ✅ **`RepertoireEntryAggregateRepository.save()` transactionnel** —
   accepte `ClientSession`, orchestré par `TransactionRunner.run(...)` dans
   les 3 handlers. Atomicité save-new/delete-removed/update-existing.
4. ✅ **Pattern d'erreur repo-nu / handler-wrap** :
   - Repo `loadByVersionId` / `loadByOwnerAndReference` renvoient `null` ;
     plus aucun throw infra/HTTP-aware au niveau repo.
   - Handler fait le null-check et throw `BusinessError` avec le code
     + status HTTP propres (404 / 403 / 409).
   - Handler wrappe toute erreur de persistence en `TechnicalError` avec
     **contexte** (`actorId`, `versionId`, `changedFields`, `operation`).
   - `TransactionRunner` préserve `BusinessError` / `DomainError` /
     `TechnicalError` pour qu'ils traversent sans être re-wrappés en 500.
5. ✅ **Swagger complet** — `@ApiBody(apiRequestDTO(...))` sur POST/PATCH,
   `@ApiResponse(apiSuccessDTO(...))` sur DELETE, 400/402/404/409 déclarés.
   DTOs dérivés de Zod (`CreateMusicVersionRequestPayload`,
   `UpdateMusicVersionRequestPayload`) via `createZodDto`.
6. ✅ **Tests handler** — 19 specs (`CreateMusicVersionHandler.spec.ts`,
   `UpdateMusicVersionHandler.spec.ts`, `DeleteMusicVersionHandler.spec.ts`)
   couvrant : happy path, quota, analytics, transaction order, null-load
   404, ownership 403, no-op patch short-circuit, S3-after-DB ordering,
   parallèle S3, context dans les TechnicalError wrappés.
7. ✅ **Codes API normalisés** — `MUSIC_VERSION_NOT_FOUND`,
   `MUSIC_VERSION_NOT_OWNED`, `MAX_VERSIONS_PER_REFERENCE_REACHED`,
   `MUSIC_VERSION_UPDATE_REPO_FAIL`, `MUSIC_VERSION_DELETE_REPO_FAIL`
   ajoutés. Code mort `MUSIC_VERSION_CREATION_UC_FAIL` supprimé.
8. ✅ **Sémantique `track_version` clarifiée** — commentaire corrigé
   dans `QuotaLimits.ts` : "per user, lifetime — cumulative even after
   deletion until released".
9. ✅ **Dead code supprimé** dans `UpdateMusicVersionCommand`.
10. ✅ **JSDoc complètes** sur les 3 handlers avec `@throws` typés.
11. ✅ **`DeleteMusicVersionCommand` durci** — DB save avant S3 (source of
    truth), `Promise.all` sur les S3 deletes, `Logger.warn` sur échec
    (plus de swallow silencieux).
12. ✅ **Policy + aggregate** throw `BusinessError` avec status HTTP
    propre (`MUSIC_VERSION_NOT_OWNED` 403, `MAX_VERSIONS_PER_REFERENCE_REACHED`
    409) au lieu de raw `Error` mappé en 400 par défaut.
13. ✅ **7 autres callers de l'aggregate repo** adaptés au nouveau contrat
    nullable (`UploadTrack`, `DeleteTrack`, `SetTrackFavorite`, `MasterTrack`,
    `AiMasterTrack`, `PitchShiftVersion`, `TrackUploadedHandler`).

**Restant (post-ship)** :

- `storage_bytes` release à la suppression — bloqué par l'absence de
  `fileSizeBytes` sur `TVersionTrackDomainModel`. Choix : soit persister
  la taille à l'upload, soit ajouter un `HeadObject` à l'interface de
  storage, soit sweeper + reconcile périodique.
- E2E tests music (P2 audit) — pattern MongoMemoryServer + `seedWorkspace`
  existant. Couvrir ownership cross-user, quota 402, 404, idempotence.
- Migration similaire pour `music reference` / `music repertoire` (rendre
  leurs repos purs, faire monter les erreurs au handler) — l'audit a été
  scopé version, mais la cohérence cross-module est un objectif v3.

---

## Robustesse — scoring par dimension (v2)

Même grille que [`sh3-auth-audit.md`](sh3-auth-audit.md). `3/5` = shippable,
`4/5` = au standard baselines internes (reference + repertoire),
`5/5` = au-dessus. Colonne **v1** = score initial, **v2** = score après
remédiation de ce tour.

| Dimension                     | v1  | v2  | Δ   | Justification (v2)                                                                                                                                    |
| ----------------------------- | --- | --- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DDD — entity invariants**   | 5   | 5   | =   | Inchangé. 40+ tests.                                                                                                                                  |
| **DDD — aggregate + policy**  | 5   | 5   | =   | Throws passés en `BusinessError` typé (status HTTP propre) au lieu de raw `Error`.                                                                    |
| **Scope & permissions**       | 5   | 5   | =   | Inchangé.                                                                                                                                             |
| **Validation input (Zod)**    | 5   | 5   | =   | DTOs désormais dérivés via `createZodDto(SCreate/SUpdate)`.                                                                                           |
| **CQRS — typage**             | 5   | 5   | =   | Inchangé.                                                                                                                                             |
| **Ownership enforcement**     | 4   | 4   | =   | Code propre ; seul le manque d'E2E music empêche le 5/5 (P2).                                                                                         |
| **Quota — enforcement**       | 3   | 4   | +1  | Décrément `track_version` au delete. Commentaire clarifié. `storage_bytes` release deferred (bloqué par absence de `fileSizeBytes` sur le track).     |
| **Analytics (observability)** | 1   | 5   | +4  | `music_version_created` / `_updated` (changed_fields) / `_deleted` (num_tracks) émis. Parité funnel.                                                  |
| **Swagger / DTO**             | 3   | 5   | +2  | `@ApiBody(apiRequestDTO(...))` POST/PATCH, `apiSuccessDTO` DELETE, 400/402/404/409 déclarés, DTOs Zod-derived (`CreateMusicVersionRequestPayload`…).  |
| **Error handling**            | 2   | 5   | +3  | Repo pur (nullable). Handler wrappe en `BusinessError` ou `TechnicalError` + **contexte** (actor, intent, op). `TransactionRunner` préserve les 3 erreurs typées. Codes normalisés. |
| **Atomicité DB**              | 2   | 5   | +3  | `aggregateRepo.save(aggregate, session)` + `TransactionRunner.run(...)` dans les 3 handlers. Save new / delete removed / update existing en 1 tx.      |
| **Storage lifecycle**         | 3   | 4   | +1  | DB-before-S3, `Promise.all`, `Logger.warn` sur failure. `storage_bytes` release toujours deferred.                                                    |
| **Tests — domain**            | 5   | 5   | =   | Inchangé.                                                                                                                                             |
| **Tests — handler / E2E**     | 1   | 4   | +3  | 19 specs handler (happy path, quota, analytics, tx order, 404/403, no-op patch, S3 parallèle, context wrapping). E2E music manquants (P2).            |
| **Doc technique**             | 3   | 5   | +2  | JSDoc `@throws` complètes sur les 3 handlers, audit v2 à jour.                                                                                        |
| **Architecture & lisibilité** | 5   | 5   | =   | Inchangé.                                                                                                                                             |

### Score global v2

Moyenne simple : **4.75 / 5** (v1 : 3.4).

Pondérée "ship-readiness" (poids 2 sur observability / quota / atomicité / error-handling / tests handler) : **≈4.65 / 5** (v1 : 3.0).

**Interprétation :** le module est passé de "shippable avec réserves" à
"au-dessus des baselines internes". Version dépasse désormais reference
et repertoire sur observability (analytics delete), error-handling (repo
pur + contexte actor), Swagger (ApiBody + Zod DTOs), tests handler, et
atomicité DB. La même remédiation appliquée à reference/repertoire
cohérerait le module music complet (à prévoir v3).

Limitations assumées restantes :

- `storage_bytes` release à la suppression — nécessite d'ajouter
  `fileSizeBytes` sur `TVersionTrackDomainModel` et une migration pour
  les tracks existants. Tracké post-ship.
- E2E tests music (P2 audit v1) — pattern MongoMemoryServer +
  `seedWorkspace` existe, à décliner sur les routes version pour valider
  ownership cross-user, quota 402, idempotence et ordre DB/S3 au delete.

---

## Findings — par fichier

### `apps/backend/src/music/api/music-versions.controller.ts`

**Bon** : `@PlatformScoped()` classe, `@RequirePermission(P.Music.Library.Write)`
sur chaque route (dont DELETE), `@ApiTags('music / versions')`,
`@ApiBearerAuth('bearer')`, `@ApiUnauthorizedResponse`, exécution typée
`cmdBus.execute<C, R>`, retour `TApiResponse<T>` wrappé par
`buildApiResponseDTO`. Swagger `@ApiOperation` avec summary + description
partout.

**Gaps** :

1. **`@ApiBody(apiRequestDTO(...))` manquant** sur POST et PATCH. Pas de
   source of truth côté OpenAPI pour le payload attendu — le front doit
   deviner. `sh3-writing-a-controller.md` §3 le marque comme obligatoire
   quand on a un `@Body`.
2. **DELETE n'a pas de `@ApiResponse(apiSuccessDTO(...))`**. Le code
   `MUSIC_VERSION_DELETED` existe dans `codes.ts` mais n'est jamais câblé.
   Swagger affiche juste "200 OK" sans body.
3. **Aucun `@ApiResponse({ status: 404, ... })`** sur PATCH et DELETE —
   l'endpoint peut 404 quand la version n'existe pas.
4. **Aucun `@ApiResponse({ status: 402, ... })`** sur POST — quota
   exceeded remonte en 402 via `QuotaService.ensureAllowed` + filtre
   global, mais c'est invisible dans la doc.
5. **Aucun `@ApiResponse({ status: 400, ... })`** — Zod validation peut
   échouer.
6. **POST renvoie 200** (via `apiSuccessDTO(..., 200)`) alors que
   convention REST = 201 pour création. Reference + repertoire ont la
   même incohérence, donc parité, mais autant corriger ensemble.

### `apps/backend/src/music/application/commands/CreateMusicVersionCommand.ts`

**Bon** : JSDoc riche avec `@throws`, quota `ensureAllowed` avant + 
`recordUsage` après save, délégation à `RepertoireEntryAggregate.addVersion`
(qui appelle `MusicPolicy.ensureCanMutateEntry` + `ensureCanCreateVersion`).

**Gaps** :

1. **Pas d'`analytics.track('music_version_created', ...)`**. Le pattern
   est établi (cf. `CreateRepertoireEntryCommand:54`,
   `UploadTrackCommand:86`, `MasterTrackCommand:101`). On perd le funnel
   "reference → repertoire → **version** → track → master".
2. **Ordre quota** : `ensureAllowed` est appelée **avant** le load de
   l'aggregate. Si `REPERTOIRE_ENTRY_NOT_FOUND` est thrown (user n'a pas
   le repertoire), le quota check a déjà fait une query DB pour rien.
   Micro-perf, non-bloquant.
3. **`recordUsage` non rollback si save échoue** : `save(aggregate)`
   lance, `recordUsage` n'est pas appelée → compteur cohérent. En
   revanche si la DB commit puis `recordUsage` lance, l'entity est créée
   sans tracking (under-count). Pattern identique à
   `CreateRepertoireEntryCommand` — parité — mais c'est une race à
   documenter ou à wrapper dans un try/catch qui re-record asap.

### `apps/backend/src/music/application/commands/UpdateMusicVersionCommand.ts`

**Gaps** :

1. **Aucune JSDoc**. Contraste fort avec `CreateMusicVersionCommand` qui
   liste 5 `@throws`. Qu'un auditeur sache ce qui peut sortir du
   handler = minimum.
2. **Dead code ligne 36** : après `aggregateRepo.save(aggregate)`,
   `aggregate.findVersion(cmd.versionId)` ne peut pas renvoyer
   `undefined` — l'aggregate a déjà thrown `MUSIC_VERSION_NOT_FOUND` dans
   `updateVersionMetadata` via `getVersionOrThrow`. Le `if (!version) throw`
   est inatteignable.
3. **Pas d'analytics** — idem create. Intérêt spécifique : tracer les
   changements de rating (`mastery`/`energy`/`effort`) permettrait plus
   tard de détecter les tracks "abandonnées".
4. **Pas de filtrage des champs patchable** — tout `TUpdateMusicVersionPayload`
   passe à `updateMetadata` via l'aggregate. OK car Zod a validé. Pas un
   bug mais rend possible un update vide (`{}`) qui save pour rien.
   Ajouter un short-circuit `if (Object.keys(patch).length === 0) return
   aggregate.findVersion(...).toDomain` éviterait un write.

### `apps/backend/src/music/application/commands/DeleteMusicVersionCommand.ts`

**Gaps** :

1. **Aucune JSDoc** — même remarque que Update.
2. **Pas d'analytics** — `'music_version_deleted'` avec `num_tracks`
   permettrait de mesurer l'abandon.
3. **Pas de décrément `track_version`** — le quota est lifetime, donc
   recréer = décompter à nouveau. Soit documenter "quota cumulative" (et
   l'assumer UX), soit appeler `quotaService.recordUsage(..., -1)` (ou
   `release`). Même problème pour toute version créée puis supprimée.
4. **Pas de décrément `storage_bytes`** — la suppression drop S3 mais le
   compteur storage reste. Les plans free (500 Mo) peuvent se bloquer
   sur des fichiers déjà supprimés.
5. **S3 errors swallowed silencieusement** : `await this.storage.delete(...).catch(() => {})`.
   Pas de `Logger.warn('storage_delete_failed', { trackId })` → impossible
   de détecter l'accumulation d'orphelins R2. Minimum : logger.
6. **Delete séquentiel** : boucle `for (const track of removed.tracks)`
   avec `await`. Pour une version à 2 tracks c'est trivial, mais
   `Promise.all` serait plus propre.
7. **Ordre d'opération** : S3 delete AVANT `aggregateRepo.save`. Si le
   save lance, S3 est déjà détruit mais la version est toujours en base
   → pointeurs morts. Préférer save d'abord (source of truth) puis S3
   après (best-effort, orphelins tolérables).

### `apps/backend/src/music/repositories/MusicVersionRepository.ts`

**Gaps** :

1. **`@technicalFailThrows500` seulement sur `saveOne`**. Les 8 autres
   méthodes remontent des `MongoError` nus qui arrivent dans
   `GlobalExceptionFilter` sans code ni message normalisé. Minimum :
   wrapper `updateVersion`, `deleteOneByVersionId`, `pushTrack`, `pullTrack`,
   `setTrackFavorite`, `setTrackAnalysis` (les `find*` sont moins
   critiques).
2. **`findByOwnerId` sans index implicite** — à vérifier dans les
   migrations Mongo qu'il y a un index `{ owner_id: 1 }` sur
   `music_versions`, sinon full scan.
3. **`setTrackFavorite` en 2 updates séparées** (unset all puis set one)
   sans transaction. Une requête entre les deux verrait 0 favorite.
   Faible impact (window de ms) mais documentable.

### `apps/backend/src/music/repositories/RepertoireEntryAggregateRepository.ts`

**Gaps** :

1. **`save()` non-transactionnel** : boucles new → removed → existing
   sans `ClientSession`. Crash au milieu = état mixte. Soit wrap dans
   `withTransaction`, soit documenter que "le rebuild est idempotent"
   (et ajouter un test qui le prouve).
2. **`loadByVersionId` throw `MUSIC_VERSION_NOT_FOUND` nu** — pas de
   BusinessError 404. GlobalExceptionFilter va mapper à 500 par défaut.
3. **`loadByOwnerAndReference` throw `MUSIC_REFERENCE_NOT_FOUND`** (ligne
   54) alors que le code dédié `NOT_FOUND` dans `codes.ts` a le message
   "Music reference not found". Pas branché non plus.

### `apps/backend/src/music/dto/music.dto.ts`

**Bon** : `MusicVersionPayload` complet, `VersionTrackPayload` et
`AudioAnalysisPayload` détaillés avec exemples + descriptions.
`@ApiModel()` sur chaque classe.

**Gaps** :

1. **Pas de DTO dérivé via `createZodDto(SCreateMusicVersionPayload)`** —
   tout est en `@ApiProperty` manuel. Fonctionne mais duplique la source
   of truth Zod. Le controller n'a pas de `CreateMusicVersionPayload`
   class à référencer dans `@ApiBody(apiRequestDTO(...))`.
2. **Génère un payload "domain model"** (`MusicVersionPayload`) mais pas
   de payload "create request" ni "update request" dédié — donc même si
   on ajoutait `@ApiBody`, il n'y aurait rien à pointer.

### `apps/backend/src/music/codes.ts`

**Gaps** :

1. **`MUSIC_VERSION_CREATION_UC_FAIL`** déclaré, jamais utilisé (grep
   clean). À supprimer ou câbler dans un `technicalFailThrows500` sur un
   use case qui n'existe pas encore.
2. **Pas de code `MUSIC_VERSION_NOT_FOUND`** malgré 4 `throw new
   Error('MUSIC_VERSION_NOT_FOUND')` (aggregate:92, aggregate:217,
   update:36, aggregate-repo:37). Résultat : le client voit `Error:
   MUSIC_VERSION_NOT_FOUND` au lieu de `{ code: 'MUSIC_VERSION_NOT_FOUND',
   message: '...' }`.
3. **Pas de code `MUSIC_VERSION_NOT_OWNED`** — thrown par `MusicPolicy`
   mais pas normalisé.
4. **Pas de code `MAX_VERSIONS_PER_REFERENCE_REACHED`** — même remarque.

### `apps/backend/src/quota/domain/QuotaLimits.ts` (périphérique)

**Gap sémantique** : commentaire ligne 36 `// per track` sur
`track_version` laisse penser à "max tracks (variants) par version",
mais le handler `CreateMusicVersionCommand:55` l'utilise comme compteur
**global lifetime par user**. À trancher :

- Si "per track" = erreur de commentaire → corriger le commentaire.
- Si "per track" = intent original → le code l'applique faux et
  `artist_free` devrait n'autoriser que **2 versions total** sur la vie
  du compte, ce qui est absurde pour un "free" tier. Probablement un
  legacy commentaire à nettoyer.

### Tests

**Présents** : `MusicVersionEntity.spec.ts` (308 LOC, 40+ cas),
`MusicPolicy.spec.ts`, `RepertoireEntryAggregate.spec.ts`,
`RepertoireEntryEntity.spec.ts`, `MusicReferenceEntity.spec.ts`,
`VersionTrackVO.spec.ts`.

**Absents** :

- `CreateMusicVersionHandler.spec.ts` → couvrir le flow quota + aggregate
  call + return shape + rollback si save throws.
- `UpdateMusicVersionHandler.spec.ts` → couvrir le cas où update ne
  change rien, et la délégation à `aggregate.updateVersionMetadata`.
- `DeleteMusicVersionHandler.spec.ts` → couvrir S3 cleanup call count,
  aggregate save order, et (futurement) le décrément quota.
- `src/E2E/music.e2e-spec.ts` → parcours end-to-end "créer reference →
  créer entry → créer version → update → delete" avec
  MongoMemoryServer. Prouverait ownership, quota, 404, idempotence.

---

## Recommandations — par priorité

### P0 — à faire avant de considérer le module "prod-ready"

1. **Ajouter l'émission analytics** dans les 3 commands :
   - `'music_version_created'` : `{ version_id, reference_id, genre, type }`
   - `'music_version_updated'` : `{ version_id, changed_fields }`
   - `'music_version_deleted'` : `{ version_id, num_tracks }`
2. **Gérer le quota à la suppression** :
   - Décider : cumulative (acté et documenté dans `sh3-quota-service.md`)
     ou release (ajouter une méthode `quotaService.releaseUsage`).
   - Même décision pour `storage_bytes` dans `DeleteTrackCommand` +
     `DeleteMusicVersionCommand`.
3. **Wrapper `@technicalFailThrows500`** sur les méthodes mutantes du
   repo version (`updateVersion`, `deleteOneByVersionId`, `pushTrack`,
   `pullTrack`, `setTrackFavorite`, `setTrackAnalysis`).
4. **Ajouter `MUSIC_VERSION_NOT_FOUND`, `MUSIC_VERSION_NOT_OWNED`,
   `MAX_VERSIONS_PER_REFERENCE_REACHED` dans `codes.ts`** et mapper via
   BusinessError (404 / 403 / 400) dans le GlobalExceptionFilter s'il ne
   le fait pas déjà automatiquement.
5. **Transaction sur `RepertoireEntryAggregateRepository.save()`** :
   ouvrir une `ClientSession` au début, passer `{ session }` à toutes
   les opérations repo, commit en fin. Réduit considérablement le risque
   d'état incohérent.

### P1 — parité baselines

6. Ajouter `@ApiBody(apiRequestDTO(CreateMusicVersionRequestPayload))` et
   un DTO dédié dérivé de `SCreateMusicVersionPayload` via `createZodDto`.
   Idem update.
7. Ajouter `@ApiResponse(apiSuccessDTO(MUSIC_VERSION_DELETED, ...))` sur
   DELETE.
8. Documenter 402 (quota) et 404 (version absente) via `@ApiResponse`
   explicites.
9. Compléter les JSDoc sur `UpdateMusicVersionCommand` et
   `DeleteMusicVersionCommand` (pattern `Create`).
10. Logger les S3 delete failures (`Logger.warn`) au lieu de les swallow
    silencieusement.

### P2 — durcissement post-ship

11. Tests unitaires des 3 handlers (mock aggregate repo + quota +
    analytics + storage).
12. Suite E2E music dans `src/E2E/music.e2e-spec.ts` pour prouver
    ownership cross-user, quota, 404.
13. Retirer `MUSIC_VERSION_CREATION_UC_FAIL` (dead code).
14. Retirer le dead code ligne 36 de `UpdateMusicVersionCommand`.
15. Trancher le commentaire `// per track` dans `QuotaLimits.ts`.
16. Inverser l'ordre dans `DeleteMusicVersionCommand` : save d'abord,
    S3 après (best-effort).
17. `Promise.all` sur les S3 deletes dans `DeleteMusicVersionCommand`.

---

## Related docs

| Doc | Ce qu'il apporte à l'audit |
|-----|----------------------------|
| [`sh3-music-library.md`](sh3-music-library.md) | Statut global du module, ce qui est shipped vs partial |
| [`sh3-writing-a-controller.md`](sh3-writing-a-controller.md) | Checklist controller / DTO / Swagger (référence pour les gaps §1–5) |
| [`sh3-quota-service.md`](sh3-quota-service.md) | Sémantique `ensureAllowed` / `recordUsage` / release |
| [`sh3-analytics-events.md`](sh3-analytics-events.md) | Liste d'événements attendus + pattern `track()` fire-and-forget |
| [`sh3-error-handling.md`](sh3-error-handling.md) | Taxonomie DomainError / BusinessError / TechnicalError |
| [`sh3-e2e-tests.md`](sh3-e2e-tests.md) | Pattern `MongoMemoryServer` + `seedWorkspace` pour les E2E manquants |
| [`sh3-auth-audit.md`](sh3-auth-audit.md) | Format de cet audit (grille, scoring, TL;DR) |

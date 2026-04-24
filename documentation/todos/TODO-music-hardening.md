# Music — Hardening to 18/20

> **État** : backlog
> **Objectif** : passer la feature music de ~13/20 (solide fonctionnel, trous
> de robustesse) à ~18/20 (prod-ready scale).
>
> Chaque item est soit un bug latent, un trou d'observabilité, ou une dette
> de robustesse qui pétera en prod. Zéro item de confort ou de feature — ça
> vit dans [`TODO-music-features.md`](TODO-music-features.md).

---

## P0 — Casse en prod, bloquant avant tout ship payant

- [ ] **`TrackUploadedEvent` est un SPOF silencieux**
      Le handler publie l'event après save ; si `audio-processor` est down,
      l'analyse ne repart jamais. Aucun retry, aucune DLQ, aucune visibilité.
      Fix : table `pending_analyses`, handler idempotent, worker qui
      re-dispatche avec backoff, alerte si l'âge dépasse 5 min.

- [ ] **Compensation S3 muette**
      Les handlers Upload / Master / AiMaster / PitchShift font
      `catch(() => {})` sur le delete de compensation. Si R2 down pendant la
      compensation, l'orphan reste pour toujours et personne ne le sait.
      Fix : `logger.error({ s3_key, reason })` structuré + compteur
      `r2_compensation_failed` exposé en métrique.

- [ ] **Pas de transaction autour de `TrackUploaded` → `MusicVersion.tracks` patch**
      Si l'utilisateur supprime la version pendant l'analyse, le patch
      ressuscite un aggregate zombie.
      Fix : champ `version` Mongo sur l'aggregate, check + increment atomique
      (optimistic locking), reject du patch si le stamp a changé.

- [ ] **`MAX_MASTERS = 1` = cul-de-sac UX**
      Un user qui clique "Master" une fois ne peut plus jamais en refaire un
      autre sans supprimer manuellement — et ne le saura pas.
      Décision produit à trancher : soit "remaster remplace l'ancien"
      (cascade S3 delete), soit lever le cap à N avec indicateur UI.

## P1 — Fiabilité + sécurité, avant scale

- [ ] **Pas d'idempotency-key sur `POST /versions/:id/tracks`**
      Timeout réseau côté client + retry = 2 uploads facturés, 2 blobs R2,
      1 seul track visible.
      Fix : header `Idempotency-Key`, lookup Redis TTL 1 h avant upload.

- [ ] **`audioClient.send(...).pipe(timeout(300_000))` — 5 min flat, pas de breaker**
      Si l'AP crash pendant 5 min, tous les masters en cours échouent en
      cascade, les users voient 5 min de modal spinner.
      Fix : circuit breaker (hystrix-style), échec rapide après N failures
      sur fenêtre glissante.

- [ ] **`buildTrackS3Key` accepte `fileName` utilisateur sans sanitization**
      Possible `../../` ou null-byte. R2 normalise mais ffmpeg downstream
      peut ne pas sanitiser.
      Fix : strip à `[a-zA-Z0-9._-]{1,200}` au point d'entrée, fichier
      original stocké en metadata.

- [ ] **Presigned URLs — TTL non documenté, pas de revocation**
      Un track supprimé pendant que l'URL est vivante reste téléchargeable.
      Fix : TTL court (60 s), signer avec une clé rotée quand le track est
      supprimé.

- [ ] **Aucune rate-limiting sur master / ai-master / pitch-shift**
      Un user peut déclencher 50 opérations parallèles si le quota le permet.
      Fix : semaphore par user (max 2 processing concurrents), queue le
      reste avec position visible.

- [ ] **`QuotaService.recordUsage` n'est pas transactionnel avec le save**
      Si save passe mais recordUsage crash après, quota sous-compté.
      Compensation = sur-comptage possible.
      Fix : event-sourcé (`quota_events` append-only, projection
      reconstruite) ou outbox pattern.

## P2 — Observabilité, sinon debug impossible

- [x] **Zéro trace distribuée backend ↔ audio-processor** — `correlationId: string`
      ajouté sur `TCorrelatedPayload` (mixin) + sur les 4 payloads TCP
      (`TAnalyzeTrackPayload`, `TMasterTrackPayload`, `TPitchShiftTrackPayload`,
      `TAiMasterTrackPayload`). Généré par `newCorrelationId()` au handler d'entrée,
      propagé dans `TrackUploadedEvent` + `TrackMasteredEvent`, loggé à chaque étape
      sur les deux côtés avec `correlation_id=…` dans le contexte.

- [x] **Pas de métrique prometheus/otel sur les durées par stage** — ajout de
      `prom-client` sur `audio-processor` + histogramme
      `audio_processor_stage_duration_seconds{op, stage, outcome}` avec buckets
      50 ms → 180 s (analyse rapide, mastering / AI minute-scale). Helper
      `measure(op, stage, fn)` wrap chaque étape (s3_download / wasm_analysis /
      ffmpeg_loudnorm / ffmpeg_pitch / deepafx_inference / s3_upload) avec
      l'outcome (`success` / `error`) pour que les dashboards p99 restent
      interprétables côte-à-côte avec le taux d'erreur. Exposé via
      `GET /metrics` sur `METRICS_PORT` (default 9101), séparé du TCP
      microservice pour pouvoir firewall l'un sans affecter l'autre.

- [x] **Pas d'alerting sur `storage_bytes` approchant du quota** — `StorageQuotaWarningService`
      côté frontend : probe `GET /quota/me` après chaque upload/master, fire toast +
      notification panel aux seuils 80 % / 95 %, dedup per-session par (resource, seuil).
      Swallow-HTTP-error pour ne jamais bloquer une mutation. Wiring : hook dans
      `music-library-page` au succès upload + mastering-closed. Email push reste
      en follow-up (infra notif email absente).

- [x] **Logs handlers = `Logger.log` sans corrélation ni JSON** — `ContextLogger`
      ajouté côté backend (`apps/backend/src/utils/logging/ContextLogger.ts`) et
      côté audio-processor (`apps/audio-processor/src/shared/logging/ContextLogger.ts`).
      Format `key=value` en dev, JSON quand `LOG_FORMAT=json` est set (prod / CI).
      Binde `{correlation_id, user_id, version_id, track_id, …}` une fois par
      handler ; chaque log call peut y ajouter des champs par-dessus
      (`log.info('complete', { size_bytes })`). Tous les handlers music
      (`UploadTrack`, `MasterTrack`, `AiMasterTrack`, `PitchShiftVersion`,
      `TrackUploadedHandler`, `TrackMasteredHandler`) + le contrôleur
      audio-processor sont migrés.

## P3 — Dette de correctness qui revient hanter

- [x] **Compensation S3 testée partiellement** — ajout d'un
      `swallows a compensation-delete failure` sur les 3 handlers Master / AiMaster /
      PitchShift. Les specs Upload et Delete avaient déjà ce cas, les trois autres
      s'alignent maintenant sur le même contrat.

- [x] **Pas de test d'intégration upload → analyse → DB** — `music-upload-analysis.e2e-spec.ts`
      boot le full AppModule avec `AUDIO_PROCESSOR` et `TRACK_STORAGE_SERVICE` overridés,
      injecte un fake analysis snapshot via `of(...)`, poll le doc Mongo jusqu'à ce que
      `analysisResult` apparaisse sur le track. Cas null (AP répond null) couvert aussi.

- [x] **`MusicPolicy` hardcode les limites en constantes locales** — `MusicPolicyLimits`
      injecté au constructeur avec `DEFAULT_MUSIC_POLICY_LIMITS` fallback. Tableau
      `MUSIC_POLICY_LIMITS_BY_PLAN` avec tiers cohérents (free = default ; pro = 4/2/5/25 ;
      max / business = 8-10/4/10/100). `MusicPolicyLimitsProvider` résout via
      `QuotaService.getPlan`, `RepertoireEntryAggregateRepository` passe les limits
      résolues à la policy au moment du load. Fallback au default si QuotaService throw.

- [x] **Dedup référence = `title.trim().toLowerCase()` simple** — extrait dans
      `domain/normalizeRefKey.ts` : NFKD + strip des diacritiques + strip zero-width
      (U+200B–U+200D, U+FEFF) + collapse des espaces + lowercase. Utilisé par
      `MusicReferenceEntity` (storage) et `CreateMusicReferenceHandler` (lookup) —
      les deux côtés du contrat dedup.

- [ ] **`findByUserId` sur `IMusicRepertoireRepository` non appelée**
      Dead code ou en attente d'un consumer ? Supprimer ou documenter.

- [x] **`fuzzyMatch` du selector = subsequence simple, pas Levenshtein** — remplacé
      par un matcher 3 passes dépendance-free : substring normalisé, Levenshtein
      par token avec seuil scalable (max(1, q.length/4)), subsequence en dernier
      recours pour les abréviations ("bhrp" → "bohemian rhapsody"). Normalisation
      NFKD + strip diacritiques communs avec `normalizeRefKey` — les users qui
      cherchent "Celine" trouvent "Céline".

## P4 — Architectural, tenir 2 ans

- [x] **`MusicLibraryStateService` encore obèse (326 lignes, 3 responsabilités)** — split
      en `MusicLibraryDataService` (entries + loadLibrary + refreshEntries),
      `MusicTabPersistenceService` (tabs + savedTabConfigs + debounced save) et
      `MusicCrossLibraryService` (crossContext + cache par company). La classe façade
      garde l'API publique inchangée (`library()`, `tabState`, `loadLibrary()`,
      `refreshEntries()`, `loadCrossLibrary()`, `scheduleTabSave()`, `snapshot()`,
      `updateState()`) pour ne pas casser les call sites.

- [x] **`TabMutationService.patchTabConfig` public** — passé en `protected`. Les
      sous-classes (`MusicTabMutationService`, `PlaylistsTabMutationService`) sont
      déjà les seuls consommateurs légitimes ; le test harness expose un
      `patchTabConfigForTest` narrow pour garder les assertions directes.

- [ ] **Pas de `schema_version` sur `TMusicTabConfigsDomainModel`**
      Changer le shape demain = migration impossible à tracer.
      Fix : `schema_version: 1` sur tous les aggregates music, middleware
      up-version au load.

---

## Chemin 13 → 18

| Palier  | Items                                                               | Effort estimé              |
| ------- | ------------------------------------------------------------------- | -------------------------- |
| 13 → 15 | P0 complet (4 items)                                                | ~2 semaines backend senior |
| 15 → 16 | P1 complet (6 items)                                                | ~1 semaine + revue sécu    |
| 16 → 17 | P2 complet (4 items)                                                | ~3-4 jours avec stack OTel |
| 17 → 18 | P3 critiques (3 items : test intégration, policy DI, dedup Unicode) | ~1 semaine                 |

Au-delà de 18, le curseur se déplace sur la couverture fonctionnelle (pagination,
cross search, rekordbox, widget home) — tracées dans
[`TODO-music-features.md`](TODO-music-features.md), hors scope "solidité".

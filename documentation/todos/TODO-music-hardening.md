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

- [ ] **Zéro trace distribuée backend ↔ audio-processor**
      User dit "mon master est bloqué depuis 10 min" → aucun correlation-id
      pour remonter le pipeline.
      Fix : propager `correlation-id` dans le payload TCP, le logger à
      chaque étape (enqueue / ffmpeg start / ffmpeg end / S3 upload / save).

- [ ] **Pas de métrique prometheus/otel sur les durées par stage**
      On ignore si `loudnorm` prend 2 s ou 45 s en p99.
      Fix : histogramme
      `audio_processor_stage_duration_seconds{stage, outcome}`.

- [ ] **Pas d'alerting sur `storage_bytes` approchant du quota**
      User à 90 % n'est pas prévenu, tape le mur à l'upload suivant.
      Fix : threshold côté back, event `quota_threshold_reached` → toast +
      email.

- [ ] **Logs handlers = `Logger.log` sans corrélation ni JSON**
      Pas de `requestId`, pas de structured logging — grep en prod =
      cauchemar.
      Fix : `ContextLogger` injecté qui ajoute
      `{ request_id, user_id, handler, version_id }` à chaque log.

## P3 — Dette de correctness qui revient hanter

- [ ] **Compensation S3 testée partiellement**
      Les specs vérifient que `storage.delete(key)` est appelé, mais pas le
      "best-effort" quand `delete` throw. Ajouter un test
      `swallows S3 compensation failure` sur Master / AiMaster / PitchShift.

- [ ] **Pas de test d'intégration upload → analyse → DB**
      Sans lui, un changement de forme sur `TrackUploadedEvent` casse
      silencieusement.
      Fix : spec e2e avec Mongo memory + mock AP TCP transport + vrai
      fichier WAV 1 s.

- [x] **`MusicPolicy` hardcode les limites en constantes locales** — `MusicPolicyLimits`
      injecté au constructeur avec `DEFAULT_MUSIC_POLICY_LIMITS` fallback. Le context
      des erreurs embarque maintenant la limite effective, pas la constante. Wiring
      plan-aware à faire côté aggregate repo (follow-up P1).

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

- [ ] **`MusicLibraryStateService` encore obèse (326 lignes, 3 responsabilités)**
      Déjà signalé dans `TODO-music-features.md` mais listé ici aussi car
      couplé aux P3.
      Split : `MusicDataService` / `MusicTabPersistenceService` /
      `MusicCrossLibraryService`, état composite dans un store thin.

- [ ] **`TabMutationService.patchTabConfig` public**
      Sur-protégé par les overrides mais bypassable par un futur dev.
      Passer en `protected`.

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

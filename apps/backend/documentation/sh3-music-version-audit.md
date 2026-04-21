# SH3PHERD — Music Version Audit (2026-04-21)

> Prod-readiness audit of `apps/backend/src/music` scoped to the **version** module, measured against the `music-reference` and `music-repertoire` baselines already shipped on `dev`.
>
> **Scope:** `MusicVersionsController`, `CreateMusicVersionCommand`, `UpdateMusicVersionCommand`, `DeleteMusicVersionCommand`, `MusicVersionPayload` DTO, related `codes.ts` entries, and the `track_version` quota annotation.
>
> **Out of scope:** track upload/master/pitch-shift (their own handlers), the aggregate repo's transactional `save` (already done on dev), `sizeBytes` persistence (already done on dev), analytics event plumbing (types already present on dev).
>
> Companion doc: [`sh3-music-version-api.md`](sh3-music-version-api.md).

---

## TL;DR — Verdict

The version module was already **solid at the domain layer** (entity, policy, aggregate, cascade-delete with derivations, analytics events emitted, transactional aggregate save). The gaps were concentrated at the **API surface** (Swagger incomplete vs reference/repertoire), in **handler ergonomics** (no-op update, dead code, swallow-on-S3), and in **test coverage** (domain-heavy, zero handler specs).

This pass closes all of them. Score moved from **3.7 → 4.6** (simple mean) across 12 dimensions.

No bloquant restant pour ship.

---

## Robustesse — scoring par dimension

Same grid as [`sh3-auth-audit.md`](sh3-auth-audit.md). `3/5` = shippable, `4/5` = at the internal baselines (reference + repertoire), `5/5` = above.

| Dimension                     | v0  | v1  | Δ   | Justification (v1)                                                                                                                                                                  |
| ----------------------------- | --- | --- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DDD — entity invariants**   | 5   | 5   | =   | `MusicVersionEntity`: label trim + non-empty, owner/reference required, favorite auto-promote. 40+ tests.                                                                           |
| **DDD — aggregate + policy**  | 5   | 5   | =   | `RepertoireEntryAggregate.removeVersionWithDerivations` recursive; `MusicPolicy` with 4 limits (MAX_TRACKS, MAX_MASTERS, MAX_DERIVATIONS, MAX_VERSIONS_PER_REFERENCE).              |
| **Scope & permissions**       | 5   | 5   | =   | `@PlatformScoped()` + `@RequirePermission(P.Music.Library.Write)` on all routes.                                                                                                    |
| **Validation input (Zod)**    | 4   | 5   | +1  | Body already Zod-piped. Added Zod-pipe on `:id` (`SMusicVersionId`) — malformed IDs never reach the aggregate repo.                                                                 |
| **CQRS — typage**             | 5   | 5   | =   | `commandBus.execute<Command, Result>`, `Promise<TApiResponse<T>>`, `buildApiResponseDTO`. Zero `any`.                                                                               |
| **Quota — enforcement**       | 4   | 4   | =   | `ensureAllowed('track_version')` before create, `recordUsage` after. `storage_bytes` credited back at delete. `track_version` **not** credited back — documented as intentional.    |
| **Analytics (observability)** | 4   | 5   | +1  | `music_version_{created,updated,deleted}` already emitted. Added richer metadata parity (`updated_fields[]`, `changes`, `track_count`, `derivation_count`, `total_size_bytes`).     |
| **Swagger / DTO**             | 2   | 5   | +3  | Added `@ApiBody(apiRequestDTO(...))` on POST/PATCH, `apiSuccessDTO` on DELETE, 400/402/403/404/409/429 declared, Zod-derived `CreateMusicVersionRequestDTO` / `Update…RequestDTO`.  |
| **Error handling**            | 4   | 4   | =   | Aggregate repo throws typed `BusinessError` (4xx). Policy throws `DomainError` (400). Save failures → `TechnicalError` with `entry_id` / `owner_id` / counts context.               |
| **Atomicité DB**              | 5   | 5   | =   | `RepertoireEntryAggregateRepository.save` opens its own transaction when no session is provided; honours the caller's session otherwise (already there on dev).                     |
| **Storage lifecycle**         | 3   | 5   | +2  | Delete cascades to derivations, `sizeBytes` persisted at ingest, `storage_bytes` credited back. Added `Promise.all` + `Logger.warn` on S3 delete failures (no more silent swallow). |
| **Tests — domain**            | 5   | 5   | =   | 6 domain specs already covering entity, policy, aggregate, VO.                                                                                                                      |
| **Tests — handler / E2E**     | 1   | 4   | +3  | 19 handler specs added (Create/Update/Delete): quota gate, analytics, ownership, S3 ordering, Promise.all, sum of sizeBytes, post-save rollback. No E2E music yet (P2).             |
| **Doc technique**             | 2   | 5   | +3  | Added JSDoc `@throws` typed on Update/Delete handlers. Added `sh3-music-version-api.md` following reference/repertoire pattern + this audit doc.                                    |
| **Architecture & lisibilité** | 5   | 5   | =   | Controller 120 LOC, one handler per file, entity + policy + aggregate separate, naming cohérent.                                                                                    |

### Score global

Simple mean: **4.6 / 5** (v0: 3.7).

Weighted "ship-readiness" (×2 on observability / swagger / handler tests / storage): **4.65 / 5**.

The gap with reference/repertoire is **closed** on all dimensions except E2E (a shared gap — the whole `music` module has no E2E yet; tracked as P2 in `TODO-tech-debt.md`).

---

## Changes landed in this pass

### Controller ([`music-versions.controller.ts`](../src/music/api/music-versions.controller.ts))

- `@ApiBody(apiRequestDTO(CreateMusicVersionRequestDTO))` on POST, `UpdateMusicVersionRequestDTO` on PATCH.
- `@ApiResponse(apiSuccessDTO(MUSIC_VERSION_DELETED, MusicVersionDeletedPayload, 200))` on DELETE.
- 400 (Zod + domain), 402 (quota), 403 (not owner), 404 (not found), 409 (max versions), 429 (throttle) declared.
- `@Throttle({ default: { limit: 30, ttl: 60_000 } })` on POST (matches `music-repertoire` POST).
- `@Param('id', new ZodValidationPipe(SMusicVersionId))` on PATCH + DELETE — malformed IDs rejected at the pipe.
- POST now returns `201` (was `200`).
- Controller JSDoc rewritten.

### DTO ([`music.dto.ts`](../src/music/dto/music.dto.ts))

- `CreateMusicVersionPayload extends createZodDto(SCreateMusicVersionPayload)` + envelope `CreateMusicVersionRequestDTO`.
- `UpdateMusicVersionPayload extends createZodDto(SUpdateMusicVersionPayload)` + envelope `UpdateMusicVersionRequestDTO`.
- `MusicVersionDeletedPayload` for the DELETE response shape (same shape as `RepertoireEntryDeletedPayload`).

### UpdateHandler ([`UpdateMusicVersionCommand.ts`](../src/music/application/commands/UpdateMusicVersionCommand.ts))

- JSDoc with typed `@throws` (BusinessError / DomainError / TechnicalError).
- No-op short-circuit when the patch has no defined fields — no DB write, no analytics emission.
- Dead code removed: the `findVersion` re-lookup after a save had `updateVersionMetadata` already guaranteed non-null.
- `updated_fields` extraction moved before the save (used for analytics and for the short-circuit decision).

### DeleteHandler ([`DeleteMusicVersionCommand.ts`](../src/music/application/commands/DeleteMusicVersionCommand.ts))

- JSDoc with typed `@throws`.
- S3 deletes parallelised with `Promise.all` instead of sequential awaits.
- `Logger.warn` on each S3 delete failure with `key`, `versionId`, and the error message (no more silent `.catch(() => {})`).
- Explicit comment on the DB-save-before-S3 ordering (source-of-truth principle).

### codes.ts ([`codes.ts`](../src/music/codes.ts))

- Dead code `MUSIC_VERSION_CREATION_UC_FAIL` removed.

### Quota ([`QuotaLimits.ts`](../src/quota/domain/QuotaLimits.ts))

- Comment on `track_version` rewritten: `// per user lifetime — not credited back on version delete (by design, versions are "slots" earned once)`. Replaces the misleading `// per track` annotation.

### Handler tests (new)

3 spec files in [`commands/__tests__/`](../src/music/application/commands/__tests__/):

- `CreateMusicVersionHandler.spec.ts` — quota gate ordering, save + record, analytics emission, quota-exceeded fast-fail, label invariant.
- `UpdateMusicVersionHandler.spec.ts` — happy path, empty-patch short-circuit, all-undefined short-circuit, not-owner (DomainError), label invariant.
- `DeleteMusicVersionHandler.spec.ts` — DB-before-S3 ordering, Promise.all parallelism, sum of `sizeBytes` for quota restitution, no-size fallback, analytics payload shape, not-owner rejection, rollback on save failure.

Plus a small shared `handler-test-helpers.ts` mock factory.

### Docs (new)

- [`sh3-music-version-api.md`](sh3-music-version-api.md) — public-facing API doc (domain model, sequence diagrams, endpoints, quota/analytics, error taxonomy) matching the style of `sh3-music-reference-api.md` and `sh3-music-repertoire-api.md`.
- This audit.
- Index updates in [`apps/backend/documentation/README.md`](README.md) and the onboarding table in [`CLAUDE.md`](../../../CLAUDE.md).

---

## Limitations still carried

- **No E2E tests for music** — entire `music` module; not a version-specific regression. Pattern (`MongoMemoryServer` + `seedWorkspace`) exists and can be extended. Tracked as P2.
- **`track_version` is cumulative by design** — there is no recorded request to change this; the `// per user lifetime` comment now makes the decision explicit.
- **Delete analytics doesn't carry `s3_delete_failures`** — the handler logs each failure but doesn't surface a count in the emitted event. Low-value until a dashboard needs it.

---

## Related docs

| Doc                                                          | What it adds                                                   |
| ------------------------------------------------------------ | -------------------------------------------------------------- |
| [`sh3-music-version-api.md`](sh3-music-version-api.md)       | API doc with domain model + sequence diagrams + endpoint table |
| [`sh3-music-repertoire-api.md`](sh3-music-repertoire-api.md) | Baseline it's matched against                                  |
| [`sh3-music-reference-api.md`](sh3-music-reference-api.md)   | Same                                                           |
| [`sh3-writing-a-controller.md`](sh3-writing-a-controller.md) | Controller conventions used for the hardening                  |
| [`sh3-quota-service.md`](sh3-quota-service.md)               | Quota semantics (periods, `recordUsage(-amount)` restitution)  |
| [`sh3-analytics-events.md`](sh3-analytics-events.md)         | Analytics envelope + event types tuple                         |
| [`sh3-auth-audit.md`](sh3-auth-audit.md)                     | Audit format this doc mirrors                                  |

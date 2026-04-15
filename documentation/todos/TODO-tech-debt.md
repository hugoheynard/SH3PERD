# SH3PHERD — TODO & Technical Debt

> Généré le 26/03/2026. Classé par priorité et domaine.

---

## 🔴 Bugs / Correctifs urgents

_(rien actuellement)_

---

## 🟠 Dette architecturale — Backend

### Entity / Domain layer

- [ ] **`Entity` ne devrait pas étendre `AggregateRoot` (NestJS CQRS)**
  - Actuellement toutes les entités héritent de `AggregateRoot` → couplage du domain layer à NestJS
  - Seuls les agrégats racines devraient avoir `apply()` / `commit()`
  - Cible : `Entity` → pur TypeScript, `AggregateRoot` → uniquement pour les racines d'agrégats
  - Fichier : `apps/backend/src/utils/entities/Entity.ts`

- [ ] **`EntityUtils.deepDiffToDotSet` couplé à MongoDB**
  - Le TODO est déjà dans le code : séparer le diff de la sérialisation dot-path MongoDB
  - Créer un `MongoUpdateMapper` séparé qui consomme le diff
  - Fichier : `apps/backend/src/utils/entities/EntityUtils.ts`

- [ ] **Couplage MongoDB explicite jusque dans l'application layer**
  - Plusieurs commands importent directement `Filter` / `UpdateFilter` depuis `mongodb`
  - Ça rend les use cases dépendants du driver Mongo au lieu de dépendre de contrats applicatifs neutres
  - Cible : déplacer les détails Mongo dans les repositories / mappers d'infrastructure, et exposer des méthodes métier typées (`assignRole`, `updateContract`, `reorderNodes`, etc.)
  - Modules concernés observés : `apps/backend/src/company/application/commands/`, `apps/backend/src/contracts/application/commands/`

### Module Contracts

- [ ] **`ContractMongoRepository.contractViewModelPipelineByFilter()` duplique `ContractReadRepository.getContractListViewModel()`**
  - Les deux font la même agrégation avec des `foreignField` différents (bug possible)
  - Vérifier lequel est correct et supprimer l'autre
  - Fichiers : `apps/backend/src/contracts/repositories/`

- [ ] **`findById` avec `filter: any`** dans `ContractMongoRepository`
  - Typer correctement le filtre
  - `@technicalFailThrows500('', '')` avec strings vides — renseigner les codes

- [ ] **`ContractAggregate`** — étend `AggregateRoot` mais est vide, n'émet aucun event
  - Soit l'implémenter, soit le supprimer

- [ ] **Fonctionnalité `favorite`** — logique dans le repo, endpoint commenté dans le controller
  - Décider : implémenter ou supprimer le code mort

### Module Company (nouveau)

- [ ] **`CompanyPolicy`** — `ensureCanManage` vérifie juste que l'acteur existe
  - Brancher sur un vrai système de permissions/rôles quand disponible

- [ ] **`CastAggregateRoot`** — les casts `as TCastId` sont des casts de type, pas des validations
  - Régler à la source en fixant les types retournés par `Entity.id`

- [ ] **Transactions MongoDB manquantes sur `AddCastMember` / `RemoveCastMember`**
  - `Promise.all([castRepo.updateOne, eventRepo.save])` n'est pas atomique
  - Wrapper dans une session MongoDB comme `markContractAsFavorite`

### Cross-domain

- [x] **`buildApiResponseDTO` importé depuis `music/codes.js` dans `user.controller.ts`**
  - Déplacé vers `apps/backend/src/utils/response/buildApiResponseDTO.ts`
  - Les controllers company, music et user importent maintenant l'util partagé.

### Swagger

- [ ] **`@ResPayloadValidator({ active: false })`** dans `user.controller.ts`
  - Activer ou supprimer — du bruit dans l'état actuel

- [ ] **`data!: T` dans `ApiResponseDTO`**
  - Remplacer par `declare data: T` (plus explicite, même effet)
  - Fichier : `apps/backend/src/utils/swagger/api-response.swagger.util.ts`

---

## 🟡 Features à connecter (front ↔ back)

### Music Library — Cross répertoire

- [x] **Le mode `cross` du front appelle l'API backend**
  - Endpoint actuel : `GET /protected/companies/:id/cross-library`
  - Le front résout le `companyId` depuis le `contractId` actif puis appelle l'API via `MusicLibraryApiService.getCrossLibrary()`

- [ ] **Clarifier le modèle métier de sélection cross**
  - Aujourd'hui, un onglet en mode `cross` référence un `contractId`, qui sert à retrouver la company.
  - Décider si la cible finale doit rester company-wide ou devenir plus fine (`castId` / node / service).
  - Si on passe au `castId`, mettre à jour `MusicSearchTarget` et créer l'endpoint dédié.

### Music Library — Upload & Analyse

- [ ] **`AudioAnalyzerService` et `trackFiles Map`** — les fichiers uploadés vivent en mémoire
  - À terme : upload vers un bucket (S3 / GCS), stocker l'URL sur la version
  - L'analyse devrait tourner côté backend (worker Node) ou via un job queue

---

## 🟢 Améliorations UI (Frontend)

### Composants réutilisables (discussion en attente)

La conversation sur les composants réutilisables a été mise en pause :

- [ ] **`ui-popover`** — frame avec `ng-content`, reprendre le design des panneaux flottants du tab-bar
- [ ] **`ui-rating-dots`** — composant standalone : input `value: Rating`, output coloré selon level
- [ ] **`ui-genre-tag`** — pill tag réutilisable (actuellement inline dans card et table)
- [ ] **`ui-btn`** — bouton avec variants (primary / danger / ghost / accent)

### Music Library

- [ ] **Responsive mobile** — la mise en page a été implémentée mais mérite une passe de test sur vrais devices
- [ ] **Tab configs** — les configs sauvegardées sont en mémoire (`MusicLibraryState`), pas persistées
  - Brancher sur une API ou `localStorage` pour la persistance

### Cross-table

- [ ] **Afficher les 3 ratings (MST / NRG / EFF)** dans les cellules membres, pas seulement MST
  - Actuellement limité à mastery par manque de place — revoir le layout en mode expanded

---

## ⚪ Refactoring / Cleanup

- [x] **Module Music sorti des ignores ESLint**
  - `src/music` n'est plus ignoré dans `apps/backend/eslint.config.mjs`.
  - Les repositories music utilisent maintenant des types Mongo explicites au lieu de `as any`.
  - `pnpm --filter @sh3pherd/backend lint` passe avec le module music inclus.

- [x] **Module Company sorti des ignores ESLint**
  - `src/company` n'est plus ignoré dans `apps/backend/eslint.config.mjs`.
  - Les controllers, commands et repositories company ont des retours explicites et des filtres/updates Mongo typés.
  - `pnpm --filter @sh3pherd/backend lint` passe avec le module company inclus.

- [x] **Module Contracts sorti des ignores ESLint**
  - `src/contracts` n'est plus ignoré dans `apps/backend/eslint.config.mjs`.
  - Les endpoints, commands et repositories contracts ont des retours explicites et des updates Mongo typés.
  - Le champ favori contract utilise `is_favorite` / `id`, aligné avec les types partagés actuels.
  - `pnpm --filter @sh3pherd/backend lint` passe avec le module contracts inclus.

- [x] **Utils backend sortis des ignores ESLint**
  - `src/utils` n'est plus ignoré dans `apps/backend/eslint.config.mjs`.
  - Les decorators Nest, helpers d'erreurs, helpers metadata, Swagger/Zod et use-case builders sont typés sans `any` explicite.
  - Les tests utils ont été réalignés sur le modèle metadata actuel.
  - `pnpm --filter @sh3pherd/backend lint` passe avec les utils inclus.

- [x] **Types backend sortis des ignores ESLint**
  - `src/types` n'est plus ignoré dans `apps/backend/eslint.config.mjs`.
  - L'augmentation Express documente l'exception `interface`, nécessaire au declaration merging.
  - `pnpm --filter @sh3pherd/backend lint` passe avec les types inclus.

- [x] **Bus reactions sorti des ignores ESLint**
  - `src/busReactions` n'est plus ignoré dans `apps/backend/eslint.config.mjs`.
  - Aucun correctif de code n'a été nécessaire après auto-format.
  - `pnpm --filter @sh3pherd/backend lint` passe avec bus reactions inclus.

- [x] **Integrations sorti des ignores ESLint**
  - `src/integrations` n'est plus ignoré dans `apps/backend/eslint.config.mjs`.
  - Les credentials integration utilisent des filtres/updates Mongo typés et des getters explicites.
  - `pnpm --filter @sh3pherd/backend lint` passe avec integrations inclus.

- [x] **Print sorti des ignores ESLint**
  - `src/print` n'est plus ignoré dans `apps/backend/eslint.config.mjs`.
  - Les anciens ignores `src/calendar` et `src/userGroups` ont été supprimés car les dossiers n'existent plus.
  - `pnpm --filter @sh3pherd/backend lint` passe avec print inclus.

- [ ] **Tests spec stubs auto-générés** avec imports sans `.js` — cassés depuis longtemps
  - `apps/backend/src/auth/**/*.spec.ts` — mettre à jour ou supprimer
  - `apps/backend/src/appBootstrap/__tests__/` — idem

- [ ] **`MOCK_TABS` et `mockCrossContext`** dans `utils/mock-music-data.ts`
  - Quand le back est branché, supprimer les mocks et charger depuis l'API

- [ ] **`ContractReadRepository` vs `ContractMongoRepository`** — clarifier la frontière CQRS
  - Read repo : uniquement les projections/view models (agrégations MongoDB)
  - Write repo : uniquement les mutations (save, update, delete)

---

## 📋 Backlog fonctionnel (non démarré)

### Company — Organigramme

- [ ] **Lazy loading de l'organigramme par service**
  - Actuellement : 1 appel `GET /companies/:id/orgchart` charge toutes les teams et membres d'un coup
  - À terme : charger les sous-nœuds (teams + membres) uniquement au clic sur un service
  - Implique : endpoint `GET /companies/:id/services/:serviceId/orgchart` + skeleton loader par service
  - Pertinent quand une company dépasse ~10 services / ~200 membres

- [ ] Système de **permissions / rôles** (référencé par `CastPolicy`, `CompanyPolicy`)
- [ ] **Signing de contrat** — `signedBy` est dans le modèle mais commenté dans l'implémentation
- [ ] **Addenda de contrat** — type défini dans shared-types, non implémenté (`//DONT USE NOW`)
- [ ] **Services dans Company** — CRUD des services/pôles (endpoint manquant dans `CompanyController`)
- [ ] **Archive d'un Cast** — méthode dans l'agrégat, pas d'endpoint exposé
- [ ] **Historique de membership** — endpoint `GET /casts/:castId/membership-events` pour l'audit trail

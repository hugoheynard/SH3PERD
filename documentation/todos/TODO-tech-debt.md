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

- [ ] **`buildApiResponseDTO` importé depuis `music/codes.js` dans `user.controller.ts`**
  - Déplacer vers `utils/api/` ou `shared/`
  - Fichier : `apps/backend/src/music/codes.js` → destination : `utils/response/buildApiResponse.ts`

### Swagger

- [ ] **`@ResPayloadValidator({ active: false })`** dans `user.controller.ts`
  - Activer ou supprimer — du bruit dans l'état actuel

- [ ] **`data!: T` dans `ApiResponseDTO`**
  - Remplacer par `declare data: T` (plus explicite, même effet)
  - Fichier : `apps/backend/src/utils/swagger/api-response.swagger.util.ts`

---

## 🟡 Features à connecter (front ↔ back)

### Music Library — Cross répertoire

- [ ] **Le mode `cross` du front est sur des données mockées**
  - Créer l'endpoint backend : `GET /protected/companies/casts/:castId/repertoire/cross`
  - Le backend croise les répertoires des membres du Cast et retourne `CrossReferenceResult[]`
  - Wirer le front pour remplacer `mockCrossContext` par un vrai appel API

- [ ] **La sélection du Cast actif n'est pas modélisée côté front**
  - Un onglet en mode `cross` doit référencer un `contractId` → résoudre le Cast correspondant
  - Mettre à jour `MusicSearchTarget` pour passer le `castId` (pas le `contractId`)

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

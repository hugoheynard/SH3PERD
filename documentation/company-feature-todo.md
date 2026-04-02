# Company Feature — TODO

## En cours

### Settings — Channels tab (integration-first)
- [x] Types `TCompanyIntegration`, `TCompanyChannel` dans shared-types
- [x] Entity `CompanyEntity` — `updateIntegrations()`, `updateChannels()`
- [x] Backend `UpdateCompanyInfoCommand` — sauvegarde integrations + channels
- [x] Frontend service + store — signature `updateCompanyInfo` étendue
- [x] TS component rewrite — platform connection flow + channel CRUD
- [x] HTML template — integration cards + per-platform channel sections
- [x] SCSS — integration card styles, connect form, channel sections
- [ ] Tester le flow complet : connect platform → add channel → save → reload
- [ ] Vérifier que les channels sauvegardées apparaissent dans le node-settings-popover (communication dropdown)

### Org Chart — Edit mode
- [x] Boutons + Member / + Team directement sur les node cards (sans expand)
- [x] Add-member-popover (mode contract + mode guest)
- [x] Node-settings-popover (couleur, communications)
- [x] Création de nodes (root + child)
- [ ] Suppression de node (pas d'endpoint backend ni UI)
- [ ] Drag & drop pour réorganiser les nodes (move parent)
- [ ] Renommer un node inline (hors popover settings)

### Org Chart — Bug fixes
- [x] Fix `localeCompare` null crash dans `GetCompanyOrgChartQuery`
- [ ] Vérifier que les nodes sans nom ne cassent plus le rendu

---

## Backend — À faire

### Permissions
- [x] `PermissionResolver` service (contract-level + team hierarchy)
- [x] `UpdateCompanyInfoCommand` — vérifie `company:settings:write`
- [ ] Ajouter les guards de permissions sur les autres endpoints :
  - [ ] `CreateOrgNodeCommand`
  - [ ] `UpdateOrgNodeInfoCommand`
  - [ ] `AddOrgNodeMemberCommand` / `RemoveOrgNodeMemberCommand`
  - [ ] `AddGuestMemberCommand` / `RemoveGuestMemberCommand`
  - [ ] Contract CRUD (create, update, assign/remove role)
- [ ] Endpoint dédié pour supprimer un org node (`DeleteOrgNodeCommand`)

### Contracts
- [x] CRUD contract (create, update, get by id, get by company)
- [x] Assign / remove contract roles
- [ ] Workflow de signature (UI prête, pas de backend)
- [ ] Validation des dates (startDate < endDate, pas de chevauchement)

### Company integrations
- [x] Sauvegarde via `updateCompanyInfo` (integrations + channels dans le doc company)
- [ ] Vérification de connexion réelle (webhook ping, OAuth flow) — pas MVP

---

## Frontend — À faire

### Company Settings
- [x] Tab Infos (name, description, address)
- [x] Tab Hierarchy Labels (orgLayers)
- [x] Tab Channels (integration-first flow)
- [x] Tab Settings (status, ID, danger zone delete)
- [ ] Feedback visuel après save (toast / animation)
- [ ] Gestion d'erreur sur les saves

### Company Detail Page
- [x] Org chart tree visualization
- [x] Edit mode toggle
- [x] Contracts tab
- [x] Node expansion avec membres + guests
- [x] Communication channels display sur les nodes
- [ ] Loading states pendant les opérations async
- [ ] Confirmation dialog avant suppression de membre/guest
- [ ] Empty state amélioré quand pas de nodes

### Contract Detail Page
- [x] Vue détaillée (rôles, dates, compensation, temps de travail)
- [x] Edit mode avec formulaire complet
- [x] Assign/remove roles
- [ ] Signature workflow UI
- [ ] Historique des modifications

### Company List Page
- [x] Grid de cards + création
- [x] Status badges
- [ ] Recherche / filtre sur la liste

---

## Tests

- [ ] Unit tests handlers backend company (Create, Update, Delete company)
- [ ] Unit tests handlers backend org nodes
- [ ] Unit tests handlers backend contracts
- [ ] Unit tests `PermissionResolver`
- [ ] E2E test : créer company → ajouter node → ajouter membre → vérifier org chart

---

## Architecture

### Shared Types
- [x] `TCompanyIntegration`, `TCompanyChannel`, `TIntegrationStatus`
- [x] `TOrgNodeCommunication`, `TCommunicationPlatform`
- [x] `TOrgNodeGuestMember`
- [x] Zod schemas pour validation

### CQRS Migration (company module)
- [x] Migration complète use-cases → command/query handlers
- [x] Suppression des anciens use-cases et factories
- [x] `company-handlers.module.ts` avec tous les handlers enregistrés

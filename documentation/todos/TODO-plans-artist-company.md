# Plans Artist & Company — Refonte du modèle de souscription

> **Status** : Planification  
> **Date** : 2026-04-14  
> **Dépend de** : Register wizard (account_type déjà dans le frontend)

---

## Contexte

Aujourd'hui le système a un seul axe de plans : `plan_free → plan_pro → plan_band → plan_business`. Tous les plans donnent accès aux mêmes domaines (music), avec des quotas croissants.

Problème : le register wizard frontend propose déjà un choix **Artist / Company**, mais le backend ne distingue pas les deux. Un artiste solo et un label de 50 personnes reçoivent le même `plan_free`.

## Playlist = Setlist

Il n'y a pas d'entité Setlist séparée. Une **playlist liée à un slot de programme** devient la setlist de l'artiste pour cet événement. Le flux :

1. L'artiste crée des **playlists** dans sa bibliothèque perso
2. La company crée un **programme** (événement avec des slots horaires)
3. L'artiste est booké sur un slot via son **contrat**
4. L'artiste **lie une playlist** à ce slot → c'est sa setlist pour ce gig

Un seul modèle, un seul quota. La relation `playlist ↔ event_slot` est ce qui donne le contexte "setlist".

---

## Nouveau modèle

Deux familles de plans distinctes, chacune avec ses tiers :

```
Artist Plans:    artist_free → artist_pro → artist_max
Company Plans:   company_free → company_pro → company_business
```

Le type est déterminé au register (`account_type`) et ne change jamais (un artiste ne devient pas une company, il crée un nouveau compte company).

---

## Matrice des fonctionnalités — Artist Plans

| Fonctionnalité | artist_free | artist_pro | artist_max | Shipped |
|---|:---:|:---:|:---:|:---:|
| **Prix (annuel)** | Gratuit | 9,99€/mois | 19,99€/mois | |
| **Prix (mensuel, +25%)** | Gratuit | 12,99€/mois | 24,99€/mois | |
| **MUSIC LIBRARY** | | | | |
| Bibliothèque musicale (lecture) | ✅ | ✅ | ✅ | ✅ |
| Bibliothèque musicale (ajout/édition) | ✅ | ✅ | ✅ | ✅ |
| Suppression de morceaux | ✅ | ✅ | ✅ | ✅ |
| Versions par morceau | 2 | 5 | ∞ | ❌ |
| Playlists (CRUD) | 3 max | ∞ | ∞ | ⚠️ CRUD ok, quota non |
| Liaison playlist → slot programme | ❌ | ✅ | ✅ | ❌ |
| Persona match (suggestion IA) | ❌ | ❌ | ✅ | ⚠️ backend ok, UI non |
| Onglets de recherche (search tabs) | 1 | 10 | ∞ | ⚠️ UI ok, quota non |
| Tabs par onglet | 3 | 5 | ∞ | ⚠️ UI ok, quota non |
| **AUDIO PROCESSING** | | | | |
| Mastering standard (loudnorm) | 3/mois | ∞ | ∞ | ✅ |
| Mastering AI (DeepAFx-ST) | ❌ | 10/mois | 50/mois | ✅ |
| Pitch shift | 3/mois | ∞ | ∞ | ✅ |
| **STORAGE** | | | | |
| Stockage audio (R2) | 500 Mo | 5 Go | 20 Go | ✅ |
| Morceaux en bibliothèque | 50 | ∞ | ∞ | ✅ |
| Uploads audio | 50 | ∞ | ∞ | ✅ |
| **COLLABORATION** | | | | |
| Partage de playlist (lien public) | ❌ | ✅ | ✅ | ❌ |
| Cross-library search (réseau d'amis) | ❌ | ❌ | ✅ | ⚠️ backend ok, réseau non |
| **EXPORT** | | | | |
| Export Rekordbox / USB | ❌ | ✅ | ✅ | ❌ |
| Export PDF setlist | ✅ | ✅ | ✅ | ❌ |

---

## Matrice des fonctionnalités — Company Plans

| Fonctionnalité | company_free | company_pro | company_business | Shipped |
|---|:---:|:---:|:---:|:---:|
| **Prix (annuel)** | Gratuit | 29,99€/mois | 79,99€/mois | |
| **Prix (mensuel, +25%)** | Gratuit | 37,99€/mois | 99,99€/mois | |
| **ORGANISATION** | | | | |
| Organigramme (lecture) | ✅ | ✅ | ✅ | ✅ |
| Organigramme (édition) | ✅ | ✅ | ✅ | ⚠️ partiel |
| Nombre de nœuds organigramme | 20 | ∞ | ∞ | ❌ quota non |
| Contrats (CRUD) | ✅ | ✅ | ✅ | ✅ |
| Nombre de contrats actifs | 10 | 50 | ∞ | ❌ quota non |
| Membres / utilisateurs | 5 | 25 | ∞ | ❌ quota non |
| **GUESTS** | | | | |
| Utilisateurs invités (guest) | 3 | 15 | ∞ | ⚠️ CRUD ok, quota non |
| Activation guest → user | ✅ | ✅ | ✅ | ❌ |
| **EVENTS & PLANNING** | | | | |
| Événements / planning | ❌ | ✅ | ✅ | ⚠️ calendar ok |
| Nombre d'événements actifs | — | 10 | ∞ | ❌ quota non |
| Persona match (IA) | ❌ | ❌ | ✅ | ⚠️ backend ok |
| Calendrier multi-salles | ❌ | ❌ | ✅ | ❌ |
| **MUSIC (via contrats artistes)** | | | | |
| Bibliothèque company (cross-library) | ❌ | ✅ | ✅ | ⚠️ backend ok |
| Playlists company | ❌ | ✅ | ✅ | ❌ |
| Programmation musicale | ❌ | ❌ | ✅ | ❌ |
| **INTÉGRATIONS** | | | | |
| Slack (channels, notifications) | ❌ | ✅ | ✅ | ⚠️ OAuth ok, sync non |
| WhatsApp / Teams (futur) | ❌ | ❌ | ✅ | ❌ |
| **EXPORT** | | | | |
| Export organigramme PDF/SVG | ✅ | ✅ | ✅ | ✅ |
| Export contrats | ❌ | ✅ | ✅ | ❌ |
| **ANALYTICS** | | | | |
| Dashboard basique | ❌ | ✅ | ✅ | ❌ |
| Analytics avancées | ❌ | ❌ | ✅ | ❌ |
| **GROUPE** | | | | |
| Company Group (multi-structures) | ❌ | ❌ | ✅ | ❌ |
| Organigramme partagé inter-company | ❌ | ❌ | ✅ | ❌ |
| Pool d'artistes mutualisé | ❌ | ❌ | ✅ | ❌ |
| Quotas partagés (membres, events) | ❌ | ❌ | ✅ | ❌ |
| Facturation groupe unique | ❌ | ❌ | ✅ | ❌ |
| **BRANDING** | | | | |
| Logo / couleurs company | ❌ | ✅ | ✅ | ❌ |
| Domaine personnalisé (futur) | ❌ | ❌ | ✅ |

---

## Downgrade policy — Freeze, never delete

Quand un artiste perd son accès à un tier supérieur (fin de contrat saisonnier, désabonnement), ses données sont **gelées, jamais supprimées**.

**Principe** : read-only au-dessus du quota, writes bloqués jusqu'à retour sous la limite ou upgrade.

| Ressource | Comportement au downgrade |
|---|---|
| Morceaux (50 → avait 200) | Lecture/écoute/export ok. Ajout bloqué tant que count > 50. Doit supprimer ou upgrader. |
| Playlists (3 → avait 20) | Toutes restent lisibles/jouables. Création bloquée. Édition des existantes autorisée. |
| Versions (2 → avait 10) | Toutes les versions restent. Ajout de version bloqué sur les morceaux qui en ont ≥ 2. |
| Search tabs (1 → avait 15) | Tous restent visibles en lecture. Création bloquée. L'utilisateur choisit lequel est "actif". |
| Tabs par onglet (3 → avait ∞) | Tous visibles. Ajout bloqué sur les onglets qui ont ≥ 3 tabs. |
| Storage (500Mo → avait 20Go) | Pas de suppression. Upload bloqué tant que usage > 500Mo. |
| Mastering AI (0 → avait 50/mois) | Feature simplement désactivée. Historique des masters conservé. |

**Implémentation** : le `QuotaService.ensureAllowed()` suffit — il compare `currentUsage >= limit` et retourne HTTP 402. Aucune logique de suppression, aucun cron, aucune migration de données.

**UX** : afficher un bandeau contextuel "Vous avez X morceaux, votre plan en permet Y — [Upgrader] ou [Gérer ma bibliothèque]" sur les actions bloquées.

**Cas company → artist** : quand un contrat saisonnier se termine, le plan de l'artiste retombe à son plan personnel (artist_free par défaut). La company n'a rien à faire — c'est le `PlatformContract` de l'artiste qui détermine ses droits, pas le contrat company.

---

## Company Group — feature business only

Un abonnement `company_business` peut regrouper plusieurs companies sous un même groupe. Cas d'usage : un label qui possède un festival, une agence de booking et un studio.

### Modèle

```
CompanyGroupEntity
  ├── id: TCompanyGroupId (prefix: companyGroup_)
  ├── name: string
  ├── owner_id: TUserId (l'admin qui a créé le groupe)
  ├── company_ids: TCompanyId[] (les companies membres)
  ├── billing_company_id: TCompanyId (facture unique)
  └── status: 'active' | 'suspended'
```

### Ressources mutualisées

| Ressource | Sans groupe | Avec groupe |
|---|---|---|
| Membres / utilisateurs | Par company | Pool partagé entre toutes les companies |
| Événements actifs | Par company | Pool partagé |
| Contrats artistes | Par company | Un artiste booké par le label est visible par le festival |
| Organigramme | Par company | Vue inter-company avec navigation entre structures |
| Quotas | Appliqués par company | Appliqués au niveau groupe |
| Facturation | Un abo par company | Un seul abo business pour le groupe |

### Contraintes

- Seule la company qui porte l'abo `company_business` peut créer un groupe
- Les companies ajoutées au groupe n'ont pas besoin de leur propre abo (l'abo business couvre le groupe)
- Un artiste lié à une company du groupe est **visible** par les autres companies mais **géré** uniquement par sa company d'origine
- Retirer une company du groupe → elle retombe sur `company_free`, freeze policy s'applique

### Impact sur le QuotaService

Le `QuotaService` devra résoudre le scope :
1. Si la company appartient à un groupe → chercher les quotas au niveau `CompanyGroup`
2. Sinon → quotas au niveau `Company` (comportement actuel)

Cela implique un `CompanyGroupRepository` et une modification du `QuotaService.resolveScope()`.

---

## Impact technique

### 1. shared-types — `TPlatformRole`

```typescript
// Avant
type TPlatformRole = 'plan_free' | 'plan_pro' | 'plan_band' | 'plan_business';

// Après
type TArtistPlan = 'artist_free' | 'artist_pro' | 'artist_max';
type TCompanyPlan = 'company_free' | 'company_pro' | 'company_business';
type TPlatformRole = TArtistPlan | TCompanyPlan;
```

### 2. shared-types — `PLATFORM_ROLE_TEMPLATES`

Adapter les permissions par plan. Les company plans ont accès au domaine `company:*` et `event:*`, les artist plans non.

### 3. QuotaLimits — `PLAN_QUOTAS`

Deux grilles de quotas séparées. Les artist plans ont des quotas music, les company plans ont des quotas org/events/members.

Nouvelles ressources quota :
- `playlist` — playlists créées (artist_free: 3)
- `track_version` — versions par morceau (artist_free: 2, artist_pro: 5)
- `search_tab` — onglets de recherche sauvegardés (artist_free: 1, artist_pro: 10)
- `org_node` — nœuds d'organigramme
- `active_contract` — contrats actifs
- `company_member` — membres
- `guest_user` — invités
- `active_event` — événements actifs

### 4. RegisterUserCommand

```typescript
// DTO étendu
type TRegisterUserRequestDTO = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  account_type: 'artist' | 'company';
  company_name?: string; // requis si account_type === 'company'
};

// Handler
if (account_type === 'artist') {
  PlatformContractEntity.create(userId, 'artist_free');
} else {
  PlatformContractEntity.create(userId, 'company_free');
  CompanyEntity.create({ name: company_name, owner_id: userId });
  ContractEntity.create({ user_id: userId, company_id, role: 'owner' });
}
```

### 5. PlatformContractEntity

Ajouter un champ `account_type: 'artist' | 'company'` pour distinguer les deux familles au niveau domaine (empêcher un `changePlan('company_pro')` sur un contrat artist).

### 6. Frontend — Upgrade panel

Le panneau d'upgrade doit afficher les plans de la bonne famille selon le `account_type` du user.

---

## Migration des données existantes

Tous les `plan_free` existants deviennent `artist_free` (les utilisateurs actuels sont des artistes). Pas de company existante à migrer.

```javascript
db.platform_contracts.updateMany(
  { plan: 'plan_free' },
  { $set: { plan: 'artist_free', account_type: 'artist' } }
);
// Idem pour plan_pro → artist_pro, plan_band → artist_max
// plan_business → à évaluer au cas par cas
```

---

## Ordre d'implémentation

1. **shared-types** — Nouveau `TPlatformRole`, permissions, Zod schemas
2. **QuotaLimits** — Nouvelles grilles + nouvelles ressources
3. **PlatformContractEntity** — Champ `account_type`, validation `changePlan`
4. **RegisterUserCommand** — Accepter `account_type`, création conditionnelle company
5. **Guards** — Vérifier que les company plans ont bien accès aux routes `@ContractScoped`
6. **Frontend** — Upgrade panel par famille, affichage du plan
7. **Migration** — Script pour les données existantes
8. **Tests** — E2E registration artist + company, quotas par plan, upgrade dans la bonne famille

# Usage Tracking, Credit Packs & Event Store

> **Status** : Planification  
> **Date** : 2026-04-14  
> **Dépend de** : Plans artist/company (done), QuotaService (done)

---

## 1. Usage Storage — État actuel

Déjà en place :

- Collection `platform_usage` avec `UsageCounterMongoRepo`
- `QuotaService.ensureAllowed()` / `recordUsage()` / `getUsageSummary()`
- `GET /quota/me` retourne le résumé au frontend
- `PlanUsageComponent` affiche les barres de progression

**Ce qui manque** :

- [x] Brancher `ensureAllowed()` + `recordUsage()` dans tous les handlers music (mastering, pitch-shift, storage, track_version, search_tab)
- [x] `track_version` quota dans `CreateMusicVersionHandler`
- [x] `search_tab` quota dans `SaveMusicTabConfigsHandler` (delta check)
- [ ] Ajouter les handlers pour les nouvelles ressources : `playlist`, `search_tab_items`
- [ ] Décrémentation du compteur `storage_bytes` quand un track est supprimé
- [ ] Frontend : intercepteur 402 global → modal upgrade

---

## 2. Credit Packs (Boosters)

### Concept

Un user peut acheter un pack de crédits pour une ressource sans changer de plan. Les crédits s'ajoutent au-dessus de la limite plan.

```
Quota effectif = plan_limit + purchased_bonus

Exemple : artist_free a 0 AI mastering/mois
  → Achète "10 AI Masters Pack" (4,99€)
  → Quota effectif = 0 + 10 = 10 pour ce mois
```

### Collection `credit_purchases`

```typescript
interface TCreditPurchase {
  id: string; // creditPurchase_xxx
  user_id: TUserId;
  resource: TQuotaResource;
  amount: number; // crédits achetés
  remaining: number; // crédits restants (décrémentés à chaque usage)
  period: "one_time" | "monthly"; // one_time = jamais expire, monthly = expire fin du mois
  period_key: string; // 'permanent' ou 'YYYY-MM'
  purchased_at: Date;
  stripe_payment_id?: string; // référence Stripe pour le reçu
}
```

### Catalogue de packs

```typescript
interface TCreditPack {
  id: string;
  resource: TQuotaResource;
  amount: number;
  price: number; // EUR
  currency: string;
  period: "one_time" | "monthly";
  label: string; // "10 AI Masters"
  description: string;
}

const CREDIT_PACKS: TCreditPack[] = [
  // AI Mastering
  {
    id: "pack_ai_10",
    resource: "master_ai",
    amount: 10,
    price: 4.99,
    currency: "EUR",
    period: "monthly",
    label: "10 AI Masters",
    description: "10 AI mastering credits this month",
  },
  {
    id: "pack_ai_50",
    resource: "master_ai",
    amount: 50,
    price: 19.99,
    currency: "EUR",
    period: "monthly",
    label: "50 AI Masters",
    description: "50 AI mastering credits this month",
  },

  // Storage
  {
    id: "pack_storage_5",
    resource: "storage_bytes",
    amount: 5 * 1024 * 1024 * 1024,
    price: 2.99,
    currency: "EUR",
    period: "one_time",
    label: "+5 GB Storage",
    description: "Permanent storage extension",
  },
  {
    id: "pack_storage_20",
    resource: "storage_bytes",
    amount: 20 * 1024 * 1024 * 1024,
    price: 9.99,
    currency: "EUR",
    period: "one_time",
    label: "+20 GB Storage",
    description: "Permanent storage extension",
  },

  // Repertoire (artist_free only)
  {
    id: "pack_songs_50",
    resource: "repertoire_entry",
    amount: 50,
    price: 3.99,
    currency: "EUR",
    period: "one_time",
    label: "+50 Songs",
    description: "Add 50 slots to your library",
  },
];
```

### Impact sur QuotaService

```typescript
// Avant
async getEffectiveLimit(userId, resource): number {
  return getQuotaLimit(plan, resource)?.limit ?? -1;
}

// Après
async getEffectiveLimit(userId, resource): number {
  const planLimit = getQuotaLimit(plan, resource)?.limit ?? -1;
  if (planLimit === -1) return -1; // unlimited, pas besoin de bonus

  const bonus = await this.creditRepo.getRemainingCredits(userId, resource, currentPeriodKey);
  return planLimit + bonus;
}
```

Le `recordUsage()` doit aussi décrementer les crédits bonus quand le plan limit est dépassé :

```typescript
async recordUsage(userId, resource, amount = 1) {
  // ... increment usage counter (existing)

  // Si usage > plan limit → décrementer les crédits bonus
  const planLimit = getQuotaLimit(plan, resource)?.limit ?? -1;
  if (planLimit >= 0) {
    const currentUsage = await this.usageRepo.getCount(...);
    if (currentUsage > planLimit) {
      await this.creditRepo.decrementCredits(userId, resource, amount);
    }
  }
}
```

### Implémentation

- [x] `TCreditPurchase` type dans shared-types
- [x] `TCreditPack` catalogue dans shared-types (hardcoded comme PLAN_QUOTAS — DB plus tard)
- [x] `TQuotaResource` migré vers shared-types (source unique backend + frontend)
- [x] `CreditPurchaseMongoRepo` — CRUD + `getRemainingCredits()` + `decrementCredits()`
- [x] Modifier `QuotaService.ensureAllowed()` pour intégrer les bonus (effective limit = plan + credits)
- [x] Modifier `QuotaService.recordUsage()` pour décrementer les crédits quand au-dessus du plan
- [x] `PurchaseCreditPackCommand` + handler (mock Stripe pour l'instant)
- [x] `GET /quota/packs` — liste les packs disponibles
- [x] `POST /quota/purchase` — acheter un pack (mock Stripe)
- [x] `GET /quota/me` — réponse étendue avec `{ limit, bonus, effective_limit, current }`
- [x] Frontend `PlanUsageComponent` — mis à jour pour afficher bonus + effective_limit
- [ ] Frontend : bouton "Buy more" à côté de chaque barre de progression à 80%+
- [ ] Frontend : modal de sélection de pack avec prix

---

## 3. Event Store — Audit & Analytics

### Architecture

```
┌─────────────────────────────────────────────┐
│               Core DB (MongoDB)             │
│   État courant — source of truth            │
│   platform_contracts, user_credentials,     │
│   platform_usage, credit_purchases          │
│   → Mutée par les Commands (CQRS)           │
└─────────────────────┬───────────────────────┘
                      │ Emit DomainEvent
                      ▼
┌─────────────────────────────────────────────┐
│              NestJS EventBus                │
│   Découplage command → side effects         │
│   UserRegisteredEvent, PlanChangedEvent,    │
│   CreditPurchasedEvent, etc.                │
└─────────────────────┬───────────────────────┘
                      │ EventHandler
                      ▼
┌─────────────────────────────────────────────┐
│           Events Collection (MongoDB)       │
│   Append-only — jamais modifié              │
│   analytics_events                          │
│   → Requêtée par le dashboard analytics     │
└─────────────────────────────────────────────┘
```

### Séparation des responsabilités

|                 | Core DB                        | Events DB                                            |
| --------------- | ------------------------------ | ---------------------------------------------------- |
| **Rôle**        | État courant                   | Historique immuable                                  |
| **Mutation**    | Oui ($set, $inc)               | Non (insert only)                                    |
| **Exemple**     | `contract.plan = "artist_pro"` | `{ event: "plan_changed", from: "free", to: "pro" }` |
| **Query**       | "Quel plan a Hugo ?"           | "Combien d'upgrades en avril ?"                      |
| **Retention**   | Permanent                      | Archivage possible après 2 ans                       |
| **Performance** | Indexé pour le read path chaud | Indexé pour l'agrégation                             |

### Collection `analytics_events`

```typescript
interface TAnalyticsEvent {
  id: string; // event_xxx
  type: TEventType; // enum ci-dessous
  user_id: TUserId;
  timestamp: Date;
  metadata: Record<string, unknown>; // payload spécifique au type
}

type TEventType =
  // Auth
  | "user_registered"
  | "user_login"
  | "user_login_failed"
  | "user_deactivated"
  // Plan
  | "plan_changed"
  | "billing_cycle_changed"
  // Credits
  | "credit_pack_purchased"
  | "credit_used"
  // Music
  | "track_uploaded"
  | "track_analysed"
  | "track_mastered"
  | "track_ai_mastered"
  | "track_pitch_shifted"
  | "repertoire_entry_created"
  // Quota
  | "quota_exceeded"
  | "quota_warning_80pct";
```

### Exemples de metadata par event type

```typescript
// plan_changed
{ from: 'artist_free', to: 'artist_pro', billing_cycle: 'annual', price: 9.99 }

// billing_cycle_changed
{ plan: 'artist_pro', from: 'monthly', to: 'annual', savings: 36 }

// credit_pack_purchased
{ pack_id: 'pack_ai_10', resource: 'master_ai', amount: 10, price: 4.99 }

// quota_exceeded
{ resource: 'master_ai', current: 10, limit: 10, plan: 'artist_pro' }

// track_ai_mastered
{ track_id: 'track_xxx', version_id: 'version_xxx', duration_ms: 4200 }
```

### Flow complet d'un upgrade

```
1. User clique "Upgrade to Pro"
   → POST /platform-contract/change-plan { plan: 'artist_pro', billing_cycle: 'annual' }

2. ChangePlanCommand handler :
   a. Validate plan family match (artist → artist)
   b. Create Stripe checkout session (si pas déjà payé)
   c. On payment success :
      - Update PlatformContract: plan = 'artist_pro' (Core DB — state change)
      - Emit PlanChangedEvent (EventBus)

3. PlanChangedEventHandler :
   - Insert into analytics_events (Events DB — append-only)
   - Send welcome-to-pro email (side effect)
   - Update usage summary cache (side effect)
```

### Implémentation

- [x] `TAnalyticsEvent` type dans shared-types
- [x] `TEventType` enum dans shared-types
- [x] `AnalyticsEventMongoRepo` — insert only (pas d'update/delete)
- [x] `AnalyticsEventService` — `track(type, userId, metadata)` helper
- [ ] Domain events :
  - [x] `PlanChangedEvent` (from, to, billing_cycle, price)
  - [ ] `BillingCycleChangedEvent` (plan, from, to)
  - [ ] `CreditPurchasedEvent` (pack_id, resource, amount, price)
  - [ ] `QuotaExceededEvent` (resource, current, limit, plan)
- [ ] Event handlers :
  - [x] `PlanChangedEventHandler` → persist to analytics_events
  - [ ] `CreditPurchasedEventHandler` → persist to analytics_events
  - [ ] `QuotaExceededEventHandler` → persist to analytics_events
  - [x] Enrichir `UserRegisteredHandler` existant (déjà émet UserRegisteredEvent)
- [x] Brancher un analytics event par ressource quota :
  - [x] `track_uploaded` dans UploadTrackHandler
  - [x] `track_analysed` dans TrackUploadedHandler (raw audio values pour recalcul rétroactif)
  - [x] `track_mastered` dans MasterTrackHandler
  - [x] `track_ai_mastered` dans AiMasterTrackHandler
  - [x] `track_pitch_shifted` dans PitchShiftVersionHandler
  - [x] `repertoire_entry_created` dans CreateRepertoireEntryHandler
  - [ ] `quota_exceeded` dans QuotaService.ensureAllowed() (quand refusé)
  - [ ] `quota_warning_80pct` dans QuotaService.ensureAllowed() (quand usage ≥ 80%)
  - [ ] `user_login` dans LoginHandler
  - [ ] `user_login_failed` dans LoginHandler (mauvais password / locked)
  - [ ] `user_deactivated` dans DeactivateAccountHandler
- [ ] Index compound sur `analytics_events` : `{ type: 1, timestamp: -1 }` + `{ user_id: 1, timestamp: -1 }`
- [x] `GET /analytics/events` — query avec filtres (type, user, date range)
- [ ] Dashboard admin (futur) — agrégations MongoDB sur analytics_events

### Pourquoi MongoDB et pas un service dédié (pour l'instant)

- Même DB = zero latence réseau, même transaction si besoin
- Les events sont insert-only → pas de contention
- MongoDB gère bien l'append workload avec un index TTL optionnel
- Migration vers TimescaleDB/ClickHouse quand le volume justifie (>1M events/mois)
- Le `AnalyticsEventMongoRepo` est derrière une interface → swap transparent

---

## Ordre d'implémentation

### Phase 1 — Event store (fondation) ✅

1. ✅ Types + repo + service dans le backend
2. ✅ Enrichir les events existants (UserRegisteredEvent)
3. ✅ Ajouter PlanChangedEvent

### Phase 2 — Credit packs (backend ✅, frontend partiel)

1. ✅ Types + repo + catalogue dans shared-types
2. ✅ Modifier QuotaService (effective limit + decrement)
3. ✅ Endpoint achat (mock Stripe)
4. Frontend "Buy more" button + modal de sélection

### Phase 3 — Stripe integration

1. Checkout sessions pour upgrades
2. Checkout sessions pour credit packs
3. Webhook handlers (payment success/failure)
4. Portal pour gérer l'abo

### Phase 4 — Analytics dashboard

1. Agrégations MongoDB (revenue, churn, usage trends)
2. Admin UI

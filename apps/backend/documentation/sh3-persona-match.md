# SH3PHERD — Persona Match (AI-powered event programming)

Architecture documentation for the persona match feature — an AI-driven
recommendation engine that takes an event description and proposes the
optimal artist roster + setlist from the company's contracted artists.

---

## The problem

A venue director (La Folie Douce, Nikki Beach, a private event planner)
has 20-50 artists under contract. They need to program a specific event:

> "Soirée privée sunset à Saint-Tropez, clientèle 30-50 ans, ambiance
> lounge puis montée progressive, 4h de musique, 3 passages d'artistes,
> budget 3 artistes max."

Today they do this manually: scroll through a spreadsheet, call each
artist, ask what songs they know, try to mentally match BPM/key/energy
curves to the vibe. Hours of work for each event.

## The solution

The user describes the event as free text (the "persona"). An AI agent
analyzes the description, extracts structured criteria (mood, energy
curve, duration, number of slots), then scores every artist × song
combination against those criteria using the **real analysis data**
(BPM, key, energy rating, mastery rating, loudness) already in the
system.

The result: a recommended lineup with match scores, suggested tracks
per slot, and a timeline that respects the requested energy arc.

---

## Data flow

```
┌──────────────────────────────────────────────────┐
│ User input (free text)                           │
│ "Sunset lounge event, 4h, 3 artist slots,        │
│  clientele 30-50, start chill end energetic"      │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ Step 1: AI Extraction (Claude API)               │
│                                                  │
│ Structured output:                               │
│ {                                                │
│   mood: ['lounge', 'chill', 'groovy'],           │
│   energyCurve: 'ascending',  // or 'peak', 'wave'│
│   durationMinutes: 240,                          │
│   slots: 3,                                      │
│   bpmRange: { min: 90, max: 130 },              │
│   genrePreferences: ['soul-disco', 'jazz', 'pop'],│
│   excludeGenres: ['edm', 'rock'],               │
│   audienceAge: '30-50',                          │
│   context: 'outdoor sunset private event'        │
│ }                                                │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ Step 2: Cross Library Query                      │
│                                                  │
│ Fetch the full cross matrix for the company      │
│ (reuses GetCompanyCrossLibraryQuery)             │
│ → members[], results[] with BPM/key/energy/genre │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ Step 3: Scoring Engine                           │
│                                                  │
│ For each artist × version:                       │
│   - Genre match score (0-1)                      │
│   - BPM fit score (0-1, Gaussian around target)  │
│   - Energy fit score (0-1, per slot position)    │
│   - Mastery score (0-1, from user rating)        │
│   - Key compatibility (circle of fifths)         │
│                                                  │
│ Composite: weighted average → match score 0-100  │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ Step 4: AI Lineup Builder (Claude API)           │
│                                                  │
│ Given the scored matrix + the extracted criteria: │
│ → Select N artists for N slots                   │
│ → Assign tracks to each slot respecting the      │
│   energy curve                                   │
│ → Generate a natural-language explanation         │
│   ("Artist A opens with lounge jazz because...")  │
│ → Return the final lineup + justification        │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ Response to the user                             │
│                                                  │
│ {                                                │
│   lineup: [                                      │
│     { slot: 1, artist, tracks, matchScore, why },│
│     { slot: 2, artist, tracks, matchScore, why },│
│     { slot: 3, artist, tracks, matchScore, why },│
│   ],                                             │
│   overallScore: 87,                              │
│   explanation: "...",                             │
│   alternatives: [...],                           │
│ }                                                │
└──────────────────────────────────────────────────┘
```

---

## Why AI (and not just a scoring algorithm)

The scoring engine (step 3) IS algorithmic — BPM fit, genre match,
energy curve are all computable. But two things require AI:

**1. Free-text extraction (step 1)**

The user describes the event in natural language. Extracting structured
criteria from "sunset lounge pour une clientèle CSP+ de 30-50 ans,
ambiance Côte d'Azur, 4h montée progressive" requires NLU. A form
with 15 dropdowns would work but kills the UX — the beauty of the
feature is that you describe the vibe and the system gets it.

**2. Lineup curation (step 4)**

Choosing which 3 artists out of 20 should play, in which order, with
which songs, respecting the energy arc AND avoiding key clashes between
consecutive tracks — that's a combinatorial optimization with aesthetic
judgment. The scoring engine ranks possibilities; the AI curates the
final lineup and explains why.

The AI also generates a human-readable justification ("Artist A opens
with 'Samba Pa Ti' because it sets a relaxed 95 BPM tone that matches
the sunset window, then transitions to..."). This is what makes the
feature feel magic vs. a spreadsheet.

---

## AI integration: Claude API

### Model choice

- **Claude Haiku** for step 1 (extraction) — fast, cheap, structured
  output. ~0.3s, ~$0.001 per call.
- **Claude Sonnet** for step 4 (lineup curation) — needs reasoning
  about aesthetic choices, energy arcs, artist chemistry. ~2s, ~$0.01
  per call.

Total cost per persona match: **~$0.012** (~1 centime). At 1000
matches/month that's $12. Negligible.

### Prompt design

**Step 1 — Extraction prompt:**
```
You are an event programming assistant. Extract structured criteria
from this event description. Return JSON only.

Event description: "{userInput}"

Return:
{
  "mood": string[],           // e.g. ["lounge", "chill", "groovy"]
  "energyCurve": "ascending" | "descending" | "peak" | "wave" | "flat",
  "durationMinutes": number,
  "slots": number,            // number of artist passages
  "bpmRange": { "min": number, "max": number },
  "genrePreferences": string[],
  "excludeGenres": string[],
  "audienceAge": string,
  "context": string           // freeform summary
}
```

**Step 4 — Lineup prompt:**
```
You are an artistic director for live music events. Given:

1. Event criteria: {extractedCriteria}
2. Available artists and their scored repertoire: {scoredMatrix}

Build the optimal lineup:
- Select {slots} artists from the available roster
- For each slot, assign 3-5 tracks that fit the energy curve position
- Slot 1 = start of event, Slot N = end of event
- Respect the energy curve: {energyCurve}
- Avoid key clashes between consecutive tracks (use circle of fifths)
- Prefer high-mastery songs (mastery >= 3)
- Explain each choice in 1-2 sentences

Return JSON:
{
  "lineup": [
    {
      "slot": number,
      "artistId": string,
      "artistName": string,
      "tracks": [{ "versionId", "title", "bpm", "key", "energy" }],
      "matchScore": number (0-100),
      "reason": string
    }
  ],
  "overallScore": number (0-100),
  "explanation": string
}
```

---

## Scoring engine (step 3) — pure algorithm, no AI

The scoring engine computes a **match score (0-100)** for each
artist × version × slot combination. It runs entirely in the backend
with no external API call.

### Score components

| Component | Weight | How it's computed |
|-----------|--------|-------------------|
| **Genre fit** | 30% | 1.0 if genre is in `genrePreferences`, 0.5 if neutral, 0.0 if in `excludeGenres` |
| **BPM fit** | 20% | Gaussian: `exp(-0.5 * ((bpm - targetBpm) / 15)²)`. Target BPM varies by slot position on the energy curve. |
| **Energy fit** | 25% | Compare version `energy` rating (1-4) to the expected energy level at this slot position on the curve. |
| **Mastery** | 15% | `mastery / 4`. Higher mastery = more confident performance. |
| **Key compatibility** | 10% | Circle of fifths distance to the previous track's key. 0 = same key, 1 = perfect fifth, penalize distant keys. |

### Energy curve targeting

The energy curve maps slot positions to target energy levels:

```
ascending:  slot 1 = 1.5, slot 2 = 2.5, slot 3 = 3.5
descending: slot 1 = 3.5, slot 2 = 2.5, slot 3 = 1.5
peak:       slot 1 = 2.0, slot 2 = 4.0, slot 3 = 2.0
wave:       slot 1 = 3.0, slot 2 = 1.5, slot 3 = 3.5
flat:       all slots = 2.5
```

For each version in a given slot, `energyFit = 1 - abs(version.energy - targetEnergy) / 4`.

### BPM targeting per slot

The target BPM follows the energy curve:

```
ascending: slot 1 = bpmRange.min, slot N = bpmRange.max
descending: slot 1 = bpmRange.max, slot N = bpmRange.min
peak: slot 1 = min, mid = max, slot N = min
```

Linear interpolation between endpoints.

---

## Architecture

```
apps/backend/src/persona-match/
├── domain/
│   ├── PersonaExtractor.ts       — calls Claude Haiku for step 1
│   ├── ScoringEngine.ts          — pure algorithm, computes match scores
│   ├── LineupBuilder.ts          — calls Claude Sonnet for step 4
│   └── PersonaMatch.types.ts     — types for criteria, scores, lineup
├── api/
│   └── persona-match.controller.ts  — POST endpoint
├── PersonaMatchService.ts        — orchestrates the 4 steps
└── persona-match.module.ts
```

### Endpoint

```
POST /api/protected/companies/:id/persona-match
Body: {
  description: string,         // free-text event description
  maxArtists?: number,         // default: 3
  tracksPerSlot?: number,      // default: 4
}

Response: {
  criteria: TExtractedCriteria,
  lineup: TLineupSlot[],
  overallScore: number,
  explanation: string,
  alternatives: TLineupSlot[][],  // 2-3 alternative lineups
}
```

`@ContractScoped()` + `@RequirePermission(P.Company.Members.Read)`
— same scope as the cross library endpoint.

### Dependencies

- `@anthropic-ai/sdk` npm package for Claude API calls
- `ANTHROPIC_API_KEY` env var
- The cross library query (reused internally, not called via HTTP)

---

## Quota integration

Persona match is a premium feature. Quota resources:

```ts
// In QuotaLimits.ts
{ resource: 'persona_match', period: 'monthly', limit: 0 },   // plan_free: not available
{ resource: 'persona_match', period: 'monthly', limit: 5 },   // plan_pro
{ resource: 'persona_match', period: 'monthly', limit: -1 },  // plan_band: unlimited
{ resource: 'persona_match', period: 'monthly', limit: -1 },  // plan_business: unlimited
```

Free users see the feature greyed out with "Upgrade to Pro". Pro users
get 5 matches per month. Band/Business unlimited.

---

## Frontend UX

### Input

A single textarea with a placeholder example:

```
Describe your event...

Example: "Private sunset party at a rooftop in Saint-Tropez.
Audience: 30-50 years old, corporate clients. Duration: 4 hours.
Start with lounge/chill, build up progressively to groovy
disco-funk by the end. 3 artist slots, no EDM or rock."
```

A "Generate lineup" button with a loading state (~3-5s for the
full pipeline).

### Output

A timeline view showing:
1. **Slot cards** — each slot shows the recommended artist, their
   match score (%), the suggested tracks with BPM/key/energy badges
2. **Energy curve visualization** — a small SVG graph showing the
   target curve vs. the actual energy of selected tracks
3. **AI explanation** — the natural-language justification in a
   collapsible section
4. **Alternatives** — "See other options" reveals 2-3 alternative
   lineups with their scores

### Actions

- **Accept lineup** — exports to a playlist / setlist (future)
- **Regenerate** — calls the API again with the same description
  (Claude's non-determinism produces different results)
- **Tweak** — edit the extracted criteria manually, then re-score
  without re-calling Claude for extraction
- **Lock a slot** — "I want Artist A in slot 2, optimize the rest"

---

## Implementation phases

### Phase 1: Scoring engine + basic UI (~2 days)
- [ ] `ScoringEngine.ts` — pure algorithm, no AI
- [ ] Manual criteria input (form, not free text) as a v0
- [ ] Score matrix displayed in a simple table
- [ ] No Claude dependency yet — validates the scoring logic

### Phase 2: Claude extraction + lineup builder (~2 days)
- [ ] Install `@anthropic-ai/sdk`
- [ ] `PersonaExtractor.ts` — Claude Haiku structured output
- [ ] `LineupBuilder.ts` — Claude Sonnet lineup curation
- [ ] `PersonaMatchService.ts` — orchestrates the 4 steps
- [ ] Free-text textarea replaces the manual form
- [ ] Env var `ANTHROPIC_API_KEY`

### Phase 3: Polish + alternatives (~1 day)
- [ ] Generate 2-3 alternative lineups (parallel Claude calls)
- [ ] "Lock a slot" constraint
- [ ] Timeline visualization with energy curve SVG
- [ ] AI explanation section

### Phase 4: Quota + production readiness (~0.5 day)
- [ ] Add `persona_match` to `QuotaLimits.ts`
- [ ] Wire quota check in the handler
- [ ] Rate-limit Claude API calls (max 3 concurrent per company)
- [ ] Cache extraction results (same description → skip step 1)

**Total: ~5.5 days**

---

## Cost analysis

| Component | Per call | At 1000/month |
|-----------|----------|---------------|
| Claude Haiku (extraction) | $0.001 | $1 |
| Claude Sonnet (lineup × 3 alternatives) | $0.03 | $30 |
| Scoring engine (CPU) | ~0 | ~0 |
| Cross library query (MongoDB) | ~0 | ~0 |
| **Total** | **$0.031** | **$31/month** |

At 1000 matches/month, Claude API costs $31. That's covered by ~1
Business subscription (79€/month). The feature pays for itself with
a single B2B customer.

---

## Why this is a killer feature for event venues

1. **Time saved**: 2-3 hours of manual programming → 30 seconds
2. **Better results**: the AI considers BPM transitions, key
   compatibility, and energy arcs that humans overlook
3. **Data-driven**: based on real analysis (not gut feeling) — the
   BPM and key data come from Essentia, not from what the artist
   claims
4. **Repeatable**: save persona descriptions as templates for
   recurring events ("Sunday brunch", "New Year's Eve", "Corporate
   sunset")
5. **Competitive moat**: nobody else has the cross-library data +
   audio analysis + AI curation stack. This is the feature that
   makes SH3PHERD irreplaceable for event venues.

---

## Related docs

- `sh3-music-library.md` — music feature roadmap
- `sh3-quota-service.md` — quota enforcement
- `sh3-platform-contract.md` — SaaS plans

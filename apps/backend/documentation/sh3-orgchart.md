# SH3PHERD — Org Chart

## Overview

The org chart is a hierarchical tree of **org nodes** within a company. Each node represents a structural unit (direction, service, team, sub-team) and can contain members, guest members, and communication channels.

Depth labels come from `company.orgLayers[]` (e.g. `["Direction", "Service", "Équipe"]`).

---

## Features

### Node CRUD
- **Create** — inline form with name, color (root only), auto-position among siblings
- **Rename** — via node settings popover
- **Archive** — soft-delete via settings popover (type node name to confirm)
- **Color** — root nodes have a 10-color palette, children inherit

### Hierarchy Management
- **Reorder** — move left/right among siblings (toolbar buttons ← →)
- **Group** — Shift+click multiple siblings → name a new parent → selected nodes become children of the new parent
- **Ungroup** — toolbar button on nodes with children → children move up to the parent level, node is deleted
- **Move to** — toolbar button → modal with tree selector → re-parent node under any valid target (excludes self and descendants)
- **Re-parenting** — also available via settings popover (parent select dropdown)
- **Position** — `position` field on each node, auto-assigned on creation, persisted on reorder

### Members
- **Add member** — from company contracts (search by name/email) or as guest (display-only)
- **Remove member** — with confirmation in settings popover
- **Team roles** — `director`, `manager`, `member`, `viewer` per membership
- **Job title** — optional free-text field on membership (e.g. "Directeur Artistique", "Ingénieur Son")
- **Guest members** — display-only, no user account, with title and role
- **Leaders display** — directors/managers shown above the node card (avatars + name + role badge), includes guests
- **Descendant avatars** — up to 4 member avatars preview on the card (includes all descendants)

### Communication Channels
- **Link Slack channels** — search existing or create new (public/private)
- **Platform icons** — Slack, WhatsApp, Teams, Discord, Telegram displayed on the card
- **Managed in settings popover** — add/remove channels per node

### UI / Edit Mode
- **Edit mode toggle** — pencil button activates all editing features
- **Floating toolbar** — appears on hover above each node card in edit mode (← → ungroup move settings)
- **Add child button** — dashed button below each node (visible in edit mode, auto-expands on click)
- **Multiselect** — Shift+click to select siblings, group bar appears above the selected row
- **Inline forms** — node creation with name input + color picker (root) or inline input (children)

### Navigation & Visualization
- **Zoom** — zoom in (+) / zoom out (-) / reset (0) buttons in toolbar + keyboard shortcuts
- **Expand all / Collapse all** — buttons in toolbar, auto-centers scroll after action
- **Search** — input in toolbar, searches node names and member names recursively
- **Search mask** — toggle to dim non-matching nodes (opacity 0.15, pointer-events disabled)
- **Search highlight** — matching nodes get accent border + glow
- **Auto-center** — scroll auto-centers horizontally on zoom/expand/collapse actions

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `+` or `=` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom |
| `Shift+click` | Toggle node selection (edit mode) |
| `Escape` | Cancel group / cancel add node |
| `Enter` | Confirm group / confirm add node |

### Org Layers (Settings)
- **Hierarchy labels** — configurable layer names per company (`["Direction", "Service", "Équipe"]`)
- **Reorder** — ↑ ↓ buttons on each layer
- **Insert** — + button between each layer to insert at any position
- **Remove** — × button on each layer (minimum 1)

### Permissions
- **Contract-scoped** — all orgchart endpoints require `@ContractScoped()`
- **Read** — `P.Company.OrgChart.Read` (artist, viewer, admin, owner)
- **Write** — `P.Company.OrgChart.Write` (admin, owner)

---

## API Endpoints

| Method | Route | Permission | Description |
|--------|-------|------------|-------------|
| `GET` | `/companies/:id/orgchart` | `OrgChart.Read` | Full org chart tree |
| `GET` | `/companies/:id/org-nodes` | `OrgChart.Read` | Flat node list |
| `POST` | `/org-nodes` | `OrgChart.Write` | Create a node |
| `POST` | `/org-nodes/group` | `OrgChart.Write` | Group siblings under new parent |
| `POST` | `/org-nodes/ungroup` | `OrgChart.Write` | Ungroup — move children up, delete node |
| `PATCH` | `/org-nodes/reorder` | `OrgChart.Write` | Reorder siblings |
| `PATCH` | `/org-nodes/:nodeId` | `OrgChart.Write` | Update node info (name, color, type, parent, comms) |
| `DELETE` | `/org-nodes/:nodeId` | `OrgChart.Write` | Archive a node |
| `GET` | `/org-nodes/:nodeId/members` | `OrgChart.Read` | Get node members |
| `POST` | `/org-nodes/:nodeId/members` | `OrgChart.Write` | Add member |
| `DELETE` | `/org-nodes/:nodeId/members/:userId` | `OrgChart.Write` | Remove member |
| `POST` | `/org-nodes/:nodeId/guests` | `OrgChart.Write` | Add guest member |
| `DELETE` | `/org-nodes/:nodeId/guests/:guestId` | `OrgChart.Write` | Remove guest member |

---

## Backend Architecture

```
company/
├── domain/
│   ├── CompanyAggregate.ts      — addOrgNode, removeNode, groupNodes, ungroupNode
│   ├── OrgNodeEntity.ts         — rename, setColor, setType, setParent, setPosition, archive, addMember (with job_title), guests
│   ├── CompanyPolicy.ts         — structural rules (depth, siblings, parent validation)
│   └── CompanyEntity.ts         — orgLayers, company info
├── api/
│   ├── orgnode.controller.ts    — CRUD + reorder + group + ungroup
│   ├── orgnode-members.controller.ts — members + guests
│   └── orgchart-views.controller.ts  — GET orgchart + org-nodes
├── application/commands/
│   ├── CreateTeamCommand.ts
│   ├── UpdateOrgNodeInfoCommand.ts (supports parent_id change)
│   ├── ArchiveOrgNodeCommand.ts
│   ├── ReorderOrgNodesCommand.ts
│   ├── GroupOrgNodesCommand.ts
│   ├── UngroupOrgNodeCommand.ts
│   ├── AddTeamMemberCommand.ts
│   ├── RemoveTeamMemberCommand.ts
│   └── GuestMemberCommands.ts
└── repositories/
    ├── CompanyAggregateRepository.ts — load/save aggregate (new + diff + removed)
    └── OrgNodeMongoRepository.ts
```

---

## Frontend Architecture

```
company/
├── orgchart.service.ts          — HTTP calls (scopedHttp.withContract())
├── orgchart.store.ts            — signal-based state + mutations
└── company-detail-page/
    └── orgchart-tab/
        ├── orgchart-tab.component.ts    — edit mode, expand, selection, toolbar, zoom, search, move modal, keyboard shortcuts
        ├── orgchart-tab.component.html  — recursive template, toolbar, group bar, leaders, move modal, search mask
        └── orgchart-tab.component.scss  — depth-based sizing, toolbar, selection, group bar, zoom, search, modal
```

---

## File Locations

| Concern | File |
|---------|------|
| Aggregate (structural ops) | `backend: company/domain/CompanyAggregate.ts` |
| Node entity | `backend: company/domain/OrgNodeEntity.ts` |
| CRUD controller | `backend: company/api/orgnode.controller.ts` |
| Members controller | `backend: company/api/orgnode-members.controller.ts` |
| Views controller | `backend: company/api/orgchart-views.controller.ts` |
| Domain model types | `shared-types: company/orgnode.types.ts` |
| Frontend service | `frontend: features/company/orgchart.service.ts` |
| Frontend store | `frontend: features/company/orgchart.store.ts` |
| Orgchart tab UI | `frontend: features/company/company-detail-page/orgchart-tab/` |
| Node settings popover | `frontend: features/company/popovers/node-settings-popover/` |
| Guest user controller | `backend: user/api/guest-user.controller.ts` |
| Guests settings tab | `frontend: features/company/company-settings-page/guests-tab/` |

---

## Guest ↔ Company relationship

### Data model
- Guests are real users with `is_guest: true` + `password: null` in `user_credentials`
- They have a `user_profile` (first_name, last_name, phone)
- A junction collection `guest_company` links each guest to one or more companies:
  - `{ user_id, company_id, created_at }`
  - A guest can belong to multiple companies (multi-company scenario)

### Flows
1. **Create guest from Settings > Guests tab** — `POST /users/guest` with `company_id` → creates credentials + profile + junction link
2. **Add existing guest to a node** — `POST /org-nodes/:id/members` → handler detects `is_guest: true` and ensures the junction link exists (idempotent)
3. **List guests for a company** — `GET /users/guests?companyId=X` joins `guest_company` against `user_credentials` + `user_profile`
4. **Unlink a guest from a company** — `DELETE /users/guest/:userId/companies/:companyId` (does NOT delete the user, only the link)

### Migration
A migration script (`apps/backend/src/migrations/backfill-guest-company-junction.mjs`) backfills the junction collection from existing org node memberships. Idempotent.

### Future: Guest activation
- Send invite email with JWT activation link
- Guest clicks → sets password → `is_guest: false`, `password` set
- All memberships and history preserved

---

## Roadmap — Innovative Features

Audit date: 2026-04-11. Ordered by ROI (impact / effort / fit with existing arch).

### Tier 1 — High impact, data already in place

#### 1. Timeline Orgchart (dimension temporelle)
- [ ] **Orgchart at date** — date slider on the orgchart tab. Rebuild the tree from `joinedAt`/`leftAt` on memberships + node `created_at`/`archived_at`. Data is already persisted.
- [ ] **Orgchart diff** — compare two dates, highlight in green new nodes/members and in red departures/archives.
- [ ] **Planned memberships** — add `effectiveAt` / `effectiveUntil` on memberships so a future move can be queued (e.g. "Hugo joins Groupe Rock on 2026-05-01"). A cron promotes pending → active at the effective date.
- [ ] **Planned nodes** — same pattern for node creation scheduled in the future.

#### 2. Slack sync bidirectionnelle (finir la boucle commencée dans les intégrations)
- [ ] `MemberJoinedNode` → `conversations.invite` on every linked Slack channel of the node.
- [ ] `MemberLeftNode` / `ContractTerminated` → `conversations.kick`.
- [ ] `OrgNodeRenamed` → `conversations.setTopic` + `setPurpose`.
- [ ] `OrgNodeArchived` → `conversations.archive` (with prior confirmation in UI).
- [ ] Map SH3PHERD `user_id` ↔ Slack `user_id` via email lookup (`users.lookupByEmail`), stored in a dedicated `slack_user_mapping` collection.
- [ ] Graceful skip when user is not in the workspace + error surface in settings.
- [ ] WhatsApp groups counterpart (WhatsApp Cloud API) — same event hooks, target audience is the music industry.

#### 3. Node Blueprints & Vacancy Detection
- [ ] Save an existing node as a **blueprint** (JSON stored in `company.blueprints[]`): structure + required roles (count + job title), no people.
- [ ] "Apply blueprint" action — instantiate the blueprint under a parent node, create children with open positions.
- [ ] **Vacancy view** — compare a node's blueprint to its actual members and list missing slots.
- [ ] Prebuilt system blueprints per sector (label, studio, venue, management).

### Tier 2 — Product differentiators

#### 4. Project Mode for OrgNodes (killer feature for studios / labels)
- [ ] Add `temporality: 'permanent' | 'project'` + `starts_at` / `ends_at` on `OrgNodeEntity`.
- [ ] On creation of a project node: auto-provision linked resources via event bus — Slack channel, shared folder (Drive/Dropbox), calendar, dedicated playlist, budget envelope.
- [ ] Automatic archival when `ends_at` passes (cron job listens for expiring projects).
- [ ] Project card view — separate UI in the orgchart listing active/upcoming/finished projects.
- [ ] Positioning: this turns the orgchart into a **project-ops surface** — differentiator vs BambooHR / Gusto / Pingboard.

#### 5. Budget & cost rollup per node
- [ ] Derive node cost from member contracts (amount × allocation fraction).
- [ ] Rollup parent = Σ children costs.
- [ ] Heatmap mode on the orgchart: colour nodes by cost intensity.
- [ ] Time-window filter (this month, this quarter, lifetime of the project node).
- [ ] Export breakdown CSV per node.

#### 6. Member journey timeline
- [ ] Per-user horizontal timeline of every membership (node × period × role × job_title).
- [ ] Integrate into a "HR profile" panel of the user.
- [ ] PDF export "dossier collaborateur" for annual reviews or litigation.

### Tier 3 — UX polish (high demo value)

#### 7. Advanced Drag & Drop
- [ ] Drag a member avatar from one node to another → emits a transfer command (leftAt on old membership, joinedAt on new).
- [ ] Drag a node onto another to re-parent (backend already supports it via `UpdateOrgNodeInfoCommand`).
- [ ] Multi-drag after Shift+click selection.
- [ ] Drag ghost + drop zones highlighting.

#### 8. Navigation polish
- [ ] **Minimap** — IDE-style miniature of the full orgchart in a corner, click to jump.
- [ ] **Drag-to-pan** — grab the background to move the zoomed viewport.
- [ ] **Keyboard navigation** — arrows between siblings, Tab to expand, Shift+Tab to collapse.
- [ ] **Undo/Redo** stack for last structural ops (move, group, add member, archive).

#### 9. Permissions matrix view
- [ ] Grid of nodes × members × permissions, colour-coded.
- [ ] Filter by permission family (OrgChart, Music, Contracts…).
- [ ] Temporary roles — assign a role with an expiration date ("interim manager for 2 weeks").
- [ ] Delegation — a director can delegate rights to a subordinate for a period.

#### 10. Exports & printables
- [ ] PDF / PNG high-res export of the orgchart (SVG → headless Chrome render).
- [ ] Paginated PDF that splits large charts across pages.
- [ ] Public read-only share link (token-based, revocable) for clients and partners.

### Tier 4 — AI & automation (once the foundation is solid)

#### 11. Auto-suggest structure on onboarding
- [ ] Sector picker at company creation (label, studio, venue, management, events).
- [ ] Claude Haiku prompt → proposes orgLayers + a seed orgchart + blueprints.
- [ ] Editable review step before applying.

#### 12. Org health score
- [ ] Per-node rules: leader missing, manager span of control >10, empty layer, guest without profile data, high turnover.
- [ ] Aggregate into a 0-100 company score.
- [ ] Red badges on node headers, central dashboard "organisation health".
- [ ] Weekly digest posted to the owner's Slack DM.

#### 13. Onboarding checklist generator
- [ ] On `MemberJoinedNode`, generate a checklist based on node type + blueprint: Slack invite, contract signed, manager intro meeting, tool access.
- [ ] Assignee = the new member's manager, due dates relative to join date.
- [ ] Visible in the member journey view and in a dedicated "open checklists" dashboard.

#### 14. Conflict detection
- [ ] Member in too many nodes (load warning).
- [ ] Node with no active leader.
- [ ] Empty org layer in the company hierarchy.
- [ ] Contract end date without successor planned.

### Inter-company collaboration (long-term)
- [ ] **Shared nodes** — a node co-owned by two companies for a co-production.
- [ ] Cross-company permission model (read-only, contribute, admin).
- [ ] External org view — a read-only shareable link scoped to a subtree.

---

### Parallel tracks (not orgchart-specific, tracked elsewhere)
- Guest activation flow (Phase 5-6) — see `TODO-guest-to-user.md`.
- `GetCompanyByIdQuery` counts optimisation via `countDocuments` at scale.
- Unit tests for `IntegrationCredentialsEntity`, `SlackApiService`, `SlackOAuthService`.

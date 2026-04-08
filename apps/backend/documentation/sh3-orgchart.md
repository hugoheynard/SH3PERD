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

## TODO: Guest ↔ Company relationship refacto

### Current state (POC)
- Guests are real users with `is_guest: true` + `password: null` in `user_credentials`
- They have a `user_profile` (first_name, last_name, phone)
- The `GET /users/guests` query returns ALL guests globally (no company scoping)
- The popover "Guests" tab searches org chart members excluding contract holders
- Deduplication by email on creation

### Problem
- No direct link between a guest and a company
- A guest created in Company A settings appears in Company B too
- The popover "Guests" list pulls from org node members, not from the settings guest list

### Proposed refacto
1. **Add `company_id` to guest creation** — store on credentials or create a `guest_company` junction collection
2. **`GET /users/guests?companyId`** scopes by company_id instead of returning all
3. **Popover "Guests" tab** calls the same API as the settings tab (not org node members)
4. **Settings "Guests" tab** is the single source of truth for company guests
5. **When a guest is added to a node** → they're a regular member with a `user_id`
6. **When multi-company** → a guest can belong to multiple companies (junction table)

### Future: Guest activation
- Send invite email with JWT activation link
- Guest clicks → sets password → `is_guest: false`, `password` set
- All memberships and history preserved

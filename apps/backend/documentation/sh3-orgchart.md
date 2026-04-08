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
- **Re-parenting** — change a node's parent via settings popover (select from tree, excludes self and descendants)
- **Position** — `position` field on each node, auto-assigned on creation, persisted on reorder

### Members
- **Add member** — from company contracts (search by name/email) or as guest (display-only)
- **Remove member** — with confirmation in settings popover
- **Team roles** — `director`, `manager`, `member`, `viewer` per membership
- **Guest members** — display-only, no user account, with title and role
- **Leaders display** — directors/managers shown above the node card (avatars + name + role badge)
- **Descendant avatars** — up to 4 member avatars preview on the card (includes all descendants)

### Communication Channels
- **Link Slack channels** — search existing or create new (public/private)
- **Platform icons** — Slack, WhatsApp, Teams, Discord, Telegram displayed on the card
- **Managed in settings popover** — add/remove channels per node

### UI / Edit Mode
- **Edit mode toggle** — pencil button activates all editing features
- **Floating toolbar** — appears on hover above each node card in edit mode (← → ungroup settings)
- **Add child button** — dashed button below each node (visible in edit mode, auto-expands on click)
- **Multiselect** — Shift+click to select siblings, group bar appears above the selected row
- **Inline forms** — node creation with name input + color picker (root) or inline input (children)

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
│   ├── OrgNodeEntity.ts         — rename, setColor, setType, setParent, setPosition, archive, members, guests
│   ├── CompanyPolicy.ts         — structural rules (depth, siblings, parent validation)
│   └── CompanyEntity.ts         — orgLayers, company info
├── api/
│   ├── orgnode.controller.ts    — CRUD + reorder + group + ungroup
│   ├── orgnode-members.controller.ts — members + guests
│   └── orgchart-views.controller.ts  — GET orgchart + org-nodes
├── application/commands/
│   ├── CreateTeamCommand.ts
│   ├── UpdateOrgNodeInfoCommand.ts
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
        ├── orgchart-tab.component.ts    — edit mode, expand, selection, toolbar actions
        ├── orgchart-tab.component.html  — recursive template, toolbar, group bar, leaders
        └── orgchart-tab.component.scss  — depth-based sizing, toolbar, selection, group bar
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

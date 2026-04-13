# SH3PHERD — Monorepo Documentation

Process docs, TODOs, feature roadmaps, and user flows.

> **Convention:** This directory tracks process and planning. For technical architecture docs (auth, CQRS, Swagger, etc.), see [`apps/backend/documentation/`](../apps/backend/documentation/README.md).

---

## TODOs & Roadmaps

| Doc | Status | Description |
|-----|--------|-------------|
| [Tech Debt](todos/TODO-tech-debt.md) | Active | Urgent bugs, architectural debt, functional backlog |
| [Music Features](todos/TODO-music-features.md) | Active | Music library feature roadmap by phase (critical, architecture, post-lock) |
| [Company Features](todos/TODO-company-features.md) | Active | Company module: settings, org chart, contracts, integrations |
| [Guest to User](todos/TODO-guest-to-user.md) | Phase 4 | Guest user activation flow — 6 phases, currently on Phase 4 (Guests tab) |
| [Integrations](todos/TODO-integrations.md) | Active | Slack integration roadmap: channel sync, notifications, new providers |
| [Configurable Tab Bar](todos/TODO-configurable-tab-bar.md) | Active | DnD bug fix, unit tests, component split |
| [Programs](todos/TODO-programs.md) | Backlog | Drag engine refactoring, pointer events migration |
| [Error Management](todos/TODO-error-management.md) | Done | Error class taxonomy refactoring (completed) |

## User Flows

| Doc | Description |
|-----|-------------|
| [Music Library Overview](user-flows/music/00-music-library-overview.md) | Architecture overview: domain model, state shape, CQRS, services |
| [Add Reference to Repertoire](user-flows/music/01-add-reference-to-repertoire.md) | Detailed sequence diagram for adding a reference |

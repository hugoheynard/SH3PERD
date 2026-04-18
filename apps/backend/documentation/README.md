# SH3PHERD Backend — Technical Documentation

Architecture, patterns, and how-to guides for the NestJS backend.

> **Convention:** This directory contains only technical docs. For TODOs, feature roadmaps, and process docs, see [`documentation/`](../../../documentation/README.md).

## Architecture & Patterns

| Doc                                                 | Description                                                                                  |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [Writing a Controller](sh3-writing-a-controller.md) | Complete guide to writing a NestJS controller — scope, permissions, Swagger, CQRS, checklist |
| [Auth System](sh3-auth-system.md)                   | Complete auth architecture: login, tokens, password management, security hardening           |
| [Auth & Contract Context](sh3-auth-and-context.md)  | Request pipeline: `@ContractScoped`, `@PlatformScoped`, `@RequirePermission`, `P` object     |
| [Swagger Usage](sh3-swagger-usage.md)               | Zod-derived DTOs, `apiSuccessDTO`, `apiRequestDTO`, `@ApiModel`, response envelope           |
| [Error Handling](sh3-error-handling.md)             | DomainError, BusinessError, TechnicalError — when to use, response shape, logging            |

## Setup

| Doc                                   | Description                                                                               |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| [Dev Setup](sh3-dev-setup.md)         | RSA key pair generation, JWT config, env variables                                        |
| [Quality Gates](sh3-quality-gates.md) | 3-tier enforcement: pre-commit / pre-push / CI — what each runs, how to extend, debugging |
| [E2E Tests](sh3-e2e-tests.md)         | MongoMemoryServer infrastructure, test builders, entity-based factories                   |

## Platform & Billing

| Doc                                           | Description                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| [Platform Contract](sh3-platform-contract.md) | SaaS subscription model — dual contract architecture (platform vs company)   |
| [Quota Service](sh3-quota-service.md)         | Quota enforcement: `ensureAllowed()` / `recordUsage()`, plan limits per tier |
| [Analytics Events](sh3-analytics-events.md)   | Append-only event store for audit, analytics dashboards, usage tracking      |
| [Mailer](sh3-mailer.md)                       | Template-based transactional email, Resend adapter, dry-run mode             |

## Music

| Doc                                       | Description                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| [Music Library](sh3-music-library.md)     | Full music feature roadmap — 14 features across 4 tiers, current status       |
| [Audio Player](sh3-music-audio-player.md) | wavesurfer.js inline player, waveform peaks pipeline                          |
| [Mastering](sh3-music-mastering.md)       | DeepAFx-ST AI mastering, ffmpeg loudnorm, pitch-shift architecture            |
| [Persona Match](sh3-persona-match.md)     | AI event programming — extraction, cross-library scoring, Claude API curation |

## Company & Org

| Doc                                       | Description                                                                 |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| [Org Chart](sh3-orgchart.md)              | Org chart features, API endpoints, architecture, file locations             |
| [Orgchart Export](sh3-orgchart-export.md) | PDF/SVG export via headless Chromium (Puppeteer)                            |
| [Orgchart Print](sh3-orgchart-print.md)   | Print layer reusing live OrgchartTabComponent for pixel-identical rendering |
| [Contracts](sh3-contracts.md)             | Contract aggregate diagram (contract + addendums)                           |
| [Integrations](sh3-integrations.md)       | Slack OAuth, channel management, architecture, routes                       |

## See also

- [Monorepo documentation](../../../documentation/README.md) — TODOs, feature roadmaps, user flows

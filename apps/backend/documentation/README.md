# SH3PHERD Backend — Documentation Index

## Architecture & Patterns

| Doc | Description |
|-----|-------------|
| [Writing a Controller](sh3-writing-a-controller.md) | Complete guide to writing a NestJS controller — scope, permissions, Swagger, CQRS, checklist |
| [Auth & Contract Context](sh3-auth-and-context.md) | Auth pipeline, `@ContractScoped`, `@RequirePermission`, `P` object, permission registry, wildcard matching |
| [Swagger Usage](sh3-swagger-usage.md) | Zod-derived DTOs, `apiSuccessDTO`, `apiRequestDTO`, `@ApiModel`, response envelope |
| [Error Handling](sh3-error-handling.md) | DomainError, BusinessError, TechnicalError — when to use, response shape, logging |

## Setup

| Doc | Description |
|-----|-------------|
| [Dev Setup](sh3-dev-setup.md) | RSA key pair generation, JWT config, env variables |

## Domain Modules

| Doc | Description |
|-----|-------------|
| [Org Chart](sh3-orgchart.md) | Org chart features, API endpoints, architecture, file locations |
| [Contracts](sh3-contracts.md) | Contract aggregate diagram (contract + addendums) |
| [Calendar](sh3-calendar.md) | Event matrix — manual and CP-generated with OR-Tools |
| [Integrations](sh3-integrations.md) | Slack OAuth, channel management, architecture, routes |
| [Integrations TODO](sh3-integrations-todo.md) | Remaining tasks — channel sync, notifications, new providers |

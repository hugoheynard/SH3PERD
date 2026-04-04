# Integrations Module

Manages external platform integrations (Slack, and later WhatsApp, Teams, Discord, Telegram).

## Architecture

This module is **fully decoupled** from the Company module. It owns its own:
- **Domain entity** (`IntegrationCredentialsEntity`) with DDD invariants
- **Repository** (`IntegrationCredentialsRepository`) backed by the `integration_credentials` MongoDB collection
- **API controllers** for settings CRUD and platform-specific operations
- **Shared types** in `@sh3pherd/shared-types/integrations/`

The only external dependency is `PermissionsModule` for authorization checks.

## Data Model

One document per platform per company in `integration_credentials`:

```
{
  id: "intcred_...",
  company_id: "company_...",
  platform: "slack",
  status: "connected" | "not_connected",
  config: { bot_token: "xoxb-...", team_id: "T..." },
  channels: [{ id: "channel_...", name: "design-team", url: "https://..." }],
  connectedAt: Date
}
```

## Disconnect Behavior

Disconnecting an integration clears the credentials (`config`) but **preserves channels**. This allows reconnection without losing the channel configuration.

## Directory Structure

```
integrations/
  api/
    integration-settings.controller.ts  — CRUD for integrations (list, disconnect, add/remove channel)
  domain/
    IntegrationCredentialsEntity.ts     — DDD entity with connect/disconnect/addChannel/removeChannel
  repositories/
    IntegrationCredentialsRepository.ts — MongoDB repository (extends BaseMongoRepository)
  slack/
    slack-oauth.controller.ts           — OAuth flow (authorize URL + callback)
    slack-oauth.service.ts              — OAuth logic (build URL, exchange code, sign/verify state JWT)
    slack-api.service.ts                — Slack Web API client (search channels, create channel)
    slack-channels.controller.ts        — Slack channel operations (search, create)
  integrations.module.ts                — NestJS module registration
  integrations.tokens.ts                — DI tokens
```

## Routes

### Public (under `/api/auth/slack/`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/authorize` | Returns Slack OAuth URL (requires JWT) |
| GET | `/callback` | Slack OAuth callback (public, no JWT) |

### Protected (under `/api/protected/integrations/`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/?companyId=X` | List all integrations for a company |
| DELETE | `/:platform?companyId=X` | Disconnect a platform |
| POST | `/:platform/channels?companyId=X` | Add a channel |
| DELETE | `/:platform/channels/:channelId?companyId=X` | Remove a channel |

### Protected (under `/api/auth/slack/`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/channels/search?companyId=X&q=...` | Search Slack channels |
| POST | `/channels/create` | Create a Slack channel |

## Slack OAuth Flow

1. Frontend calls `GET /authorize?companyId=X` (protected)
2. Backend returns Slack OAuth URL with signed state JWT
3. User authorizes on Slack
4. Slack redirects to `GET /callback?code=...&state=...` (public)
5. Backend verifies state, exchanges code for bot token
6. Upserts `integration_credentials` document
7. Redirects browser to frontend settings page

## Adding a New Provider

1. Create `integrations/{provider}/` directory
2. Implement OAuth service + controller (if applicable)
3. Implement API service for provider-specific operations
4. Register controllers and services in `integrations.module.ts`
5. Add scopes and types in shared-types

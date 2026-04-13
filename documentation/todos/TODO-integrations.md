# Integrations Module — Status

## Done

### Infrastructure
- [x] `integration_credentials` collection with dedicated domain model
- [x] `IntegrationCredentialsEntity` — DDD entity with connect/disconnect/addChannel/removeChannel
- [x] `IntegrationCredentialsRepository` extending BaseMongoRepository
- [x] Registered in CoreRepositoriesModule with DI token
- [x] Fully decoupled from Company module (no imports from company)
- [x] Shared types in `@sh3pherd/shared-types/integrations/`
- [x] `TIntegrationViewModel` hides sensitive config from frontend

### Slack OAuth
- [x] OAuth 2.0 flow (authorize + callback)
- [x] State JWT signed with SLACK_CLIENT_SECRET (HS256, 10min expiry)
- [x] Bot token + team_id stored in credentials document
- [x] Upsert on reconnection (preserves channels)
- [x] ngrok setup for local HTTPS redirect

### Slack API
- [x] `SlackApiService` — search channels (conversations.list) + create channel (conversations.create)
- [x] Channel name normalization (lowercase, hyphens, strip special chars)
- [x] Fallback on `name_taken` — returns existing channel instead of error
- [x] Deep-link URLs using `slack.com/app_redirect`

### Slack Scopes
- [x] channels:read, channels:manage, groups:read, groups:write
- [x] chat:write, users:read, files:write

### Settings API
- [x] GET integrations list (hides sensitive config)
- [x] DELETE disconnect (preserves channels for reconnection)
- [x] POST add channel to integration
- [x] DELETE remove channel from integration

### Frontend
- [x] Channels tab loads integrations from dedicated endpoint (not company store)
- [x] OAuth flow trigger from "Connect Slack" button
- [x] Return handling (query param `?slack=connected`)
- [x] Node settings popover — autocomplete channel search with debounce
- [x] Node settings popover — create channel with public/private toggle
- [x] Coming soon badge + greyed out for non-Slack platforms

### Cleanup
- [x] Removed `integrations[]` and `channels[]` from TCompanyDomainModel
- [x] Removed TCompanyIntegration, TCompanyChannel from shared-types
- [x] Removed 4 old company commands (Connect/Disconnect/AddChannel/RemoveChannel)
- [x] Removed integration/channel methods from CompanyEntity
- [x] Removed integration/channel methods from CompanyStore + CompanyService
- [x] Removed channels-settings.controller from company module

---

## To Do

### Slack — Channel Sync
- [ ] Auto-invite OrgNode members to linked Slack channels when they join a node
- [ ] Auto-kick OrgNode members from linked Slack channels when they leave a node
- [ ] Auto-kick members when their contract terminates (listen to ContractTerminated event)
- [ ] Sync channel topic/purpose with OrgNode name/description

### Slack — Notifications
- [ ] Post message to channel when a member joins/leaves an OrgNode
- [ ] Post message to channel when OrgNode info changes
- [ ] Configurable notification templates per company

### Slack — Channel Management
- [ ] Check if a channel is already linked to another OrgNode before linking (prevent duplicates)
- [ ] Archive Slack channel when OrgNode is archived
- [ ] List Slack channel members vs OrgNode members (diff view)
- [ ] Bulk-sync: reconcile Slack channel membership with OrgNode membership

### Slack — User Mapping
- [ ] Map SH3PHERD user_id to Slack user_id (via users:read + email matching)
- [ ] Store mapping in a dedicated collection or in user profile
- [ ] Handle users not in the Slack workspace (graceful skip)

### Settings UI
- [ ] Show channel count per integration in the settings overview
- [ ] Show Slack workspace name in the connected badge (fetch from auth.test API)
- [ ] Reconnection flow — show preserved channels when reconnecting

### Security
- [ ] Encrypt bot_token at rest in MongoDB (field-level encryption)
- [ ] Rate-limit Slack API calls (respect Slack's rate limits: ~50 req/min)
- [ ] Token rotation support (refresh token flow if Slack enables it)

### New Providers (Future)
- [ ] WhatsApp Business API integration
- [ ] Microsoft Teams integration
- [ ] Discord bot integration
- [ ] Telegram bot integration

### Testing
- [ ] Unit tests for IntegrationCredentialsEntity (invariants, connect/disconnect lifecycle)
- [ ] Unit tests for SlackApiService (mock Slack API responses)
- [ ] Unit tests for SlackOAuthService (state JWT sign/verify)
- [ ] Integration tests for OAuth callback flow
- [ ] Integration tests for channel search/create

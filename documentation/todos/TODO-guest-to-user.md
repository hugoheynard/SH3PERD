# TODO — Guest as lightweight User (approach B)

## Context

Guests are now real users with `is_guest: true` — a user who hasn't activated their account yet. They can be managed as a company-level resource (like contracts) and added to org nodes as regular members.

## Phase 1: Backend — User model changes ✅
- [x] Add `is_guest: boolean` to `TUserCredentialsDomainModel`
- [x] `password: string | null` (null for guests)
- [x] Login rejects guests with no password (`GUEST_NOT_ACTIVATED`)

## Phase 2: Backend — Guest CRUD ✅
- [x] `CreateGuestUserCommand` — creates credentials + profile, deduplication by email
- [x] `POST /users/guest` endpoint

## Phase 3: Frontend — Add member popover (partial) ✅
- [x] Guest mode creates real user via `POST /users/guest`
- [x] "Existing" mode — search across all org members
- [x] Job title field in all modes

## Phase 4: Company Settings — Guests tab ← CURRENT
- [ ] Backend: `GET /users/guests?companyId=X` — list guests who are members of company nodes
- [ ] Backend: `PATCH /users/guest/:userId` — update guest profile
- [ ] Frontend: `GuestsTabComponent` in company settings
- [ ] Frontend: Guest list (name, email, phone) — editable inline or via form
- [ ] Frontend: Create guest button
- [ ] Frontend: Search/filter
- [ ] Popover "Guest" mode: search existing guests + inline create fallback

## Phase 5: Invitation flow (later)
- [ ] Invite token + activation email
- [ ] `POST /auth/activate` — set password → `is_guest: false`

## Phase 6: Communication channels (later)
- [ ] Invite guests to Slack channels
- [ ] WhatsApp/Telegram links from phone

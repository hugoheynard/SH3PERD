# WebStorm Run Configurations

This repo commits its WebStorm run configurations under [`.run/`](../.run/)
so every developer opens the project and gets the same one-click workflows.
No per-machine setup — the configs are version-controlled and show up
automatically in the run/debug dropdown.

## Available configurations

| Config name                   | What it runs                                                                                                                                         | When to use                                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Dev all**                   | `shared-types > dev:watch`, `storage > dev:watch`, `backend > start:dev`, `audio-processor > start:dev`, `frontend-webapp > start` — all in parallel | Full-stack dev loop. Launches every app in watch mode with live rebuild of the shared packages they depend on. |
| **backend > test**            | `pnpm --filter @sh3pherd/backend test` (= `NODE_ENV=test jest --runInBand --forceExit`)                                                              | Run the full backend suite — unit + E2E. Matches CI exactly.                                                   |
| **backend > test:watch**      | `pnpm --filter @sh3pherd/backend test:watch`                                                                                                         | Watch mode for local TDD. Same flags as CI, in `--watch`.                                                      |
| **backend > test (E2E only)** | `pnpm --filter @sh3pherd/backend test src/E2E/`                                                                                                      | Faster feedback when only touching E2E specs.                                                                  |

All four live in [`.run/`](../.run/) and invoke npm scripts from
[`apps/backend/package.json`](../apps/backend/package.json). WebStorm
auto-discovers them on open — no import step.

## Why we commit run configs

WebStorm's ad-hoc "Run 'Tests in …'" (right-click → run) creates a
per-machine Jest launcher that does **not** pass `--runInBand` and does
**not** guarantee `NODE_ENV=test`. Both matter for the backend test
suite:

- The test script in [`apps/backend/package.json:19`](../apps/backend/package.json)
  prefixes `NODE_ENV=test` so [`loadEnv`](../apps/backend/src/appBootstrap/config/loadEnv.ts)
  takes its test-mode branch (see `override: !isTest` rule in
  [`sh3-e2e-tests.md`](../apps/backend/documentation/sh3-e2e-tests.md)).
  Without it, a developer's `.env.app` can silently override the
  in-memory Mongo URI seeded by the jest globalSetup.
- `--runInBand` forces every spec to share the single MongoMemoryReplSet
  that [`global-setup.ts`](../apps/backend/src/E2E/global-setup.ts) boots.
  Parallel workers race on `resetAllCollections()` and produce
  sporadic 404 / `MongoDB failed` errors (see "Serial execution" in
  [`sh3-e2e-tests.md`](../apps/backend/documentation/sh3-e2e-tests.md)).

Committing the run configs means every developer clicks one button and
gets CI-equivalent behavior, no env fiddling, no flaky runs.

## Compound configs

**Dev all** is a `CompoundRunConfigurationType` — it references the npm
scripts by name (`shared-types > dev:watch`, `backend > start:dev`, …).
WebStorm auto-generates those child configurations from each workspace
package's `scripts` entry, so the compound config "just works" as long
as the scripts exist. Adding a new app to the dev loop: add its
`start:dev` / `dev:watch` script, then add one `<toRun>` line to
[`.run/Dev all.run.xml`](../.run/Dev%20all.run.xml).

## Adding a new committed run config

Save a run config in WebStorm as usual, then tick **"Store as project
file"** in the configuration dialog. WebStorm writes the XML to
`.run/<Name>.run.xml`. Commit it.

For compound configs (multiple tools at once), hand-edit the XML to
reference existing npm scripts by their auto-generated name — the
format is `<workspace-name> > <script-name>`, with `>` escaped as
`&gt;`.

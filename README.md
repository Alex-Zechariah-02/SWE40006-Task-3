# CareerDeck

Full-stack web application codebase.

Primary stack: Next.js (App Router), React, TypeScript, Tailwind CSS, Prisma, Auth.js (Credentials), Postgres.

## Local setup

```bash
pnpm install
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

Demo login (from `prisma/seed.ts`):

Seeded accounts (from `prisma/seed.ts`):
- `demo@careerdeck.test` / `Demo123!` (canonical demo dataset for screenshots and review)
- `blank@careerdeck.test` / `Blank123!` (empty workspace for uncluttered manual testing)
- `e2e@careerdeck.test` / `E2E123!` (Playwright-only account so E2E runs do not pollute the demo dataset)

## Environment variables

Local development uses a Postgres `DATABASE_URL` and a Linkup `LINKUP_API_KEY`.

1. Copy `.env.local.example` to `.env.local`.
2. Replace the placeholder credentials with your local Postgres values and a valid Linkup API key.

Example:

```text
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/careerdeck_dev?schema=public"
```

If your local Postgres user does not have permission to create databases, `prisma migrate dev` may fail with a shadow database error. For day-to-day local setup you can use `pnpm prisma:migrate` (deploy-style, no shadow database). For schema iteration (creating new migrations), you will still need `pnpm prisma:migrate:dev`.

- grant your Postgres role `CREATEDB`, or
- create a separate shadow database and set `SHADOW_DATABASE_URL` in `.env.local`

Example:

```text
SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/careerdeck_shadow?schema=public"
```

Authentication also requires `AUTH_SECRET`.

Example:

```text
AUTH_SECRET="replace_me_with_a_long_random_value"
```

If you see `UntrustedHost` errors in the console, set `AUTH_URL` (and optionally `AUTH_TRUST_HOST`) so Auth.js knows which origin to trust.

Example:

```text
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
```

Public search requires `LINKUP_API_KEY` (server-side only).

Example:

```text
LINKUP_API_KEY="replace_me_with_your_linkup_api_key"
```

## Tooling

- Node.js: `22.22.0` (pinned via `.nvmrc`)
- Package manager: `pnpm 10.x` (pinned via `packageManager` in `package.json`)

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm verify
```

## E2E Verification (Playwright)

Playwright covers the required end-to-end flows plus additional regression coverage for core routes and entity workflows. The default suite runs cross-browser (`chromium`, `firefox`, `webkit`). Live Linkup coverage is opt-in and does not run in the deterministic default suite.

```bash
pnpm exec playwright install chromium firefox webkit
pnpm build
pnpm test:e2e
```

If your local dev database has accumulated test runs (titles starting with `E2E ` or tagged `e2e`), you can review and remove only the E2E-created records:

```bash
pnpm db:cleanup:e2e:public
pnpm db:cleanup:e2e:public:apply
```

## Manual verification checklist

Before capturing final screenshots (local and Render), verify:

- Auth
  - sign in works
  - logout works
- Public search
  - search returns results
  - preview modal opens and closes via keyboard (`Escape`)
  - saving while logged out redirects to sign in
- Import workflow
  - saved opportunity imports after login
  - imported opportunity appears under `Saved` opportunities
- Manual data entry
  - manual opportunity creation works
  - company creation works
- Private workflows
  - dashboard loads for the demo account
  - opportunity conversion to application works
  - interview creation works
  - action item creation works
  - company detail page renders
  - offer detail renders (when stage is `Offer`)
  - rejection detail renders (when stage is `Rejected`)
- Accessibility
  - modals: keyboard open/close, focus stays inside, `Escape` closes, focus returns to opener
  - icon buttons have accessible labels
  - badges remain readable in both themes (light + dark)
- Render (post-deploy)
  - auto-deploy works after a Git push
  - service deactivation proof is captured

## Versioning

- Commit messages follow Conventional Commits.
- Milestone tags use semantic versions in the form `v0.x.y`.

## Workflow

- Work is delivered in sequential phases.
- Run `pnpm verify` before moving to the next phase.

# CareerDeck

Full-stack web application codebase.

Primary stack: Next.js (App Router), React, TypeScript, Tailwind CSS, Prisma, Auth.js (Credentials), Postgres.

## Local setup

```bash
pnpm install
pnpm dev
```

## Environment variables

Local development uses a Postgres `DATABASE_URL`.

1. Copy `.env.local.example` to `.env.local`.
2. Replace the placeholder credentials with your local Postgres values.

Example:

```text
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/careerdeck_dev?schema=public"
```

Authentication also requires `AUTH_SECRET`.

Example:

```text
AUTH_SECRET="replace_me_with_a_long_random_value"
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

## Versioning

- Commit messages follow Conventional Commits.
- Milestone tags use semantic versions in the form `v0.x.y`.

## Workflow

- Work is delivered in sequential phases.
- Run `pnpm verify` before moving to the next phase.

# CareerDeck

Full-stack web application codebase.

Primary stack: Next.js (App Router), React, TypeScript, Tailwind CSS, Prisma, Auth.js (Credentials), Postgres.

## Local setup

```bash
pnpm install
pnpm dev
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

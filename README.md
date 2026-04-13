# CareerDeck

CareerDeck is a web application for tracking job opportunities and managing an application pipeline. It combines **public discovery** with a **private workspace** for structured tracking.

This repository is the deployment artifact for SWE40006. Deployment Portfolio Task 3.

## Summary

CareerDeck helps you:

- Keep a reliable list of roles you are considering
- Convert saved opportunities into trackable applications
- Capture context over time with notes, tags, contacts, and interview details.
- Track follow-ups with action items that have priority, status, and due dates.

## Key Concepts

- **Opportunity**: a role you found or created manually.
- **Application**: a pipeline record created from an opportunity.
- **Company**: a reusable record referenced by multiple opportunities and applications.
- **Contact**: a person linked to a company and optionally linked to an application.
- **Interview**: a scheduled step linked to an application.
- **Action item**: a follow-up task linked to a company, opportunity, application, or interview.

## Main Flow

1. Search for opportunities in the public search experience.
2. Preview a result and save it.
3. If you are signed out, sign in and resume the import automatically.
4. Review saved opportunities and convert the right ones into applications.
5. Track stages, interviews, action items, and outcomes in the private workspace.

## Features

### Public discovery

- Opportunity search with a preview-first flow
- Save-to-login handoff that redirects to sign in and resumes the import after authentication.
- Result normalization and URL dedupe to reduce repeated listings
- Basic request rate limiting to protect the search endpoint

### Account access

- Credentials sign-in
- Registration
- Private workspace under `/app`

### Private workspace

The private workspace is organized around operational areas.

#### Dashboard

- Next-up section for scheduled work
- Urgent work section for overdue or high-priority items
- Recent activity section for continuity

#### Opportunities

- Saved and shortlisted opportunity stages
- Manual opportunity creation and editing
- Import workflow for saved public results
- Tags and notes for long-term context
- Archive and delete to keep the active queue clean

#### Applications

- Stage-based tracking across Applied, Assessment, Interview, Offer, Rejected, and Withdrawn.
- Outcome-specific details for offers and rejections.
- Tags and notes for tracking over time
- Optional linking of contacts to an application

#### Companies

- Reusable company records shared across opportunities and applications
- Research and notes surfaces
- Linked views for associated opportunities, applications, and contacts

#### Contacts

- Contacts scoped to a company
- Contact profile fields include name, title, email, phone, LinkedIn URL, and notes
- Filter contacts by company

#### Interviews

- Interview scheduling and notes
- Interview types cover common pipelines including screening, technical, final, and offer discussion.

#### Action items

- Priority: High, Medium, Low
- Status: Open, In progress, Completed, Cancelled
- Optional due dates and due windows including overdue, due soon, and no due date.
- Link action items to companies, opportunities, applications, and interviews
- List and grid view modes

#### Filtering and sorting

List screens include filters and sort orders suited for operational use:

- Opportunities: stage, source type, opportunity type, company, tag; sort by newest, deadline, company
- Applications: stage, company, type, priority, tag, archived; sort by newest, deadline, urgency, company
- Action items: status, priority, link type, due window, company, opportunity; sort by newest, due date, priority

### UX and accessibility

- Loading, empty, and error states on primary screens
- Keyboard-friendly modal interactions with Escape to close.
- Light and dark themes

## Demo accounts

The seed dataset includes three accounts for different verification purposes:

- Demo account: `demo@careerdeck.test` / `Demo123!`
- Blank workspace: `blank@careerdeck.test` / `Blank123!`
- E2E account: `e2e@careerdeck.test` / `E2E123!`

## Tech stack

### Runtime and package manager

- Node.js: `22.22.0`
- pnpm: `10.33.0`

### Web framework and UI

- Next.js: `16.2.3` with the App Router.
- React: `19.2.5`
- react-dom: `19.2.5`
- TypeScript: `5.9.3`
- Tailwind CSS: `4.2.2`
- `@tailwindcss/postcss`: `4.2.2`
- Motion: `12.38.0`
- Base UI: `@base-ui/react@1.3.0`
- Icons: `lucide-react@1.7.0`
- Theme persistence: `next-themes@0.4.6`
- Toasts: `sonner@2.0.7`

### Authentication and security

- Auth.js NextAuth: `next-auth@5.0.0-beta.30` with the Credentials provider.
- Password hashing: `bcryptjs@3.0.3`

### Database and ORM

- Prisma ORM: `prisma@7.7.0` and `@prisma/client@7.7.0`
- Postgres driver: `pg@8.20.0`
- Prisma Postgres adapter: `@prisma/adapter-pg@7.7.0`

### Validation and utilities

- Zod: `zod@4.3.6`
- `clsx@2.1.1`
- `class-variance-authority@0.7.1`
- `tailwind-merge@3.5.0`
- `tw-animate-css@1.4.0`

### Testing

- Playwright: `@playwright/test@1.59.1`
- Axe for Playwright: `@axe-core/playwright@4.10.2`

## Directory tree

This is the high-level layout of the repository:

```text
.
├─ .github/           (GitHub Actions workflows)
│  └─ workflows/
│     └─ ci.yml       (CI pipeline)
├─ prisma/            (database schema and seed)
│  ├─ migrations/     (Prisma migrations)
│  ├─ seed/           (seed helpers and fixtures)
│  ├─ schema.prisma   (Prisma schema)
│  └─ seed.ts         (seed entrypoint)
├─ public/            (static assets)
├─ scripts/           (local automation scripts)
├─ src/               (application source)
│  ├─ app/            (Next.js routes and layouts)
│  │  ├─ (public)/    (public pages)
│  │  ├─ (auth)/      (login and registration)
│  │  ├─ (app)/       (authenticated workspace routes)
│  │  └─ api/         (Route Handlers)
│  ├─ components/     (shared UI components)
│  ├─ features/       (feature UI surfaces)
│  ├─ lib/            (shared logic and helpers)
│  └─ types/          (shared types)
├─ tests/             (test suites)
│  └─ e2e/            (Playwright end-to-end tests)
├─ auth.ts            (Auth.js configuration)
├─ package.json       (dependencies and scripts)
└─ README.md          (project overview)
```

## Developer quickstart

### Prerequisites

- Node.js `22.22.0`
- pnpm `10.33.0`
- Postgres database that is reachable locally or remotely.

### Environment

- Create `.env.local` based on `.env.local.example`

### Local run

```bash
pnpm install
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

### Verification

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test:e2e:chromium
```

Notes:

- `LINKUP_API_KEY` is optional. Without it, Linkup live coverage is skipped.

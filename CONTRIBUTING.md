# Contributing to the GDG Nairobi website

Thank you for helping improve the GDG Nairobi website. Contributions should strengthen a clear, useful community resource while preserving the visual direction and editorial controls already in place.

## Before you begin

- Search existing issues and pull requests before starting duplicate work.
- Open an issue or start a discussion before a major redesign, CMS schema change, scraper change, or infrastructure change.
- Keep pull requests focused. Separate unrelated UI, content, CMS, and deployment changes.
- Never commit credentials, production exports, member data, or `.env` files.
- Follow the [GDG Nairobi Code of Conduct](https://github.com/GDGNairobi/.github/blob/main/CODE_OF_CONDUCT.md).

## Local setup

Requirements: Node.js 20.9+ and pnpm 9+.

```bash
cp .env.example .env
pnpm install
pnpm db:up
pnpm migrate
pnpm dev
```

The public site runs at [http://localhost:3000](http://localhost:3000), and Payload runs at [http://localhost:3000/admin](http://localhost:3000/admin).

For design-only work, set `ENABLE_CMS=false`. The public site will use fallback content and does not require PostgreSQL.

## Branches and commits

Create a short-lived branch from `main`. Use a descriptive name such as:

- `feat/community-gallery`
- `fix/mobile-event-cards`
- `docs/cms-workflow`

Use small, focused commits with the existing Conventional Commit style:

```text
feat(cms): add speaker social links
fix(devfest): prevent mobile heading overflow
docs(readme): clarify Payload setup
test(events): cover stale source records
```

Common types are `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, and `chore`.

## Design guardrails

This is a GDG Nairobi website first and a DevFest website second. Changes should preserve that hierarchy.

- Keep the Nairobi sunrise, skyline, National Park, and Big Five concept intact unless a redesign has been agreed in advance.
- Use the Google colour palette deliberately; avoid introducing an unrelated primary colour system.
- Prefer specific, restrained language over slogans, hype, or generic technology and AI copy.
- Treat design changes as surgical improvements. Reuse the established spacing, borders, typography, cards, and motion language.
- Keep animation purposeful and support `prefers-reduced-motion`.
- Test at 320, 390, 768, 1024, and 1440 pixels. Avoid horizontal overflow, clipped controls, text-art collisions, and undersized touch targets.
- Maintain visible keyboard focus, sensible heading order, descriptive labels, image alternatives, and sufficient contrast.
- When consolidating pages, add a permanent redirect for an established URL instead of leaving a 404.

## Content and Payload CMS

Editorial information should be managed in Payload when the GDG Nairobi team may need to change it without a deployment.

- Put site-wide copy and navigation in **Site Settings**.
- Put edition-specific DevFest information in **DevFest Editions**.
- Use the existing collections for speakers, sessions, partners, organizers, announcements, media, and community events.
- Preserve designed fallback content for empty or unavailable CMS values.
- Do not hand-edit `src/payload-types.ts` or the generated Payload import map.
- After changing a collection or global, run:

```bash
pnpm generate:types
pnpm generate:importmap
```

Create and review a Payload migration for database schema or seed-data changes:

```bash
pnpm payload migrate:create
pnpm migrate
```

Migrations must be forward-safe and must not silently delete production content. Seed operations should be idempotent.

### Imported community events

The official GDG Nairobi chapter page is the source of truth for imported event facts. Parser or synchronization changes must:

- validate upstream URLs and data shapes;
- preserve editor-controlled labels, visibility, feature state, and ordering;
- upsert idempotently;
- retain the last good data when the source is unavailable; and
- mark disappeared records as stale instead of deleting them.

Add or update parser tests whenever the importer changes.

## SEO and public routes

For every new indexable page:

- add a unique title and description;
- add a canonical path;
- add the route to `src/app/sitemap.ts` when appropriate;
- keep structured data factual and omit unconfirmed event dates or venues; and
- confirm the page does not inherit a broken social image.

Do not expose Payload admin or API routes to search indexing.

## Validation

Run the checks that match your change. Before requesting review for application code, run the complete set:

```bash
pnpm lint
pnpm generate:types
pnpm exec tsc --noEmit
pnpm test:int
pnpm test:e2e
pnpm build
```

`pnpm test:e2e` starts or reuses the local application and requires a browser environment. Database integration tests are opt-in with `RUN_DATABASE_TESTS=true`.

Documentation-only changes do not require a production build, but links, commands, and formatting should still be checked.

## Pull requests

A pull request should include:

- a concise description of the problem and the chosen change;
- screenshots or a short recording for visible desktop and mobile changes;
- the routes and viewport sizes tested;
- CMS or migration notes when the data model changes;
- SEO, accessibility, or redirect implications; and
- the exact validation commands that passed.

Before requesting review, confirm:

- [ ] The change is scoped and does not replace established design work unintentionally.
- [ ] Public copy is accurate, restrained, and editable in the right place.
- [ ] No secrets or personal data are included.
- [ ] Keyboard and reduced-motion behavior still work.
- [ ] Primary routes remain responsive and free of horizontal overflow.
- [ ] New links and legacy routes do not return unexpected 404s.
- [ ] Required tests, generated types, migrations, and documentation are included.

## Infrastructure changes

Do not apply Railway changes from an unreviewed pull request. For edits to `railway.json`, `.railway/railway.ts`, the Dockerfile, storage, database, or scheduled jobs, include the output of:

```bash
railway config plan
```

Call out destructive actions, variable changes, database migrations, and expected downtime explicitly. Never put Railway or storage secrets into source control.

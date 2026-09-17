# DevFest Nairobi — The Future Grows Here

An animated editorial site for GDG Nairobi's DevFest, shaped around the **Nairobi Urban Biome** concept: a city where ideas, people, and technology grow together.

## What is included

- A responsive, motion-rich public site with a custom Nairobi-inspired visual system
- Dedicated pages for events, speakers, schedule, venue, partners, team, and code of conduct
- Payload CMS collections for editions, speakers, sessions, announcements, partners, team members, media, and community events
- Admin/editor roles, drafts, version history, and scheduled publishing
- A daily Railway cron service that safely imports event facts from the public GDG Nairobi chapter page
- Editorial controls that keep imported source data separate from site-specific labels, ordering, and visibility
- SEO metadata, sitemap, robots rules, reduced-motion support, and responsive navigation

## Local development

Requirements: Node.js 20.9+ and pnpm 9+.

```bash
cp .env.example .env
pnpm install
pnpm db:up
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The visual site works with `ENABLE_CMS=false`, so a database is not required for the design preview.

To use Payload at [http://localhost:3000/admin](http://localhost:3000/admin), the included Docker Compose service provides PostgreSQL on port `5433`:

1. Run `pnpm db:up` and wait for the database to become healthy.
2. Set secure, unique values for `PAYLOAD_SECRET` and `CRON_SECRET`.
3. Run `pnpm dev`.
4. Create the first admin user through Payload's setup screen.

Use `pnpm db:down` to stop the container without deleting its named data volume. The local credentials in `.env.example` are intended only for development.

Railway object storage is optional locally. Set the documented `AWS_*` variables for persisted media uploads.

## Content model

- **DevFest Editions** — lifecycle state, hero copy and artwork, event details, calls to action, ticker, story, tracks, experience format, CFP, community-events intro, closing section, and stats
- **Speakers** — bios, portraits, social links, and edition relationships
- **Sessions** — track, room, level, time, speakers, and recording/slides links
- **Announcements** — timed notices and calls to action
- **Partners** — tier, logo, URL, and display order
- **Team Members** — profiles, roles, and social links
- **Community Events** — read-only imported facts plus editor-controlled visibility, labels, and ordering
- **Site Settings** — current edition, brand labels, navigation, header CTA, social links, footer groups, and SEO defaults

Homepage sections have individual visibility switches. Empty fields and arrays fall back to the designed Nairobi defaults, so editors can publish incrementally without leaving broken gaps on the public site. Imported community-event facts stay source-controlled; editors can change their site visibility, display labels, and order without overwriting the next sync.

## Event synchronization

`GET` or `POST /api/internal/events/sync` refreshes events from the public chapter page at `https://gdg.community.dev/gdg-nairobi/`. The route accepts either:

- Railway cron authorization using `CRON_SECRET`, or
- an authenticated Payload admin session.

The importer parses the chapter page's public pre-rendered event data, validates URLs, upserts idempotently, preserves editorial overrides, and marks disappeared entries as stale without deleting them.

## Validation

```bash
pnpm generate:types
pnpm exec tsc --noEmit
pnpm test:int
pnpm build
```

Database integration tests are opt-in with `RUN_DATABASE_TESTS=true`. Parser tests run without external services.

## Production

The repository is configured for Railway with:

- a containerized Next.js/Payload web service
- PostgreSQL connected through `DATABASE_URL`
- a private Railway Storage Bucket connected through the `AWS_*` variables
- a health check at `/api/health`
- Payload migrations run as a pre-deploy command
- an `event-sync` Railway service scheduled daily at 03:15 Africa/Nairobi time (00:15 UTC)

`railway.json` documents the single-service build and deploy contract requested for compatibility. Railway no longer lets new services opt into that legacy format, so `.railway/railway.ts` is the project-level provisioning source used by the current CLI. It creates and configures the web service, scheduled sync service, PostgreSQL database, volume, and media bucket without storing secret values in Git.

Preview and apply infrastructure changes with:

```bash
railway config plan
railway config apply
```

Railway stops reading legacy `railway.json` files on December 1, 2026; `.railway/railway.ts` is already in place for that transition.

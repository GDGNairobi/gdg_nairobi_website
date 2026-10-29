# GDG Nairobi

The public website and editorial platform for GDG Nairobi. The homepage puts the community's real event photography first, using the Google colour system, restrained motion, and the chapter's year-round community as the main story. DevFest remains the flagship event, not the whole site.

## What is included

- A responsive Next.js 16 website for GDG Nairobi and DevFest Nairobi 2026
- A responsive four-photo community hero with original event photography
- Public pages for the community, events, DevFest, organizers, partners, and code of conduct
- Payload CMS 3 with editor/admin roles, drafts, version history, and scheduled publishing
- PostgreSQL for CMS data and optional S3-compatible storage for uploaded media
- A guarded importer for public event data from the official GDG Nairobi chapter page
- Railway infrastructure-as-code for the web service, database, media bucket, and scheduled event sync
- Canonical metadata, Open Graph and Twitter cards, JSON-LD, sitemap, robots rules, and a web manifest
- Keyboard navigation, reduced-motion support, responsive navigation, and automated viewport checks

## Public routes

| Route | Purpose |
| --- | --- |
| `/` | GDG Nairobi landing page and year-round community overview |
| `/about` | Chapter background, programmes, organizers, sponsors, and partners |
| `/events` | Upcoming events and a past archive grouped by year |
| `/devfest` | Redirect to the featured DevFest event |
| `/events/[slug]` | One event page with its days, venues, programme and media |
| `/code-of-conduct` | Community conduct summary and link to the full policy |
| `/admin` | Payload CMS |

Legacy URLs such as `/speakers`, `/schedule`, `/venue`, `/partners`, and `/team` redirect to the relevant section instead of returning a 404.

## Technology

- Next.js 16 and React 19
- Payload CMS 3
- PostgreSQL 16
- TypeScript
- Playwright and Vitest
- Docker Compose for the local database
- Railway for hosting and scheduled jobs

## Local development

Requirements: Node.js 20.9+ and pnpm 9+.

```bash
cp .env.example .env
pnpm install
pnpm db:up
pnpm migrate
pnpm dev
```

Open the website at [http://localhost:3000](http://localhost:3000) and Payload at [http://localhost:3000/admin](http://localhost:3000/admin). On a new database, Payload redirects `/admin` to `/admin/create-first-user` so you can create the first administrator.

The included Docker Compose service exposes PostgreSQL only on `127.0.0.1:55439` and keeps its data in the `gdg_nairobi_postgres_data` named volume.

```bash
pnpm db:logs
pnpm db:down
```

`db:down` stops the database without deleting its volume. Values in `.env.example` are development defaults only; replace `PAYLOAD_SECRET` and `CRON_SECRET` with unique secrets outside local development.

### Design-only mode

Set `ENABLE_CMS=false` to run the public site without PostgreSQL. The application uses designed community copy and all four bundled hero photographs. Events and event highlights require the CMS, so unavailable data is not replaced with hardcoded event facts.

### Homepage photography

In **Site Settings → Community homepage → Hero**, order up to four Media photos and edit the photo caption. The first photo leads a grid of equal-sized postcards; the built-in selection starts with the wide audience shot. Use landscape photos with descriptive Media alt text; images retain their full content inside 3:2 frames. A published selection replaces the built-in photos, including selections of fewer than four. An empty or unavailable selection uses all four original bundled photographs. Tablet and phone layouts show the photos in two columns below the headline and buttons.

Run `pnpm migrate` before deploying this schema change. The `add_community_hero_photos` migration adds photo rows and the caption to Site Settings and its draft/version tables without changing existing editorial content.

### Media storage

Local media uses Payload's default filesystem behavior. S3-compatible storage is enabled only when all required `AWS_*` variables are present:

- `AWS_ENDPOINT_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`
- `AWS_DEFAULT_REGION`
- `AWS_S3_URL_STYLE`

## CMS content model

- **Site Settings** — GDG Nairobi homepage, navigation, header CTA, social links, footer, and default SEO copy
- **Speakers** — names, bios, portraits, topics, social links, and reusable profiles
- **Sessions** — title, format, track, level, room, time, speakers, slides, and recording links
- **Partners** — chapter or DevFest scope, tier, logo, URL, and display order
- **Team Members** — organizer names, roles, biographies, and social links
- **Events** — one record per edition or event, with registration, featured status, ordered days and venues, programme imports, video highlights and photo albums. The existing API collection slug remains `community-events`.
- **Announcements** — time-bound notices and calls to action
- **Media** — uploaded images and files
- **Users** — authenticated CMS editors and administrators

Empty CMS fields fall back to the designed Nairobi defaults. This lets the team publish confirmed information gradually without creating empty or broken sections. Initial migrations seed the supplied organizer list, chapter partners, and community events.

## Organiser event workflow

1. Open **Community → Events**, create an event and enter its name and edition year. The URL slug is generated; keep it stable after sharing.
2. In **Overview**, add the introduction, cover and registration link. Enable **Feature on the homepage** for the flagship event. Lower display order wins when several events are featured.
3. In **Days & venues**, add each date and its venue, address, website and directions. Days can have different venues.
4. Save the event, then open **Programme**. Download a CSV or Excel template, upload `.csv` or `.xlsx` (first sheet), match columns and preview. No data changes during preview. Dates and times without offsets use Africa/Nairobi (EAT). Select the date format for slash-separated dates.
5. Resolve all row errors. Import as drafts to review first, or choose **Publish event, sessions and linked speaker profiles now**. Draft changes stay private until published. Add video highlights and album links in **Media**, then publish the event.

Uploads support up to 2,000 sessions and 10 MB. Keep `session_id` values stable for repeat uploads: matching IDs update sessions within that event. Without IDs, the importer derives a key from title and start time; changing those values creates a new session. Missing rows never delete sessions. Optional blank fields preserve existing editorial values. Separate speaker names with `|`; imported speakers can be enriched in **Speakers**. Formula cells must be replaced with values before uploading. CSV and Excel are the only programme import options. Column mapping accommodates differing exports; no documented Bevy agenda schema was available to verify a native format.

`/events/[slug]` is the single public detail page. Schedule, speaker and venue aliases follow the featured event with temporary redirects because that destination changes each edition. `/devfest` follows the featured DevFest event. Only published, visible events and sessions appear publicly; the archive uses Nairobi dates and groups past events by year.

### Seed and migration

`pnpm migrate` applies the unified model and seeds the supplied community content, original photos, confirmed 14 November 2026 DevFest date, Sarit venue links and historical highlights. `pnpm seed` reruns the idempotent seed; records already marked with its revision retain organiser edits. No administrator credentials are seeded.

The unified-events migration consolidates the early site's edition model into Events, removes the old DevFest Editions tables and obsolete event fields, and hides duplicate DevFest cards after moving their sessions. It is intended for the approved early-site reset/consolidation. Back up an existing environment before applying it: schema rollback cannot recover removed legacy editorial fields. Review new days and venues before publishing imported programmes. Railway's existing pre-deploy migration command performs the same migration/seed; no Railway reset or deployment is part of local verification.

The local Compose database is `gdg_nairobi_events` on port `55439`; an older database in the same volume is retained. If reusing an existing volume, create the new database explicitly or point `DATABASE_URL` at the existing site database and apply the migration.

## Event synchronization

`GET` or `POST /api/internal/events/sync` refreshes events from [the official GDG Nairobi chapter page](https://gdg.community.dev/gdg-nairobi/). The endpoint accepts either:

- Railway cron authorization using `CRON_SECRET`, or
- an authenticated Payload administrator session.

The importer validates source URLs, upserts records idempotently, preserves editorial overrides, and marks disappeared entries as stale instead of deleting them. The public site retains the last good CMS data if a refresh fails.

## SEO and discovery

The frontend provides:

- Distinct titles, descriptions, keywords, and canonical URLs for each public page
- A generated 1200×630 GDG Nairobi social card at `/social-card`
- Open Graph and Twitter card metadata
- `Organization`, `WebSite`, `ItemList`, and confirmed-event JSON-LD where appropriate
- `/sitemap.xml`, `/robots.txt`, and `/manifest.webmanifest`
- `noindex` headers for `/admin/*` and `/api/*`
- `en-KE` document language and Nairobi-specific search copy

Set `NEXT_PUBLIC_SITE_URL` to the canonical deployed origin. Local development defaults to `http://localhost:3000`; the production fallback is `https://beta.gdgnairobi.com`.

## Validation

```bash
pnpm lint
pnpm generate:types
pnpm exec tsc --noEmit
pnpm test:int
pnpm test:e2e
pnpm build
```

The responsive Playwright suite checks all primary public routes at 320, 390, 768, 1024, and 1440 pixels, including horizontal overflow and compact navigation behavior. Metadata tests also verify the canonical URL and social-card response. Database integration tests are opt-in with `RUN_DATABASE_TESTS=true`; parser tests run without external services.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. It documents the project's design guardrails, CMS and migration workflow, responsive and accessibility expectations, validation commands, and review checklist.

## Railway deployment

The repository is configured for Railway with:

- A containerized Next.js/Payload web service
- PostgreSQL connected through `DATABASE_URL`
- A private Railway Storage Bucket connected through the `AWS_*` variables
- A health check at `/api/health`
- Payload migrations as a pre-deploy command
- An `event-sync` service scheduled daily at 03:15 Africa/Nairobi time (00:15 UTC)

`railway.json` contains the single-service Docker build and deploy contract. [`.railway/railway.ts`](.railway/railway.ts) is the project-level provisioning source for the current Railway CLI and describes the web service, event-sync service, PostgreSQL database, volume, and media bucket without committing secret values.

Preview infrastructure changes before applying them:

```bash
railway config plan
railway config apply
```

Railway stops reading legacy `railway.json` files on December 1, 2026; `.railway/railway.ts` is already present for that transition.

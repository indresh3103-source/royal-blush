# Royal Blush

A premium Indian wedding invitation website with a complete, database-driven admin studio. Royal Blush pairs a
cinematic public invitation with a private studio for managing every detail of the celebration, from family
profiles and events to media, music, theme, section order, and RSVP responses.

The repository is an npm-workspaces monorepo:

- `apps/web` — React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, TanStack Query, Lucide.
- `apps/api` — Node.js, Express, TypeScript, Prisma, PostgreSQL, S3-compatible object storage, Sharp, ExcelJS.

## Live deployment

- Public invitation: <https://royal-blush.onrender.com>
- Admin studio: <https://royal-blush.onrender.com/admin>
- Hosting: Render web service (free plan, Virginia), Neon PostgreSQL, and Neon S3-compatible object storage.

The Render free plan spins the service down after a period of inactivity. The first visit after idle can take
up to a minute while the service wakes; subsequent requests are fast.

## What is included

### Public invitation

- Automatic floral velvet curtain reveal with a Ganesh invocation.
- Hero, bride and groom profiles, family, story timeline, live countdown, events, Vivah Sanskar rituals,
  venue and nearby hotels, gallery, music, RSVP, final blessing, and footer.
- Section visibility and order, theme colors, fonts, curtain style, ornament style, animation intensity, and
  gallery layout all come from the database.
- Event and wedding calendar downloads as real `.ics` files, plus Google Calendar links.
- Timezone-aware countdown and calendar instants using the wedding/event IANA timezone.
- Responsive layout from 360 px to 1440 px, keyboard-friendly controls, skip link, and reduced-motion support.
- Music player with play/pause, previous/next, seek, and volume, using tracks uploaded through the studio.

### Admin studio (`/admin`)

- Dashboard with RSVP and content summaries.
- Wedding details, family members, events, Vivah rituals, story moments, and nearby hotels.
- Media library with image upload/optimization and audio upload/validation.
- Gallery and music management, including ordering and visibility.
- Theme studio, section visibility/order, and invitation settings.
- RSVP responses with search, status/event filters, sorting, pagination, detail view, deletion, and statistics.
- CSV and XLSX exports of the currently filtered responses.
- Account page for changing the administrator password.

### API and infrastructure

- Prisma schema with migrations and a demo seed.
- Session authentication with bcrypt password hashing and HttpOnly cookies.
- Origin checks, an admin request header, rate limiting, Zod validation, and upload validation.
- Persistent S3-compatible storage with a local development fallback.
- Optional SMTP notification when an RSVP is submitted.
- Real `.ics` generation and ExcelJS workbooks.

## Requirements

- Node.js **20.19 or newer** and npm 10 or newer.
- PostgreSQL **15 or newer**, or a Neon project.
- An S3-compatible bucket for production media. Neon Object Storage is supported out of the box. For local
  development, the filesystem fallback is available.
- Optional SMTP credentials for RSVP email notifications.

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the API environment

Copy the example file and edit the values:

```bash
cp .env.example apps/api/.env
```

The API loads `apps/api/.env` when Prisma and npm workspace commands run from `apps/api`. Keep this file out of
version control.

For a local PostgreSQL container:

```bash
docker compose up -d
```

Then use this connection string in `apps/api/.env`:

```env
DATABASE_URL="postgresql://royal_blush:royal_blush_dev@localhost:5432/royal_blush?schema=public"
```

For Neon, paste the project's PostgreSQL connection string instead. Use a direct (non-pooler) connection for
migrations; a long-running API can use either a direct or pooled connection. Add `connect_timeout=15` to the
connection string so a suspended Neon compute has time to wake before Prisma gives up. The API retries transient
connection failures for read queries, but a longer connect timeout avoids most cold-start errors.

Generate the Prisma client and apply the migrations:

```bash
npm run db:generate
npm run db:deploy
```

For local schema changes during development, use `npm run db:migrate` instead of `db:deploy`.

### 3. Seed the demo invitation

```bash
npm run db:seed
```

The seed creates the fictional Aarav & Meera invitation, events, family, story, rituals, hotels, gallery,
media records, music, theme, settings, and sections. It does not create an administrator. The seed exits
without changes if a wedding already exists.

### 4. Run the development servers

```bash
npm run dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`

Vite proxies `/api` and `/uploads` to the API, so the browser uses same-origin requests during development.

### 5. Create the first administrator

Open `http://localhost:5173/admin`. When no administrator exists, the studio redirects to `/admin/setup`.

Enter the `SETUP_TOKEN` from `apps/api/.env`, a name, an email address, and a password of at least 12
characters containing at least one letter and one number. Setup is refused once an administrator exists.

No administrator is seeded intentionally, so a fresh database cannot be accessed with a default password.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `PORT` | No | API port. Defaults to `4000`. |
| `NODE_ENV` | No | `development`, `test`, or `production`. |
| `WEB_ORIGIN` | Yes in practice | Allowed browser origin(s), comma-separated. Example: `https://wedding.example.com`. |
| `PUBLIC_SITE_URL` | Yes in practice | Public invitation URL used in calendar files and shared links. |
| `SETUP_TOKEN` | Yes | One-time first-admin setup token. At least 16 characters. Use a long random value. |
| `SESSION_SECRET` | Yes | Secret used for session and IP hashing. At least 32 characters. |
| `COOKIE_SECURE` | No | Set `true` in production behind HTTPS. |
| `SERVE_WEB` | No | Set `true` to let Express serve the built web app from `apps/web/dist`. |
| `WEB_DIST` | No | Optional absolute or relative path to the web build. Defaults to `apps/web/dist`. |
| `AWS_REGION` | For S3 | Bucket region. |
| `AWS_ENDPOINT_URL_S3` | For S3 | S3 endpoint without the bucket path. |
| `AWS_ACCESS_KEY_ID` | For S3 | Storage access key. |
| `AWS_SECRET_ACCESS_KEY` | For S3 | Storage secret key. |
| `S3_BUCKET` | For S3 | Bucket name. |
| `S3_PUBLIC_URL` | For S3 | Public base URL for uploaded objects, including the bucket path. |
| `ALLOW_LOCAL_STORAGE` | No | `true` writes uploads to `apps/api/uploads` when S3 is not configured. |
| `SMTP_HOST` | No | SMTP host for RSVP notifications. |
| `SMTP_PORT` | No | SMTP port. Defaults to `587`. |
| `SMTP_SECURE` | No | `true` for implicit TLS (usually port 465); `false` for STARTTLS. |
| `SMTP_USER` | No | SMTP username. |
| `SMTP_PASS` | No | SMTP password. |
| `SMTP_FROM` | No | From address, for example `Royal Blush <invites@example.com>`. |

`WEB_ORIGIN` and `PUBLIC_SITE_URL` may contain comma-separated values. Only listed origins are allowed by
CORS and the admin origin check.

## Database workflow

Run Prisma commands from the API workspace so the correct `.env` is loaded:

```bash
npm run db:generate -w @royal-blush/api
npm run db:migrate -w @royal-blush/api
npm run db:deploy -w @royal-blush/api
npm run db:seed -w @royal-blush/api
npm run db:studio -w @royal-blush/api
```

Root shortcuts are also available: `npm run db:generate`, `npm run db:migrate`, `npm run db:deploy`,
`npm run db:seed`, and `npm run db:studio`.

The schema currently models a single wedding, which is the intended product scope. All invitation content is
read from that wedding and its related records.

To reset the demo, remove the wedding row; related records cascade. Then run the seed again. This is
destructive and should never be run against production data.

## Media storage

### Production: S3-compatible storage

Set the six `AWS_*` and `S3_*` values. The API uses path-style addressing and writes immutable, long-cached
objects. Uploaded images are auto-rotated, resized to fit within 2400 × 2400, and converted to WebP. Audio is
validated by magic bytes and extension before storage.

For Neon Object Storage, create a bucket with public read access and an access key, then set:

```env
AWS_REGION=us-east-1
AWS_ENDPOINT_URL_S3=https://<branch-id>.storage.<region>.aws.neon.tech
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
S3_BUCKET=royal-blush-media
S3_PUBLIC_URL=https://<branch-id>.storage.<region>.aws.neon.tech/royal-blush-media
```

`S3_PUBLIC_URL` must be the URL that browsers can read. If the bucket is private, media URLs will not load;
use public read access or a CDN in front of the bucket.

### Development: local fallback

Leave the S3 values empty and set:

```env
ALLOW_LOCAL_STORAGE=true
```

Files are written to `apps/api/uploads` and served at `/uploads`. This is not suitable for ephemeral hosts or
serverless deployments because the filesystem is not persistent.

The seeded demo photographs and music live in `apps/web/public/demo` and are served as static web assets. They
are not stored in S3. Replace them through the studio when preparing a real invitation.

## Email notifications

RSVP submission always succeeds when the database write succeeds. If SMTP is configured and the invitation
settings enable notifications, the API sends a notification to the configured recipient and records whether it
was sent.

Enable this in **Admin → Settings** by setting a notification address and turning on RSVP notifications. Leave
SMTP blank to disable email without affecting RSVP collection.

## RSVP, exports, and calendars

- Public RSVP endpoint: `POST /api/public/rsvp`.
- Admin list: `GET /api/admin/rsvps` with `search`, `status`, `eventId`, `sort`, `page`, and `pageSize`.
- CSV: `GET /api/admin/rsvps/export.csv` with the same filters.
- XLSX: `GET /api/admin/rsvps/export.xlsx` with the same filters.
- Wedding calendar: `GET /api/public/calendar/wedding.ics`.
- Event calendar: `GET /api/public/calendar/event/:id.ics` for visible, non-archived events.
- Google Calendar links are generated in the browser from the same event data.

RSVP submissions include a honeypot field and an idempotency key. Repeating the same key returns the original
result instead of creating a duplicate. The studio's filters apply to exports as well as the on-screen list.

## Theming and section order

The **Theme** page controls colors, heading/body fonts, curtain style, ornament style, animation intensity,
mandala/floral decoration, and gallery layout. The **Sections** page controls visibility and order. Changes are
saved to PostgreSQL and applied by the public site on its next load.

The public components render only data supplied by `/api/public/site`. Wedding names, dates, venues, events,
family, story, media, music, and copy come from the database; the seed is the only place where the demo
couple's details are defined.

## Security notes

- Administrator passwords are hashed with bcrypt at cost 12.
- Sessions use a random token stored as a SHA-256 hash in PostgreSQL. The browser receives an HttpOnly,
  SameSite=Strict cookie with a seven-day lifetime. Set `COOKIE_SECURE=true` behind HTTPS.
- Admin mutations require the `X-Requested-With: RoyalBlushAdmin` header in addition to a valid session.
  The web client sends it automatically.
- Admin requests are origin-checked against `WEB_ORIGIN` and `PUBLIC_SITE_URL`.
- Login attempts are limited to 12 per 15 minutes; setup is limited to 8 per hour; the global API limit is
  900 requests per 15 minutes.
- Request bodies are validated with Zod. Uploads are checked by magic bytes, size, and MIME type.
- Helmet sets security headers. When `SERVE_WEB=true`, a content security policy is enabled for the built app.
- RSVP includes a honeypot and idempotency key. IP addresses are stored only as an HMAC hash.
- There is no public password-reset flow. Keep administrator credentials in a password manager and rotate the
  password from **Admin → Account**. Treat `SETUP_TOKEN` and `SESSION_SECRET` as production secrets.

## Production build and deployment

### Single-service deployment (recommended)

Express can serve both the API and the built web app on one origin, which avoids cross-origin cookies and
extra proxy configuration.

1. Set production environment variables, including:
   ```env
   NODE_ENV=production
   COOKIE_SECURE=true
   SERVE_WEB=true
   WEB_ORIGIN=https://wedding.example.com
   PUBLIC_SITE_URL=https://wedding.example.com
   ```
2. Install, build, and apply migrations:
   ```bash
   npm ci
   npm run build
   npm run db:deploy
   ```
3. Start the API:
   ```bash
   npm start
   ```
4. Terminate HTTPS at a reverse proxy or platform load balancer and forward requests to `PORT` (4000 by
   default). The app trusts one proxy hop.
5. Configure the health check to `GET /api/health`.

`npm run build` builds the API (`prisma generate` + TypeScript) and the web app (`tsc -b` + Vite). The API
serves `apps/web/dist` with a single-page fallback, so `/admin/*` and `/credits` work on refresh.

On Render, use `npm install --include=dev && npm run build` as the build command so TypeScript and type
packages are installed even when `NODE_ENV=production`. Use `npm start` as the start command and
`/api/health` as the health check. If `WEB_ORIGIN` and `PUBLIC_SITE_URL` are not set, both default to
`RENDER_EXTERNAL_URL`, so admin origin checks and calendar links use the public Render URL automatically.

### Split deployment

The web client requests `/api` on its own origin. To host the static build separately, put a reverse proxy in
front of both services so `/api` and `/uploads` reach the API, or adapt `apps/web/src/lib/api.ts` to use an
explicit API base URL. Configure the static host to fall back to `index.html` for client-side routes, and set
`WEB_ORIGIN` and `PUBLIC_SITE_URL` to the web origin.

### Platform checklist

- Node 20.19+ runtime.
- PostgreSQL reachable from the API; run `npm run db:deploy` during release.
- S3 bucket credentials and public media URL configured; do not rely on local disk.
- `COOKIE_SECURE=true` and HTTPS.
- `SETUP_TOKEN` and `SESSION_SECRET` generated with a cryptographically secure random source.
- First admin created at `/admin/setup`, then the setup token rotated or removed from the environment.
- SMTP configured only if RSVP email notifications are wanted.
- Database backups and a restore procedure in place.

## Project structure

```
apps/
  api/
    prisma/            schema, migrations, demo seed
    src/
      routes/          public, auth, and admin endpoints
      app.ts           Express app, security middleware, static web serving
      security.ts      sessions, password hashing, origin and header checks
      storage.ts       S3/local storage, image optimization, audio validation
      validation.ts    Zod request schemas
      ics.ts           calendar generation
  web/
    public/demo/       demo photographs and generated music
    src/
      components/      public invitation sections and decorative SVGs
      admin/           studio layout, providers, and pages
      lib/             API client, theme, calendar, utilities
      pages/           credits and not-found pages
```

## Demo content and credits

The demo wedding is fictional. Demo photographs come from Wikimedia Commons under their respective Creative
Commons licences; see [`CREDITS.md`](CREDITS.md) and the in-app `/credits` page. Replace the photographs,
names, dates, venue, events, story, family, and music before publishing a real invitation.

The ambient track `royal-blush-theme.wav` was generated for this demo and is free of third-party rights.
Interface ornaments, mandalas, and illustrations are original vector artwork.

## Acceptance checklist

- [x] The public invitation renders from PostgreSQL with no hardcoded couple, date, venue, event, or music data.
- [x] Curtain intro opens automatically, floral valance, Ganesh invocation, and reduced-motion behavior are present.
- [x] Hero, profiles, family, story, countdown, events, Vivah, venue, gallery, music, RSVP, and blessing sections render.
- [x] Section visibility and order can be changed in the studio and are reflected on the public site.
- [x] Theme colors, fonts, curtain, ornaments, and animation settings are database-driven.
- [x] The countdown is timezone-correct and uses server time to avoid client clock drift.
- [x] Google Calendar links and real event `.ics` downloads work; hidden or archived events are excluded.
- [x] The wedding `.ics` download works.
- [x] The music player loads database tracks and supports play, pause, seek, volume, and track changes.
- [x] RSVP validates input, resists duplicate submissions, and persists to PostgreSQL.
- [x] RSVP search, filters, sorting, pagination, detail view, statistics, and deletion work.
- [x] CSV export produces a real CSV with the active filters.
- [x] XLSX export produces a real Excel workbook with the active filters.
- [x] Admin setup, login, logout, session status, and password change work.
- [x] Admin CRUD works for wedding, family, events, rituals, story, and hotels.
- [x] Image and audio uploads persist to S3-compatible storage and validate file types.
- [x] Gallery and music CRUD work, including ordering and visibility.
- [x] Theme, settings, and section updates persist.
- [x] Anonymous admin requests are rejected, and mutations require the verification header.
- [x] Login, setup, and global rate limits are configured.
- [x] The public site and admin are usable at 360–1440 px with no horizontal overflow.
- [x] TypeScript typechecks pass and the production build succeeds.
- [x] Setup, deployment, security, storage, export, and credit documentation is included.

## Troubleshooting

### `EPERM ... query_engine-windows.dll.node` during install

On Windows, Prisma cannot replace its query engine while the API process is running. Stop the dev server before
running `npm install`, or use `npm install --ignore-scripts` and run `npm run db:generate` afterwards.

### The seed says the wedding already exists

The seed is intentionally non-destructive. Delete the existing wedding (cascades related records) or use a
fresh database, then run `npm run db:seed` again.

### Prisma cannot find `DATABASE_URL`

Run Prisma commands from `apps/api`, or use the root `db:*` scripts, so `apps/api/.env` is loaded.

### Uploads fail with `STORAGE_NOT_CONFIGURED`

Set the S3 values, or set `ALLOW_LOCAL_STORAGE=true` for local development. Do not use local storage on an
ephemeral production host.

### Admin redirects back to login after signing in

Check that `WEB_ORIGIN` exactly matches the browser origin, that cookies are enabled, and that
`COOKIE_SECURE=true` is used only behind HTTPS. In development, `COOKIE_SECURE=false`.

### Calendar files download but show the wrong time

Verify the wedding timezone and each event timezone are valid IANA zones. The countdown and calendar files use
the configured zone rather than the visitor's local zone.

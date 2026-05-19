# Nikahfix by Nikahan Kita

A premium digital wedding invitation template inspired by cinematic streaming-product patterns: a Netflix-style cover, immersive invitation page, editable admin studio, bulk guest links, WhatsApp message templates, RSVP, guest-book exports, and QR attendance tracking.

This repository is intended as a **master template** for client deployments. All package features are currently unlocked so you can duplicate the project, customize a client event, and later lock features per package from backend configuration.

## Highlights

- Netflix-inspired invitation flow: preloader, profile cover, open invitation animation, cinematic hero, film metadata, story sections, gift section, RSVP, and music playback.
- Admin studio for editing invitation content, couple details, event locations, stories, gallery URLs, bank/gift accounts, guests, and RSVP records.
- Bulk guest-link creation from plain text names.
- Production-style guest URLs: `/{event-slug}/{guest-slug}`.
- WhatsApp invite template with variables: `{guestName}`, `{inviteLink}`, `{coupleName}`.
- Guest book recap with RSVP and check-in status.
- Export guest book to Excel-compatible CSV and PDF.
- QR code per guest for venue check-in.
- QR scanner screen for admin/panitia check-in flow.
- Package configuration for 3 offer tiers:
  - Paket 1: RSVP
  - Paket 2: RSVP + guest-book export
  - Paket 3: RSVP + guest-book export + QR scan

## Tech Stack

- React 19
- Vite
- Lucide React icons
- `qrcode` for guest QR generation
- `html5-qrcode` for browser camera scanning
- `jspdf` and `jspdf-autotable` for PDF export
- Vercel Functions for shared persistence
- Neon Postgres for production storage
- Browser `localStorage` fallback when API/database is not configured

## Local Development

```bash
npm install
npm run dev
```

Open:

- Invitation: `http://127.0.0.1:5173/`
- Admin: `http://127.0.0.1:5173/admin`
- Example guest URL: `http://127.0.0.1:5173/nikahan-kita-nama-pria-nama-wanita/contoh-nama-tamu`

## Build

```bash
npm run build
```

## Vercel Deployment

This project includes `vercel.json` with a rewrite to `index.html` so direct routes keep working on Vercel:

- `/admin`
- `/{event-slug}/{guest-slug}`
- `/checkin/{event-slug}/{qr-token}`

Deploy with Vercel after connecting the GitHub repository.

## Environment Configuration

Create the following variables when the backend is migrated from `localStorage` to Vercel Functions + Neon Postgres:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"
ADMIN_PASSWORD="change-this-before-production"
SESSION_SECRET="replace-with-a-long-random-secret"
VITE_PUBLIC_SITE_URL="https://your-domain.com"
```

Important: in the current template, `DATABASE_URL` is documented but not used yet. The UI is fully functional as a frontend template, but production-shared CRUD still needs backend API routes.

## Current Data Layer Status

The current implementation includes a lightweight Vercel Functions backend at `api/state.js`.

In production, the frontend attempts to read/write shared state through:

```text
GET /api/state
PUT /api/state
```

The API stores the invitation state as JSON in Neon Postgres table `invitation_state`. This is intentionally simple for the first production version and keeps hosting cost low.

That means:

- Admin CRUD can be shared across devices when `DATABASE_URL` is configured.
- Guest RSVP can be shared across devices when `DATABASE_URL` is configured.
- Export and QR check-in flows read from the same state.
- If the API/database is unavailable, the app falls back to browser `localStorage`.

For a larger multi-client SaaS version, normalize the data layer to:

```text
Vercel Static Frontend
        +
Vercel Functions API
        +
Neon Postgres
```

Recommended future normalized tables:

- `events`
- `invitation_settings`
- `guests`
- `rsvps`
- `gift_accounts`
- `check_ins`
- `admin_sessions`

Recommended future API routes:

- `GET /api/invitation`
- `PUT /api/admin/invitation`
- `GET /api/admin/guests`
- `POST /api/admin/guests/bulk`
- `PUT /api/admin/guests/:id`
- `DELETE /api/admin/guests/:id`
- `POST /api/rsvp`
- `PUT /api/rsvp/:id`
- `DELETE /api/rsvp/:id`
- `POST /api/admin/check-in`
- `GET /api/admin/guest-book`

## Neon Postgres Setup

You can connect Neon directly to Vercel without Railway.

1. Create a Neon database.
2. Copy the pooled connection string.
3. In Vercel project settings, add:

```env
DATABASE_URL="postgresql://..."
```

4. Redeploy the Vercel project.
5. Open `/admin`, make one save, and the app will create the `invitation_state` table automatically.

Never commit the real `DATABASE_URL` to GitHub.

## QR Check-in Security Notes

The template generates a unique QR token per guest. For production, the scanner must validate that token on the server before writing attendance.

Minimum production rules:

- QR token must be stored server-side.
- Check-in endpoint must require admin authentication.
- Check-in should be one-time or explicitly marked as duplicate.
- Do not trust frontend-only validation.
- Do not expose admin scanner without a login/session.

## Making This Repository a Template

After pushing to GitHub, enable template mode:

```bash
gh repo edit Eugenewijaya/Nikahfix-by-Nikahan-Kita --template
```

Or enable it from GitHub:

`Settings -> General -> Template repository`

## Production Readiness Checklist

- [x] Vite production build passes.
- [x] Dependency audit passes.
- [x] SPA rewrite is configured for Vercel.
- [x] Admin template screens are available.
- [x] Bulk guest links and WhatsApp template UI are available.
- [x] Guest-book export UI is available.
- [x] QR check-in template flow is available.
- [x] Lightweight backend persistence with Neon Postgres JSON state.
- [ ] Admin authentication.
- [ ] Server-side QR token validation.
- [ ] Server-side package gating per client.
- [ ] Future normalized relational schema for multi-client scale.
- [ ] Optional Vercel Blob integration for uploaded media assets.

## License

Private commercial template for Nikahan Kita / client deployments.

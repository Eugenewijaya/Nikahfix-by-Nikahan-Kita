# Nikahfix by Nikahan Kita

Premium digital wedding invitation template with a cinematic Netflix-inspired guest experience, editable admin studio, RSVP, guest-book exports, QR attendance tracking, and a no-database demo simulator for prospects.

This repository is designed as a master template for client deployments. All package features are currently unlocked so the project can be duplicated, customized, and later gated per client package.

## Highlights

- Cinematic invitation flow: preloader, profile cover, open invitation animation, hero, film metadata, story episodes, memories gallery, gift section, RSVP, wishes wall, and music playback.
- Branded Nikahfix logo and favicon assets served from `public/`.
- Animated scroll experience with section reveal, progress rail, floating wishes, stronger black photo gradients, compact event layout, and closing image treatment.
- Admin studio for editing content, couple profiles, event locations, stories, gallery URLs, bank/gift accounts, guests, RSVP records, package config, and QR scan data.
- Bulk guest link creation from plain text names.
- Production-style guest URLs: `/{event-slug}/{guest-slug}`.
- WhatsApp invite template with variables: `{guestName}`, `{inviteLink}`, `{coupleName}`.
- Guest book recap with RSVP and check-in status.
- Export guest book to Excel-compatible CSV and PDF.
- QR code per guest for venue check-in.
- QR scanner screen for admin or panitia check-in flow.
- `/demo` simulator for prospects: quick detail form, temporary photo upload, generated human-style copy, and live preview without database writes.
- Package tiers prepared for future gating:
  - Paket 1: RSVP
  - Paket 2: RSVP + guest-book export
  - Paket 3: RSVP + guest-book export + QR scan

## Tech Stack

- React 19
- Vite
- Lucide React icons
- Vercel Functions for shared persistence
- Neon Postgres for production storage
- Browser `localStorage` fallback when API/database is unavailable
- `qrcode` for guest QR generation
- `html5-qrcode` for browser camera scanning
- `jspdf` and `jspdf-autotable` for PDF export

## Local Development

```bash
npm install
npm run dev
```

Open:

- Invitation: `http://127.0.0.1:5173/`
- Admin: `http://127.0.0.1:5173/admin`
- Demo simulator: `http://127.0.0.1:5173/demo`
- Example guest URL: `http://127.0.0.1:5173/nikahan-kita-nama-pria-nama-wanita/contoh-nama-tamu`

## Build

```bash
npm run build
```

## Routes

| Page | Route |
| --- | --- |
| Public invitation | `/` |
| Admin dashboard | `/admin` |
| Prospect demo simulator | `/demo` |
| Personalized guest invitation | `/{event-slug}/{guest-slug}` |
| QR check-in landing | `/checkin/{event-slug}/{qr-token}` |

## Vercel Deployment

This project includes `vercel.json` with an SPA rewrite to `index.html`, so direct routes keep working on Vercel:

- `/admin`
- `/demo`
- `/{event-slug}/{guest-slug}`
- `/checkin/{event-slug}/{qr-token}`

Deploy by connecting this GitHub repository to Vercel. Vercel will build with:

```bash
npm run build
```

## Environment Configuration

Do not commit real secrets or database URLs to GitHub. Add these values in Vercel Project Settings instead:

- `DATABASE_URL`: Neon pooled Postgres connection string.
- `ADMIN_USERNAME`: admin login ID. Default template value is `Owner`.
- `ADMIN_PASSWORD`: admin login password. Set this in Vercel for production.
- `SESSION_SECRET`: server token signing secret.
- `VITE_PUBLIC_SITE_URL`: production domain.

The `/demo` route is intentionally local-only in the browser session. It does not call `/api/state` and does not write to Neon.

## Current Data Layer

The current implementation includes lightweight Vercel Functions for shared state, admin auth, and public RSVP writes.

Production persistence flow:

```text
React/Vite frontend
        |
        v
Vercel Functions API
        |
        v
Neon Postgres
```

API routes:

```text
GET /api/state          Public read for invitation rendering
PUT /api/state          Admin-only full CRUD save
POST /api/auth          Admin login
GET /api/auth           Admin session verification
POST /api/rsvp          Public guest RSVP upsert
DELETE /api/rsvp        Public guest RSVP delete
```

The API stores the invitation state as JSON in the `invitation_state` table. This is intentionally simple for the first production version and keeps hosting cost low.

When `DATABASE_URL` is configured:

- Admin CRUD is shared across devices.
- Guest RSVP is shared across devices.
- Guest-book export and QR check-in read from the same state.
- Admin full save requires a valid backend-issued admin token.
- Guest RSVP only writes RSVP fields through `/api/rsvp`; it cannot overwrite full invitation content.

When the API/database is unavailable, the app falls back to browser `localStorage`.

## Neon Postgres Setup

You can connect Neon directly to Vercel without Railway.

1. Create a Neon database.
2. Copy the pooled connection string.
3. Add `DATABASE_URL` as a Production environment variable in Vercel Project Settings.
4. Add `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `SESSION_SECRET` in Vercel Project Settings.
5. Redeploy the Vercel project.
6. Open `/admin`, login, make one save, and the app will create the `invitation_state` table automatically.

## QR Check-in Security Notes

The template generates a unique QR token per guest. For production, the scanner should validate that token on the server before writing attendance.

Minimum production rules:

- QR token must be stored server-side.
- Check-in endpoint must require admin authentication.
- Check-in should be one-time or explicitly marked as duplicate.
- Do not trust frontend-only validation for final production security.
- Do not expose admin scanner without login/session protection.

## Future SaaS Schema

For a larger multi-client SaaS version, normalize the data layer into:

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

## Making This Repository a Template

After pushing to GitHub, enable template mode:

```bash
gh repo edit Eugenewijaya/Nikahfix-by-Nikahan-Kita --template
```

Or enable it manually from GitHub:

```text
Settings -> General -> Template repository
```

## Production Readiness Checklist

- [x] Vite production build passes.
- [x] Dependency audit passes.
- [x] SPA rewrite is configured for Vercel.
- [x] Admin template screens are available.
- [x] `/demo` simulator is available and does not write to database.
- [x] Bulk guest links and WhatsApp template UI are available.
- [x] Guest-book export UI is available.
- [x] QR check-in template flow is available.
- [x] Lightweight backend persistence with Neon Postgres JSON state.
- [x] Backend admin authentication for admin dashboard save.
- [ ] Server-side QR token validation.
- [ ] Server-side package gating per client.
- [ ] Future normalized relational schema for multi-client scale.
- [ ] Optional Vercel Blob integration for uploaded media assets.

## License

Private commercial template for Nikahan Kita and client deployments.

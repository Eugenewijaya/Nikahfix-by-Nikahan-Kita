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
- Browser `localStorage` for the current template data layer

## Local Development

```bash
npm install
npm run dev
```

Open:

- Invitation: `http://127.0.0.1:5173/`
- Admin: `http://127.0.0.1:5173/admin`
- Example guest URL: `http://127.0.0.1:5173/nikahan-kita-gregory-dian/contoh-nama-tamu`

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

The current implementation stores invitation settings, guests, RSVP, and check-in records in `localStorage`.

That means:

- Admin CRUD works in the same browser.
- Guest RSVP works in the same browser storage context.
- Export and QR check-in flows work for template/demo validation.
- Data is not shared across devices yet.
- Data will reset if browser storage is cleared.

For real client production, migrate the data layer to:

```text
Vercel Static Frontend
        +
Vercel Functions API
        +
Neon Postgres
```

Recommended backend tables:

- `events`
- `invitation_settings`
- `guests`
- `rsvps`
- `gift_accounts`
- `check_ins`
- `admin_sessions`

Recommended API routes:

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
- [ ] Backend persistence with Neon Postgres.
- [ ] Admin authentication.
- [ ] Server-side QR token validation.
- [ ] Server-side package gating per client.
- [ ] Optional Vercel Blob integration for uploaded media assets.

## License

Private commercial template for Nikahan Kita / client deployments.

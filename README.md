# ✨ Nikahfix — Premium Digital Wedding Invitation Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Vite-Fast%20Build-purple?style=for-the-badge&logo=vite" />
  <img src="https://img.shields.io/badge/Vercel-Deployment-black?style=for-the-badge&logo=vercel" />
  <img src="https://img.shields.io/badge/Neon-Postgres-00e699?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge" />
</p>

<p align="center">
  <b>Cinematic Digital Wedding Invitation SaaS</b><br/>
  Netflix-inspired invitation experience with admin studio, RSVP, QR attendance, guest management, and export system.
</p>

---

# 🎬 Overview

**Nikahfix by Nikahan Kita** is a premium digital wedding invitation template designed with a modern cinematic experience inspired by streaming-platform UI patterns.

This project is built as a **master deployment template** for wedding invitation services, enabling rapid customization for multiple clients while maintaining scalable SaaS architecture readiness.

The system combines elegant frontend presentation with operational tools such as:

- Guest management
- RSVP handling
- QR attendance tracking
- Bulk invitation generation
- WhatsApp invitation automation
- Exportable guest books
- Admin dashboard management

Perfect for:
- Wedding invitation businesses
- Creative agencies
- Event organizers
- SaaS invitation startups

---

# 🌟 Features

## 🎞 Cinematic Invitation Experience

- Netflix-style landing cover
- Opening invitation animation
- Hero cinematic section
- Music playback support
- Story timeline section
- Couple profile showcase
- Gallery & memories
- Gift & bank account section
- Responsive mobile-first design

---

## 🛠 Admin Studio

Full invitation management dashboard including:

- Couple information
- Event schedules
- Story editing
- Gallery URL management
- Gift account management
- RSVP monitoring
- Guest management
- QR attendance tracking

---

## 👥 Guest Management

- Bulk guest generation from text
- Dynamic guest URLs
- Personalized invitations
- WhatsApp-ready message templates
- RSVP tracking system
- Guest attendance recap

Example URL:

```bash
/{event-slug}/{guest-slug}
```

Example:

```bash
/nikahan-kita-evelyn-adrian/john-doe
```

---

## 📲 WhatsApp Integration

Built-in dynamic invitation template variables:

```text
{guestName}
{inviteLink}
{coupleName}
```

Example output:

```text
Dear John Doe,

You are invited to the wedding of Evelyn & Adrian.

Open Invitation:
https://domain.com/evelyn-adrian/john-doe
```

---

## 📦 Package Tier System

### Paket 1
- RSVP Feature

### Paket 2
- RSVP
- Guest Book Export

### Paket 3
- RSVP
- Guest Book Export
- QR Check-in System

---

# ⚡ Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | Frontend Framework |
| Vite | Build Tool |
| Lucide React | Icon System |
| Vercel Functions | Serverless API |
| Neon Postgres | Cloud Database |
| html5-qrcode | QR Scanner |
| qrcode | QR Generator |
| jsPDF | PDF Export |
| jspdf-autotable | PDF Table Export |

---

# 🏗 Architecture

```text
Frontend (React + Vite)
        │
        ▼
Vercel Functions API
        │
        ▼
Neon PostgreSQL
```

Fallback mode:

```text
Browser localStorage
```

---

# 🚀 Local Development

## Installation

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

---

# 🌐 Routes

| Page | Route |
|---|---|
| Invitation | `/` |
| Admin Dashboard | `/admin` |
| Guest Invitation | `/{event-slug}/{guest-slug}` |
| QR Check-in | `/checkin/{event-slug}/{qr-token}` |

Example:

```bash
http://127.0.0.1:5173/admin
```

---

# 📦 Production Build

```bash
npm run build
```

---

# ☁️ Vercel Deployment

The project already includes:

- SPA Rewrite Configuration
- Dynamic Route Support
- Vercel Function Integration

Supported routes:

```text
/admin
/{event-slug}/{guest-slug}
/checkin/{event-slug}/{qr-token}
```

Deploy directly using:

- GitHub Integration
- Vercel CLI
- Manual Import

---

# 🔐 Environment Variables

Create `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"

ADMIN_PASSWORD="change-this-before-production"

SESSION_SECRET="replace-with-a-long-random-secret"

VITE_PUBLIC_SITE_URL="https://your-domain.com"
```

---

# 🧠 Current Backend State

Current implementation uses:

```text
GET /api/state
PUT /api/state
```

Data persistence is stored as JSON inside:

```text
invitation_state
```

This lightweight approach minimizes hosting costs while keeping the system fully functional.

---

# 🗄 Recommended Future Database Structure

```text
events
invitation_settings
guests
rsvps
gift_accounts
check_ins
admin_sessions
```

---

# 🔮 Recommended Future API

```text
GET /api/invitation
PUT /api/admin/invitation

GET /api/admin/guests
POST /api/admin/guests/bulk

POST /api/rsvp

POST /api/admin/check-in
GET /api/admin/guest-book
```

---

# 📷 QR Check-in Security

Production recommendations:

- Server-side QR validation
- Admin authentication
- Duplicate attendance prevention
- Session-based scanner access
- Protected check-in endpoints

---

# 🧩 Neon Database Setup

## Step 1 — Create Database

Create a project on Neon.

---

## Step 2 — Add Environment Variable

```env
DATABASE_URL="postgresql://..."
```

---

## Step 3 — Redeploy

Redeploy the Vercel project.

---

## Step 4 — Initialize Database

Open:

```bash
/admin
```

Save once and the app automatically creates:

```text
invitation_state
```

---

# 📋 Production Readiness

| Feature | Status |
|---|---|
| Vite Production Build | ✅ |
| Dependency Audit | ✅ |
| SPA Rewrite | ✅ |
| Admin Dashboard | ✅ |
| RSVP System | ✅ |
| Guest Export | ✅ |
| QR Check-in | ✅ |
| Neon Persistence | ✅ |
| Admin Authentication | ⏳ |
| QR Validation | ⏳ |
| SaaS Package Restriction | ⏳ |

---

# 🎨 Vision

Nikahfix is designed not only as a wedding invitation template, but as a scalable digital invitation ecosystem capable of evolving into a full invitation SaaS platform.

Built with:
- cinematic UX
- scalable architecture
- lightweight deployment
- multi-client readiness

---

# 📄 License

Private Commercial Template  
For **Nikahan Kita** and client deployment usage only.

---

# 🤝 Credits

Developed with passion for modern digital experiences, elegant storytelling, and scalable SaaS architecture.

---

<p align="center">
  <b>✨ Nikahfix — Turning Invitations Into Experiences ✨</b>
</p>

# TrackD2D — Door-to-Door Sales Intelligence Platform

A full-stack, production-ready platform for door-to-door (D2D) sales teams. TrackD2D combines real-time rep tracking, AI-powered lead scoring, territory management, automated enrichment, and analytics into a single cohesive system.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Services](#services)
- [Development](#development)

---

## Overview

TrackD2D is built for field sales organisations that need to:

- Manage and visualise territories on a map
- Track rep GPS positions in real time via WebSockets
- Score and enrich leads automatically using Google Places, Clearbit, Hunter.io and Apollo
- Log every door-knock, call, email, and meeting
- Generate analytics dashboards and performance snapshots
- Scrape prospects from Google Places
- Run AI-powered suggestions with OpenAI

---

## Tech Stack

| Layer | Technology |
|---|---|
| API | Node.js 20, Express 4, TypeScript 5 |
| Real-time | Socket.IO 4 |
| Database | PostgreSQL 16 via Prisma ORM |
| Cache / Queue | Redis 7 |
| Auth | JWT (access + refresh token rotation) |
| Validation | Zod, express-validator |
| Logging | Winston |
| Web Frontend | Next.js 14 (App Router) |
| Mapping | Mapbox GL JS |
| Enrichment APIs | Google Places, Clearbit, Hunter.io, Apollo |
| AI | OpenAI (gpt-4o-mini) |
| SMS | Twilio |
| Email | SendGrid |
| Containerisation | Docker Compose |
| Monorepo | npm workspaces |

---

## Architecture

```
TrackD2D/
├── apps/
│   ├── api/          # Express REST API + Socket.IO
│   └── web/          # Next.js frontend
├── packages/
│   └── database/     # Prisma schema + generated client
├── docker-compose.yml
└── package.json
```

The API is stateless; horizontal scaling is possible behind a load balancer with a shared Redis instance for rate-limit state and a shared PostgreSQL instance.

---

## Prerequisites

- Node.js >= 20
- npm >= 10 (workspaces support)
- Docker & Docker Compose (for local Postgres + Redis)
- A Google Cloud project with Places API enabled
- Optional: Clearbit, Hunter.io, Apollo, OpenAI, Twilio, SendGrid API keys

---

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd TrackD2D
npm install

# 2. Copy and edit env
cp .env.example .env
# fill in real values (minimum: DATABASE_URL, JWT_SECRET, REFRESH_TOKEN_SECRET)

# 3. Start infrastructure
docker-compose up -d

# 4. Push schema & generate Prisma client
cd packages/database
npx prisma db push
npx prisma generate
cd ../..

# 5. Start dev servers
npm run dev
```

API listens on `http://localhost:4000`
Web listens on `http://localhost:3000`

---

## Environment Variables

See [.env.example](.env.example) for the full list. Key variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | HS256 signing secret for access tokens |
| `JWT_EXPIRES_IN` | Access token lifetime (e.g. `7d`) |
| `REFRESH_TOKEN_SECRET` | Signing secret for refresh tokens |
| `GOOGLE_PLACES_API_KEY` | Google Places / Maps API key |
| `CLEARBIT_API_KEY` | Clearbit enrichment key |
| `HUNTER_IO_API_KEY` | Hunter.io email-finder key |
| `APOLLO_API_KEY` | Apollo.io people-data key |
| `OPENAI_API_KEY` | OpenAI key for AI insights |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `SENDGRID_API_KEY` | SendGrid key |

---

## API Reference

All endpoints are prefixed with `/api`. Protected endpoints require `Authorization: Bearer <accessToken>`.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Create organisation + admin user |
| POST | `/login` | No | Obtain access + refresh tokens |
| POST | `/refresh` | No | Rotate refresh token |
| POST | `/logout` | Yes | Invalidate refresh token |
| GET | `/me` | Yes | Get current user profile |

**Register body:**
```json
{
  "email": "admin@acme.com",
  "password": "secret123",
  "firstName": "Jane",
  "lastName": "Doe",
  "organizationName": "Acme Solar"
}
```

**Login response:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": "...", "email": "...", "role": "ADMIN" }
}
```

---

### Leads — `/api/leads`

| Method | Path | Description |
|---|---|---|
| GET | `/` | Paginated lead list with filters |
| GET | `/nearby` | Geo-search (lat, lng, radiusKm) |
| GET | `/stats` | Summary stats |
| GET | `/:id` | Full lead detail |
| POST | `/` | Create lead |
| PATCH | `/:id` | Update lead |
| DELETE | `/:id` | Archive lead |
| POST | `/bulk-assign` | Assign multiple leads |
| POST | `/import` | Bulk import leads |

**Query params for GET /:** `status`, `territoryId`, `assignedRepId`, `search`, `source`, `minScore`, `maxScore`, `page`, `limit`, `sortBy`, `sortOrder`

---

### Territories — `/api/territories`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List territories |
| GET | `/:id` | Territory detail with assignments |
| POST | `/` | Create territory |
| PATCH | `/:id` | Update territory |
| DELETE | `/:id` | Delete territory |
| POST | `/:id/assign` | Assign rep to territory |

---

### Activities — `/api/activities`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List activities (filter by leadId, userId, type) |
| POST | `/` | Log activity (door knock, call, email, etc.) |
| PATCH | `/:id` | Update activity |
| DELETE | `/:id` | Delete activity |
| POST | `/track-location` | Update rep GPS position |

---

### Analytics — `/api/analytics`

| Method | Path | Description |
|---|---|---|
| GET | `/dashboard` | KPIs, charts, top reps |
| GET | `/territories` | Territory performance |
| GET | `/reps` | Rep performance (optional ?repId=&days=) |
| GET | `/funnel` | Pipeline stage counts |

---

### Enrichment — `/api/enrichment`

| Method | Path | Description |
|---|---|---|
| POST | `/lead/:id` | Enrich a specific lead |
| POST | `/score/:id` | Score a specific lead |
| POST | `/score-all` | Score all leads in org |
| GET | `/queue` | View enrichment queue |

---

### Users — `/api/users`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List org users |
| GET | `/:id` | User detail |
| POST | `/` | Invite user (admin only) |
| PATCH | `/:id` | Update user |
| GET | `/reps/locations` | Live rep GPS positions |

---

### Companies — `/api/companies`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List companies |
| GET | `/:id` | Company with lead/contact counts |
| POST | `/` | Create company |
| PATCH | `/:id` | Update company |

---

### Contacts — `/api/contacts`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List contacts (optional ?companyId=) |
| POST | `/` | Create contact |
| PATCH | `/:id` | Update contact |

---

### Scraper — `/api/scraper` (admin/manager)

| Method | Path | Description |
|---|---|---|
| POST | `/google-places` | Search Google Places |
| POST | `/import` | Import scraped results |
| GET | `/jobs` | List scraper jobs |

---

### Health

```
GET /health  →  { status: "ok", timestamp: "...", uptime: 123 }
```

---

## Database Schema

Key models (see `packages/database/prisma/schema.prisma` for the full schema):

- **Organization** — multi-tenant root
- **User** — reps, managers, admins with GPS tracking fields
- **Territory** — geographic zones with boundary JSON (GeoJSON polygon)
- **Lead** — core entity; links territory, company, contact, rep
- **Activity** — every interaction logged against a lead
- **Company / Contact** — enrichable business entities
- **EnrichmentQueue** — async enrichment job queue with retry
- **RepTracking** — time-series GPS positions
- **AnalyticsSnapshot** — pre-aggregated KPI snapshots
- **AiInsight** — OpenAI-generated suggestions per lead
- **Notification** — in-app notifications

---

## Services

| Service | Responsibility |
|---|---|
| `AuthService` | Registration, login, JWT/refresh token lifecycle |
| `LeadsService` | CRUD, geo-search, bulk ops, stats |
| `ScoringService` | 0-100 lead scoring with weighted factors |
| `EnrichmentService` | Google Places + Clearbit + Hunter.io enrichment, queue processor |
| `AnalyticsService` | Dashboard KPIs, territory & rep performance, funnel |
| `ScraperService` | Google Places Text Search → lead import |

---

## Development

```bash
# Run API only
npm run dev --workspace=apps/api

# Run web only
npm run dev --workspace=apps/web

# Prisma studio
npm run db:studio --workspace=packages/database

# Generate Prisma client after schema changes
npm run db:generate --workspace=packages/database

# Create a migration
npm run db:migrate --workspace=packages/database
```

### Real-time Events (Socket.IO)

Connect to `ws://localhost:4000` and join your org room:

```js
socket.emit('join:org', { orgId: 'your-org-id' });
// Receive rep location updates:
socket.on('rep:location', ({ repId, lat, lng, timestamp }) => { ... });
```

Reps emit their position:
```js
socket.emit('rep:location', { repId, orgId, lat, lng, accuracy, speed, heading });
```

---

## License

Private — all rights reserved.

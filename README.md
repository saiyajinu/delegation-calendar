# Delegation Calendar

A personal calendar web app for logging daily activities and tracking multi-day business trips. Built with Next.js (App Router), TypeScript, Tailwind CSS, and Turso (libsql).

## Features

- **Month calendar** (`/`) — activities (blue) and business trips (pink) on a FullCalendar month view
- **Day modal** — click any day to add an activity or business trip
- **Day details** (`/day/YYYY-MM-DD`) — activities, active trip info, and quick navigation across trip days
- **Event click** — opens the day details page

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Turso (libsql) — SQLite in the cloud
- FullCalendar (day grid + interaction)

## Prerequisites

- Node.js 20+
- npm

## Setup

### Local development (SQLite)

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

   Tables will be auto-created on first access.

### Production (Turso)

1. **Create a Turso database** at [turso.tech](https://turso.tech)

2. **Create an auth token**

   ```bash
   turso db tokens create your-db-name
   ```

3. **Configure environment**

   Set in `.env` (or Vercel):

   ```env
   DATABASE_URL="libsql://your-db-name.turso.io"
   TURSO_AUTH_TOKEN="your-token-here"
   ```

4. **Start the dev server** (tables auto-create)

   ```bash
   npm run dev
   ```

## Scripts

| Command       | Description          |
| ------------- | -------------------- |
| `npm run dev` | Start dev server     |
| `npm run build` | Production build   |
| `npm run start` | Start prod server  |
| `npm run lint` | Run ESLint          |

## Project structure

```
app/
  actions/          # Server actions (create activity / trip)
  components/       # UI, calendar, forms, day views
  day/[date]/       # Day details page
  page.tsx          # Calendar home
lib/
  db.ts             # libsql client with Activity & BusinessTrip queries
  dates.ts          # Date parsing and formatting
  calendar-events.ts
  data.ts           # Data fetching helpers
```

## Data model

**Activity** — `title`, optional `description`, `date`

**BusinessTrip** — `title`, `city`, `startDate`, `endDate`, optional `notes`

## Database

Using **@libsql/client** with Turso:

- Tables auto-create on startup via `CREATE TABLE IF NOT EXISTS`
- Connection pooling via libsql
- Auth via token in connection string

## Notes

- No authentication — single-user local app
- Dates in URLs use `YYYY-MM-DD`
- Business trips render as multi-day all-day events on the calendar
- Environment variables (`.env`) are git-ignored

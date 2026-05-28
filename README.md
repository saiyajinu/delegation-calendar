# Delegation Calendar

A personal calendar web app for logging daily activities and tracking multi-day business trips. Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma, SQLite, and FullCalendar.

## Features

- **Month calendar** (`/`) — activities (blue) and business trips (amber) on a FullCalendar month view
- **Day modal** — click any day to add an activity or business trip
- **Day details** (`/day/YYYY-MM-DD`) — activities, active trip info, and quick navigation across trip days
- **Event click** — opens the day details page

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Prisma ORM + SQLite
- FullCalendar (day grid + interaction)

## Prerequisites

- Node.js 20+
- npm

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure the database**

   Ensure `.env` contains:

   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. **Create the database schema**

   ```bash
   npx prisma db push
   ```

4. **Generate the Prisma client** (also runs on `npm install` via postinstall)

   ```bash
   npx prisma generate
   ```

5. **Seed example data** (optional)

   ```bash
   npm run db:seed
   ```

6. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start development server             |
| `npm run build`   | Production build                     |
| `npm run start`   | Start production server              |
| `npm run db:push` | Push Prisma schema to SQLite         |
| `npm run db:seed` | Load example activities and trips    |
| `npm run db:studio` | Open Prisma Studio                 |

## Project structure

```
app/
  actions/          # Server actions (create activity / trip)
  components/       # UI, calendar, forms, day views
  day/[date]/       # Day details page
  page.tsx          # Calendar home
lib/
  prisma.ts         # Prisma client singleton
  dates.ts          # Date parsing and formatting
  calendar-events.ts
  data.ts           # Data fetching helpers
prisma/
  schema.prisma     # Activity & BusinessTrip models
  seed.ts           # Example seed data
```

## Data model

**Activity** — `title`, optional `description`, `date`

**BusinessTrip** — `title`, `city`, `startDate`, `endDate`, optional `notes`

## Notes

- No authentication — single-user local app
- Dates in URLs use `YYYY-MM-DD`
- Business trips render as multi-day all-day events on the calendar

## Deploying with Turso (recommended for Vercel)

This app supports **local SQLite** (`file:./dev.db`) or **Turso** (`libsql://…`).

### 1. Turso setup

1. Create a DB at [turso.tech](https://turso.tech) (you already have `libsql://carinacalendar-….turso.io`).
2. Create an auth token:
   ```bash
   turso db tokens create carinacalendar
   ```
   Or copy it from the Turso dashboard.

### 2. Environment variables

**Local `.env`** (for Turso):

```env
DATABASE_URL="libsql://carinacalendar-saiyajinu.aws-eu-west-1.turso.io"
TURSO_AUTH_TOKEN="your-token-here"
```

**Vercel** → Settings → Environment Variables — add both variables for Production (and Preview if you want).

### 3. Push schema to Turso

From your machine (with `.env` pointing at Turso):

```bash
npx prisma db push
npm run db:seed
```

### 4. Deploy on Vercel

- Build command: `npm run build` (default is fine; `postinstall` runs `prisma generate`)
- No `file:` URL needed on Vercel when using Turso

### Local SQLite (optional)

```env
DATABASE_URL="file:./dev.db"
```

Remove or leave `TURSO_AUTH_TOKEN` unset — the app uses normal Prisma SQLite without the libSQL adapter.

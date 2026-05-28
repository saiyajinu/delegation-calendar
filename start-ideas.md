# Personal Calendar + Business Trip Tracker

## Tech Stack

Build a simple web app using:

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* libsql (@libsql/client) — SQLite via Turso
* FullCalendar for month calendar UI

The app should be simple, clean, modern, and optimized for desktop first.

---

# Main Goal

Create a personal calendar app where the user can:

1. Track what they did each day
2. Track business trips spanning multiple days
3. View detailed information for a selected day
4. Navigate easily between days inside the same business trip

---

# Features

## 1. Calendar Page

Route:
`/`

Fullscreen month calendar.

### Requirements

* Display month view calendar
* Show activities and business trips on calendar
* Clicking a day opens a modal
* Modal allows:

  * add activity
  * add business trip

### Activity fields

* title
* description (optional)
* date

### Business Trip fields

* title
* city
* startDate
* endDate
* notes (optional)

### Calendar behavior

* business trips should span multiple days visually
* activities should appear as single-day events
* use different colors for:

  * activities
  * business trips

---

## 2. Day Details Page

Route:
`/day/[date]`

### Requirements

Show:

* selected date
* all activities for that day
* any active business trip for that day

If the day belongs to a business trip:

* show trip title
* show trip city
* show trip duration
* show quick navigation between trip days

Example:

Mon Tue Wed Thu Fri

Current day should be highlighted.

User should be able to click another trip day quickly.

---

# Database Schema

## Activity

Fields:

* id
* title
* description
* date
* createdAt

## BusinessTrip

Fields:

* id
* title
* city
* startDate
* endDate
* notes
* createdAt

---

# Database Implementation

**Using @libsql/client with Turso:**

- Direct SQL queries (no ORM)
- Tables auto-created via `CREATE TABLE IF NOT EXISTS` on first connection
- Connection pooling via libsql
- Auth token passed in connection string

See `lib/db.ts` for the database client implementation.

---

# UI Requirements

Use:

* Tailwind CSS
* clean spacing
* modern minimal design
* responsive layout
* modal dialogs for creation forms

---

# Technical Requirements

* Use libsql with Turso (or local SQLite)
* Use server actions or API routes for CRUD
* Use FullCalendar for month calendar
* Use TypeScript everywhere
* Organize code cleanly into components

---

# Initial Scope

Only implement:

* create activities
* create business trips
* calendar display
* day details page
* trip navigation

Do NOT implement:

* authentication
* user accounts
* notifications
* recurring events
* drag and drop
* mobile app
* external integrations

---

# Nice UX Details

* clicking a calendar event opens day details
* current day highlighted
* loading states
* empty states
* smooth modal animations

---

# Deliverables

Generate:

1. Complete Next.js project structure
2. Database schema and libsql client
3. Database setup instructions
4. Calendar components
5. Modal components
6. Day details page
7. README with setup instructions

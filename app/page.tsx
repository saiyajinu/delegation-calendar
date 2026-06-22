import { Suspense } from "react";
import { cookies } from "next/headers";
import { CalendarPageClient } from "@/app/components/calendar/CalendarPageClient";
import { AppHeader } from "@/app/components/layout/AppHeader";
import {
  activitiesToEvents,
  tripsToEvents,
} from "@/lib/calendar-events";
import { getAllActivities, getAllBusinessTrips } from "@/lib/data";
import { normalizeUserCode } from "@/lib/user-code";

/** Prisma needs a live DB; do not pre-render at build time (e.g. on Vercel). */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const requestCookies = await cookies();
  const userCode = normalizeUserCode(requestCookies.get("userCode")?.value ?? null);

  const [activities, trips] = userCode
    ? await Promise.all([
        getAllActivities(userCode),
        getAllBusinessTrips(userCode),
      ])
    : [[], []];

  const events = [...activitiesToEvents(activities), ...tripsToEvents(trips)];

  return (
    <>
      <AppHeader active="calendar" />
      <main className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-6xl flex-col px-6 py-6">
        <Suspense fallback={<div className="flex flex-1 items-center justify-center text-sm text-rose-600">Loading calendar…</div>}>
          <CalendarPageClient events={events} />
        </Suspense>
      </main>
    </>
  );
}

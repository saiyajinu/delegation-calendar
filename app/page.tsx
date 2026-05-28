import { Suspense } from "react";
import { CalendarPageClient } from "@/app/components/calendar/CalendarPageClient";
import { AppHeader } from "@/app/components/layout/AppHeader";
import {
  activitiesToEvents,
  tripsToEvents,
} from "@/lib/calendar-events";
import { getAllActivities, getAllBusinessTrips } from "@/lib/data";

export default async function HomePage() {
  const [activities, trips] = await Promise.all([
    getAllActivities(),
    getAllBusinessTrips(),
  ]);

  const events = [...activitiesToEvents(activities), ...tripsToEvents(trips)];

  return (
    <>
      <AppHeader />
      <main className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-6xl flex-col px-6 py-6">
        <Suspense fallback={<div className="flex flex-1 items-center justify-center text-sm text-rose-600">Loading calendar…</div>}>
          <CalendarPageClient events={events} />
        </Suspense>
      </main>
    </>
  );
}

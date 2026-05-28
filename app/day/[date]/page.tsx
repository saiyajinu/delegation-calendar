import { notFound } from "next/navigation";
import { MapPin, Plane } from "lucide-react";
import { AppHeader } from "@/app/components/layout/AppHeader";
import { DayAddButton } from "@/app/components/day/DayAddButton";
import { DelegationTimeline } from "@/app/components/day/DelegationTimeline";
import { TripDayNav } from "@/app/components/day/TripDayNav";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { getDayDetails } from "@/lib/data";
import {
  formatDisplayDate,
  formatTripDuration,
  isToday,
} from "@/lib/dates";

type PageProps = {
  params: Promise<{ date: string }>;
};

export const dynamic = "force-dynamic";

export default async function DayPage({ params }: PageProps) {
  const { date: dateParam } = await params;
  const details = await getDayDetails(dateParam);

  if (!details) {
    notFound();
  }

  const {
    date,
    activities,
    activeTrip,
    delegationDays,
  } = details;
  const today = isToday(date);

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-rose-600">
              {today ? "Today" : "Day details"}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-rose-950">
              {formatDisplayDate(date)}
            </h1>
          </div>
          <DayAddButton
            dateParam={dateParam}
            viewingDayParam={dateParam}
            label="Add entry"
            variant="button"
          />
        </div>

        {activeTrip && (
          <section className="mb-8 rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-6 shadow-sm shadow-pink-100/40">
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-sm">
                <Plane className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-rose-950">
                  {activeTrip.title}
                </h2>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-pink-800">
                  <MapPin className="h-3.5 w-3.5" />
                  {activeTrip.city}
                </p>
                <p className="mt-1 text-sm text-rose-700">
                  {formatTripDuration(activeTrip.startDate, activeTrip.endDate)}
                </p>
              </div>
            </div>
            {activeTrip.notes && (
              <p className="mb-4 rounded-lg bg-white/70 px-4 py-3 text-sm text-rose-800">
                {activeTrip.notes}
              </p>
            )}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-pink-800/90">
                Trip days
              </p>
              <TripDayNav
                startDate={activeTrip.startDate}
                endDate={activeTrip.endDate}
                currentDateParam={dateParam}
              />
            </div>
          </section>
        )}

        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-rose-950">
              {activeTrip ? "This day" : "Activities"}
            </h2>
            <DayAddButton
              dateParam={dateParam}
              viewingDayParam={dateParam}
              label="+ Add activity"
            />
          </div>

          {activities.length === 0 ? (
            <EmptyState
              title="No activities on this day"
              description={
                activeTrip
                  ? "Use Add entry above to log what you did, or add from another day in the delegation overview."
                  : "Use Add entry above to log what you did."
              }
            />
          ) : (
            <ul className="space-y-3">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className="rounded-xl border border-rose-200 bg-white p-4 shadow-sm shadow-rose-100/30"
                >
                  <h3 className="font-medium text-rose-950">{activity.title}</h3>
                  {activity.description && (
                    <p className="mt-2 text-sm leading-relaxed text-rose-700">
                      {activity.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {activeTrip && delegationDays.length > 0 && (
          <DelegationTimeline
            days={delegationDays}
            tripTitle={activeTrip.title}
            viewingDayParam={dateParam}
          />
        )}
      </main>
    </>
  );
}

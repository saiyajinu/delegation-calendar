import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { AppHeader } from "@/app/components/layout/AppHeader";
import { DayAddButton } from "@/app/components/day/DayAddButton";
import { ActivityCard } from "@/app/components/day/ActivityCard";
import { BusinessTripCard } from "@/app/components/day/BusinessTripCard";
import { DelegationTimeline } from "@/app/components/day/DelegationTimeline";
import { TripDayNav } from "@/app/components/day/TripDayNav";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { getDayDetails } from "@/lib/data";
import {
  formatDisplayDate,
  isToday,
} from "@/lib/dates";
import { normalizeUserCode } from "@/lib/user-code";

type PageProps = {
  params: Promise<{ date: string }>;
};

export const dynamic = "force-dynamic";

export default async function DayPage({ params }: PageProps) {
  const { date: dateParam } = await params;
  const requestCookies = await cookies();
  const userCode = normalizeUserCode(requestCookies.get("userCode")?.value ?? null);
  const details = await getDayDetails(dateParam, userCode);

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
          <>
            <BusinessTripCard
              trip={activeTrip}
              viewingDayParam={dateParam}
            />
            <div className="mb-8 mt-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-pink-800/90">
                Trip days
              </p>
              <TripDayNav
                startDate={activeTrip.startDate}
                endDate={activeTrip.endDate}
                currentDateParam={dateParam}
              />
            </div>
          </>
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
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  dateParam={dateParam}
                  viewingDayParam={dateParam}
                />
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

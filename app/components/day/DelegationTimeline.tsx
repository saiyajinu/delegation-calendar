"use client";

import Link from "next/link";
import type { DelegationDay } from "@/lib/delegation";
import { formatShortWeekday } from "@/lib/dates";
import { DayAddButton } from "@/app/components/day/DayAddButton";

type DelegationTimelineProps = {
  days: DelegationDay[];
  tripTitle: string;
  viewingDayParam: string;
};

export function DelegationTimeline({
  days,
  tripTitle,
  viewingDayParam,
}: DelegationTimelineProps) {
  const totalActivities = days.reduce((n, d) => n + d.activities.length, 0);

  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-rose-950">
            Delegation overview
          </h2>
          <p className="mt-1 text-sm text-rose-600">
            All {totalActivities} activit{totalActivities === 1 ? "y" : "ies"} across{" "}
            {tripTitle} ({days.length} days)
          </p>
        </div>
      </div>

      <ol className="space-y-4">
        {days.map((day) => (
          <li
            key={day.dateParam}
            id={`delegation-day-${day.dateParam}`}
            className={`scroll-mt-24 rounded-xl border bg-white ${
              day.isSelected
                ? "border-pink-300 ring-2 ring-pink-200/70"
                : "border-rose-200"
            }`}
          >
            <div
              className={`flex items-center justify-between gap-3 border-b px-4 py-3 ${
                day.isSelected ? "border-pink-100 bg-pink-50/60" : "border-rose-100"
              }`}
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-rose-500">
                  {formatShortWeekday(day.date)}
                  {day.isSelected && (
                    <span className="ml-2 text-pink-700">· viewing</span>
                  )}
                </p>
                <p className="font-medium text-rose-950">{day.label}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <DayAddButton
                  dateParam={day.dateParam}
                  viewingDayParam={viewingDayParam}
                  label="+ Add"
                  className="text-sm font-medium text-pink-700 transition-colors hover:text-pink-900"
                />
                {!day.isSelected && (
                  <Link
                    href={`/day/${day.dateParam}`}
                    prefetch
                    className="text-sm font-medium text-rose-500 transition-colors hover:text-rose-800"
                  >
                    Open →
                  </Link>
                )}
              </div>
            </div>

            <div className="p-4">
              {day.activities.length === 0 ? (
                <p className="text-sm text-rose-400">No activities logged</p>
              ) : (
                <ul className="space-y-3">
                  {day.activities.map((activity) => (
                    <li
                      key={activity.id}
                      className="rounded-lg border border-rose-100 bg-rose-50/50 px-3 py-2.5"
                    >
                      <h4 className="text-sm font-medium text-rose-950">
                        {activity.title}
                      </h4>
                      {activity.description && (
                        <p className="mt-1 text-sm leading-relaxed text-rose-700">
                          {activity.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

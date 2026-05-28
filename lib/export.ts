import type { Activity, BusinessTrip } from "@prisma/client";
import {
  addDays,
  eachDayInclusive,
  formatDateParam,
  isSameDay,
  startOfDay,
} from "@/lib/dates";

export const EXPORT_DAY_COUNT = 30;

export function getLast30DaysRange(): { start: Date; end: Date } {
  const end = startOfDay(new Date());
  const start = addDays(end, -(EXPORT_DAY_COUNT - 1));
  return { start, end };
}

function ordinal(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

function formatDayLabel(date: Date): string {
  const month = date.toLocaleDateString("en-US", { month: "long" });
  return `${ordinal(date.getDate())} of ${month}`;
}

function formatDelegationHeader(trip: BusinessTrip): string {
  const start = startOfDay(trip.startDate);
  const end = startOfDay(trip.endDate);
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = start.toLocaleDateString("en-US", { month: "long" });
  const endMonth = end.toLocaleDateString("en-US", { month: "long" });

  const range =
    startMonth === endMonth
      ? `${startDay} to ${endDay} ${startMonth}`
      : `${startDay} ${startMonth} to ${endDay} ${endMonth}`;

  const meta = [trip.title, trip.city].filter(Boolean).join(" · ");
  return meta
    ? `Delegation from ${range} (${meta})`
    : `Delegation from ${range}`;
}

function formatActivityChunk(activity: Activity): string {
  let chunk = `-${activity.title}`;
  if (activity.description?.trim()) {
    chunk += ` - ${activity.description.trim()}`;
  }
  return chunk;
}

const ACTIVITY_INDENT = "  ";

function formatDayLines(
  date: Date,
  activitiesByDate: Map<string, Activity[]>,
): string[] {
  const key = formatDateParam(date);
  const activities = activitiesByDate.get(key) ?? [];
  const label = formatDayLabel(date);

  if (activities.length === 0) {
    return [`${label} :`];
  }
  if (activities.length === 1) {
    return [`${label} : ${formatActivityChunk(activities[0])}`];
  }

  return [
    `${label} :`,
    ...activities.map((a) => `${ACTIVITY_INDENT}${formatActivityChunk(a)}`),
  ];
}

function findTripForDay(day: Date, trips: BusinessTrip[]): BusinessTrip | null {
  const d = startOfDay(day);
  return (
    trips.find((trip) => {
      const start = startOfDay(trip.startDate);
      const end = startOfDay(trip.endDate);
      return d >= start && d <= end;
    }) ?? null
  );
}

function isDayInTrip(day: Date, trip: BusinessTrip): boolean {
  const d = startOfDay(day);
  return d >= startOfDay(trip.startDate) && d <= startOfDay(trip.endDate);
}

function groupActivitiesByDate(activities: Activity[]): Map<string, Activity[]> {
  const map = new Map<string, Activity[]>();
  for (const activity of activities) {
    const key = formatDateParam(activity.date);
    const list = map.get(key);
    if (list) list.push(activity);
    else map.set(key, [activity]);
  }
  return map;
}

export function formatCalendarExport(
  activities: Activity[],
  trips: BusinessTrip[],
  rangeStart: Date,
  rangeEnd: Date,
): string {
  const days = eachDayInclusive(rangeStart, rangeEnd);
  const activitiesByDate = groupActivitiesByDate(activities);
  const lines: string[] = [];

  const rangeLabel = `${formatDateParam(rangeStart)} to ${formatDateParam(rangeEnd)}`;
  lines.push(`Calendar export — last ${EXPORT_DAY_COUNT} days (${rangeLabel})`);
  lines.push("");

  let i = 0;
  while (i < days.length) {
    const day = days[i];
    const trip = findTripForDay(day, trips);
    const prevDay = i > 0 ? days[i - 1] : null;
    const startsTripBlock =
      trip &&
      isDayInTrip(day, trip) &&
      (!prevDay || !isDayInTrip(prevDay, trip));

    if (startsTripBlock && trip) {
      lines.push(formatDelegationHeader(trip));

      while (i < days.length) {
        const currentDay = days[i];
        const currentTrip = findTripForDay(currentDay, trips);
        if (!currentTrip || currentTrip.id !== trip.id) break;

        lines.push(...formatDayLines(currentDay, activitiesByDate));

        if (isSameDay(currentDay, trip.endDate)) {
          lines.push("End of Delegation");
        }
        i++;
      }
    } else {
      lines.push(...formatDayLines(day, activitiesByDate));
      i++;
    }
  }

  return lines.join("\n");
}

export function buildExportFilename(rangeStart: Date, rangeEnd: Date): string {
  return `calendar-export-${formatDateParam(rangeStart)}-to-${formatDateParam(rangeEnd)}.txt`;
}

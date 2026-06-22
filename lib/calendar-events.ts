import type { Activity, BusinessTrip } from "@/lib/db";
import type { WithLocationName } from "@/lib/locations";
import {
  formatDateParam,
  toFullCalendarExclusiveEnd,
} from "@/lib/dates";

export const ACTIVITY_COLOR = "#c084fc";
export const TRIP_COLOR = "#f472b6";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    type: "activity" | "trip";
    entityId: number;
    date: string;
  };
};

export function activitiesToEvents(
  activities: WithLocationName<Activity>[]
): CalendarEvent[] {
  return activities.map((activity) => {
    const date = formatDateParam(activity.date);
    const locationSuffix = activity.locationName ? ` · ${activity.locationName}` : "";
    return {
      id: `activity-${activity.id}`,
      title: `${activity.title}${locationSuffix}`,
      start: date,
      allDay: true,
      backgroundColor: ACTIVITY_COLOR,
      borderColor: ACTIVITY_COLOR,
      extendedProps: {
        type: "activity",
        entityId: activity.id,
        date,
      },
    };
  });
}

export function tripsToEvents(trips: WithLocationName<BusinessTrip>[]): CalendarEvent[] {
  return trips.map((trip) => {
    const place = trip.locationName ?? trip.city;
    return {
      id: `trip-${trip.id}`,
      title: `${trip.title} · ${place}`,
      start: formatDateParam(trip.startDate),
      end: toFullCalendarExclusiveEnd(trip.endDate),
      allDay: true,
      backgroundColor: TRIP_COLOR,
      borderColor: TRIP_COLOR,
      extendedProps: {
        type: "trip",
        entityId: trip.id,
        date: formatDateParam(trip.startDate),
      },
    };
  });
}

import type { Activity, BusinessTrip } from "@/lib/db";
import type { WithLocationName } from "@/lib/locations";
import {
  eachDayInclusive,
  formatDateParam,
  formatDisplayDate,
} from "@/lib/dates";

export type DelegationDay = {
  date: Date;
  dateParam: string;
  label: string;
  activities: WithLocationName<Activity>[];
  isSelected: boolean;
};

export function buildDelegationDays(
  trip: WithLocationName<BusinessTrip>,
  activities: WithLocationName<Activity>[],
  selectedDateParam: string,
): DelegationDay[] {
  const byDate = new Map<string, WithLocationName<Activity>[]>();

  for (const activity of activities) {
    const key = formatDateParam(activity.date);
    const list = byDate.get(key);
    if (list) list.push(activity);
    else byDate.set(key, [activity]);
  }

  return eachDayInclusive(trip.startDate, trip.endDate).map((day) => {
    const dateParam = formatDateParam(day);
    return {
      date: day,
      dateParam,
      label: formatDisplayDate(day),
      activities: byDate.get(dateParam) ?? [],
      isSelected: dateParam === selectedDateParam,
    };
  });
}

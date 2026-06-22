import type { Activity } from "@/lib/db";
import { db } from "@/lib/db";
import { buildDelegationDays } from "@/lib/delegation";
import { enrichWithLocationNames } from "@/lib/locations";
import {
  endOfDay,
  formatDateParam,
  parseDateParam,
  startOfDay,
} from "@/lib/dates";

export async function getAllActivities(userCode: string | null) {
  if (!userCode) return [];
  const activities = await db.activity.findMany({
    where: { userCode },
    orderBy: { date: "asc" },
  });
  return enrichWithLocationNames(activities, userCode);
}

export async function getAllBusinessTrips(userCode: string | null) {
  if (!userCode) return [];
  const trips = await db.businessTrip.findMany({
    where: { userCode },
    orderBy: { startDate: "asc" },
  });
  return enrichWithLocationNames(trips, userCode);
}

export async function getActivitiesAndTripsInRange(
  rangeStart: Date,
  rangeEnd: Date,
  userCode: string | null,
) {
  if (!userCode) {
    return { activities: [], trips: [] };
  }

  const start = startOfDay(rangeStart);
  const end = endOfDay(rangeEnd);

  const [activities, trips] = await Promise.all([
    db.activity.findMany2({
      where: { date: { gte: start, lte: end }, userCode },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
    db.businessTrip.findMany2({
      where: {
        startDate: { lte: end },
        endDate: { gte: start },
        userCode,
      },
      orderBy: { startDate: "asc" },
    }),
  ]);

  return { activities, trips };
}

export async function getDayDetails(dateParam: string, userCode: string | null) {
  const date = parseDateParam(dateParam);
  if (!date) return null;

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const activeTrip = userCode
    ? await db.businessTrip.findFirst({
        where: {
          startDate: { lte: dayEnd },
          endDate: { gte: dayStart },
          userCode,
        },
        orderBy: { startDate: "asc" },
      })
    : null;

  let activities: Activity[];
  let delegationActivities: Activity[];

  if (activeTrip) {
    const tripStart = startOfDay(activeTrip.startDate);
    const tripEnd = endOfDay(activeTrip.endDate);

    delegationActivities = await db.activity.findMany2({
      where: {
        date: { gte: tripStart, lte: tripEnd },
        userCode,
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    });

    activities = delegationActivities.filter(
      (a) => a.date >= dayStart && a.date <= dayEnd,
    );
  } else {
    delegationActivities = [];
    activities = userCode
      ? await db.activity.findMany2({
          where: { date: { gte: dayStart, lte: dayEnd }, userCode },
          orderBy: { createdAt: "asc" },
        })
      : [];
  }

  const [enrichedActivities, enrichedActiveTrip, enrichedDelegationActivities] =
    await Promise.all([
      enrichWithLocationNames(activities, userCode),
      activeTrip ? enrichWithLocationNames([activeTrip], userCode).then((items) => items[0] ?? null) : null,
      enrichWithLocationNames(delegationActivities, userCode),
    ]);

  const enrichedDelegationDays =
    enrichedActiveTrip
      ? buildDelegationDays(
          enrichedActiveTrip,
          enrichedDelegationActivities,
          dateParam
        )
      : [];

  return {
    date: dayStart,
    dateParam: formatDateParam(dayStart),
    activities: enrichedActivities,
    activeTrip: enrichedActiveTrip,
    delegationActivities: enrichedDelegationActivities,
    delegationDays: enrichedDelegationDays,
  };
}

import type { Activity } from "@/lib/db";
import { db } from "@/lib/db";
import { buildDelegationDays } from "@/lib/delegation";
import {
  endOfDay,
  formatDateParam,
  parseDateParam,
  startOfDay,
} from "@/lib/dates";

export async function getAllActivities(userCode: string | null) {
  if (!userCode) return [];
  return db.activity.findMany({
    where: { userCode },
    orderBy: { date: "asc" },
  });
}

export async function getAllBusinessTrips(userCode: string | null) {
  if (!userCode) return [];
  return db.businessTrip.findMany({
    where: { userCode },
    orderBy: { startDate: "asc" },
  });
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

  const delegationDays = activeTrip
    ? buildDelegationDays(activeTrip, delegationActivities, dateParam)
    : [];

  return {
    date: dayStart,
    dateParam: formatDateParam(dayStart),
    activities,
    activeTrip,
    delegationActivities,
    delegationDays,
  };
}

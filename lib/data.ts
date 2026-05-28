import type { Activity } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildDelegationDays } from "@/lib/delegation";
import {
  endOfDay,
  formatDateParam,
  parseDateParam,
  startOfDay,
} from "@/lib/dates";

export async function getAllActivities() {
  return prisma.activity.findMany({ orderBy: { date: "asc" } });
}

export async function getAllBusinessTrips() {
  return prisma.businessTrip.findMany({ orderBy: { startDate: "asc" } });
}

export async function getActivitiesAndTripsInRange(rangeStart: Date, rangeEnd: Date) {
  const start = startOfDay(rangeStart);
  const end = endOfDay(rangeEnd);

  const [activities, trips] = await Promise.all([
    prisma.activity.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
    prisma.businessTrip.findMany({
      where: {
        startDate: { lte: end },
        endDate: { gte: start },
      },
      orderBy: { startDate: "asc" },
    }),
  ]);

  return { activities, trips };
}

export async function getDayDetails(dateParam: string) {
  const date = parseDateParam(dateParam);
  if (!date) return null;

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const activeTrip = await prisma.businessTrip.findFirst({
    where: {
      startDate: { lte: dayEnd },
      endDate: { gte: dayStart },
    },
    orderBy: { startDate: "asc" },
  });

  let activities: Activity[];
  let delegationActivities: Activity[];

  if (activeTrip) {
    const tripStart = startOfDay(activeTrip.startDate);
    const tripEnd = endOfDay(activeTrip.endDate);

    delegationActivities = await prisma.activity.findMany({
      where: {
        date: { gte: tripStart, lte: tripEnd },
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    });

    activities = delegationActivities.filter(
      (a) => a.date >= dayStart && a.date <= dayEnd,
    );
  } else {
    delegationActivities = [];
    activities = await prisma.activity.findMany({
      where: { date: { gte: dayStart, lte: dayEnd } },
      orderBy: { createdAt: "asc" },
    });
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

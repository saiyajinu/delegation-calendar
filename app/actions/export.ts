"use server";

import { getActivitiesAndTripsInRange } from "@/lib/data";
import {
  buildExportFilename,
  formatCalendarExport,
  getLast30DaysRange,
} from "@/lib/export";

export type ExportResult =
  | { ok: true; text: string; filename: string }
  | { ok: false; error: string };

export async function exportLast30Days(): Promise<ExportResult> {
  try {
    const { start, end } = getLast30DaysRange();
    const { activities, trips } = await getActivitiesAndTripsInRange(start, end);
    const text = formatCalendarExport(activities, trips, start, end);
    const filename = buildExportFilename(start, end);

    return { ok: true, text, filename };
  } catch {
    return { ok: false, error: "Export failed. Please try again." };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { eachDayInclusive, formatDateParam, parseDateParam } from "@/lib/dates";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createBusinessTrip(
  formData: FormData,
): Promise<ActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const startStr = String(formData.get("startDate") ?? "").trim();
  const endStr = String(formData.get("endDate") ?? "").trim();

  if (!title) {
    return { ok: false, error: "Title is required." };
  }
  if (!city) {
    return { ok: false, error: "City is required." };
  }

  const startDate = parseDateParam(startStr);
  const endDate = parseDateParam(endStr);

  if (!startDate || !endDate) {
    return { ok: false, error: "Valid start and end dates are required." };
  }
  if (endDate < startDate) {
    return { ok: false, error: "End date must be on or after start date." };
  }

  await prisma.businessTrip.create({
    data: {
      title,
      city,
      notes: notes || null,
      startDate,
      endDate,
    },
  });

  revalidatePath("/");
  for (const day of eachDayInclusive(startDate, endDate)) {
    revalidatePath(`/day/${formatDateParam(day)}`);
  }

  const viewingDay = String(formData.get("viewingDay") ?? "").trim();
  if (viewingDay && parseDateParam(viewingDay)) {
    revalidatePath(`/day/${viewingDay}`);
  }

  return { ok: true };
}

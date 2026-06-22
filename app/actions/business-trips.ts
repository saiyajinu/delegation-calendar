"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { eachDayInclusive, formatDateParam, parseDateParam } from "@/lib/dates";
import { normalizeUserCode } from "@/lib/user-code";

export type ActionResult = { ok: true } | { ok: false; error: string };

function getUserCode(formData: FormData): string | null {
  return normalizeUserCode(String(formData.get("userCode") ?? ""));
}

function parseLocationId(formData: FormData): string | null {
  const raw = String(formData.get("locationId") ?? "").trim();
  return raw || null;
}

export async function createBusinessTrip(
  formData: FormData,
): Promise<ActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const startStr = String(formData.get("startDate") ?? "").trim();
  const endStr = String(formData.get("endDate") ?? "").trim();
  const userCode = getUserCode(formData);

  if (!userCode) {
    return { ok: false, error: "A valid user code is required." };
  }
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

  await db.businessTrip.create({
    title,
    city,
    notes: notes || null,
    startDate,
    endDate,
    userCode,
    locationId: parseLocationId(formData),
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

export async function updateBusinessTrip(
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get("id") ?? 0);
  const title = String(formData.get("title") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const startStr = String(formData.get("startDate") ?? "").trim();
  const endStr = String(formData.get("endDate") ?? "").trim();
  const userCode = getUserCode(formData);

  if (!id) {
    return { ok: false, error: "Trip ID is required." };
  }
  if (!userCode) {
    return { ok: false, error: "A valid user code is required." };
  }
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

  await db.businessTrip.update(id, {
    title,
    city,
    notes: notes || null,
    startDate,
    endDate,
    userCode,
    locationId: parseLocationId(formData),
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

export async function deleteBusinessTrip(
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get("id") ?? 0);
  const userCode = getUserCode(formData);

  if (!id) {
    return { ok: false, error: "Trip ID is required." };
  }

  if (!userCode) {
    return { ok: false, error: "A valid user code is required." };
  }

  await db.businessTrip.delete(id, userCode);

  revalidatePath("/");

  const viewingDay = String(formData.get("viewingDay") ?? "").trim();
  if (viewingDay && parseDateParam(viewingDay)) {
    revalidatePath(`/day/${viewingDay}`);
  }

  return { ok: true };
}

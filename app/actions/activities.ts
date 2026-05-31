"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { parseDateParam } from "@/lib/dates";
import { normalizeUserCode } from "@/lib/user-code";

export type ActionResult = { ok: true } | { ok: false; error: string };

function getUserCode(formData: FormData): string | null {
  return normalizeUserCode(String(formData.get("userCode") ?? ""));
}

export async function createActivity(formData: FormData): Promise<ActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dateStr = String(formData.get("date") ?? "").trim();
  const userCode = getUserCode(formData);

  if (!userCode) {
    return { ok: false, error: "A valid user code is required." };
  }

  if (!title) {
    return { ok: false, error: "Title is required." };
  }

  const date = parseDateParam(dateStr);
  if (!date) {
    return { ok: false, error: "A valid date is required." };
  }

  await db.activity.create({
    title,
    description: description || null,
    date,
    userCode,
  });

  revalidatePath("/");
  revalidatePath(`/day/${dateStr}`);

  const viewingDay = String(formData.get("viewingDay") ?? "").trim();
  if (viewingDay && viewingDay !== dateStr && parseDateParam(viewingDay)) {
    revalidatePath(`/day/${viewingDay}`);
  }

  return { ok: true };
}

export async function updateActivity(formData: FormData): Promise<ActionResult> {
  const id = Number(formData.get("id") ?? 0);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dateStr = String(formData.get("date") ?? "").trim();
  const userCode = getUserCode(formData);

  if (!id) {
    return { ok: false, error: "Activity ID is required." };
  }

  if (!userCode) {
    return { ok: false, error: "A valid user code is required." };
  }

  if (!title) {
    return { ok: false, error: "Title is required." };
  }

  const date = parseDateParam(dateStr);
  if (!date) {
    return { ok: false, error: "A valid date is required." };
  }

  await db.activity.update(id, {
    title,
    description: description || null,
    date,
    userCode,
  });

  revalidatePath("/");
  revalidatePath(`/day/${dateStr}`);

  const viewingDay = String(formData.get("viewingDay") ?? "").trim();
  if (viewingDay && parseDateParam(viewingDay)) {
    revalidatePath(`/day/${viewingDay}`);
  }

  return { ok: true };
}

export async function deleteActivity(formData: FormData): Promise<ActionResult> {
  const id = Number(formData.get("id") ?? 0);
  const dateStr = String(formData.get("date") ?? "").trim();
  const userCode = getUserCode(formData);

  if (!id) {
    return { ok: false, error: "Activity ID is required." };
  }

  if (!userCode) {
    return { ok: false, error: "A valid user code is required." };
  }

  await db.activity.delete(id, userCode);

  revalidatePath("/");
  revalidatePath(`/day/${dateStr}`);

  const viewingDay = String(formData.get("viewingDay") ?? "").trim();
  if (viewingDay && parseDateParam(viewingDay)) {
    revalidatePath(`/day/${viewingDay}`);
  }

  return { ok: true };
}

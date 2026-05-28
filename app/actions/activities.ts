"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseDateParam } from "@/lib/dates";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createActivity(formData: FormData): Promise<ActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dateStr = String(formData.get("date") ?? "").trim();

  if (!title) {
    return { ok: false, error: "Title is required." };
  }

  const date = parseDateParam(dateStr);
  if (!date) {
    return { ok: false, error: "A valid date is required." };
  }

  await prisma.activity.create({
    data: {
      title,
      description: description || null,
      date,
    },
  });

  revalidatePath("/");
  revalidatePath(`/day/${dateStr}`);

  const viewingDay = String(formData.get("viewingDay") ?? "").trim();
  if (viewingDay && viewingDay !== dateStr && parseDateParam(viewingDay)) {
    revalidatePath(`/day/${viewingDay}`);
  }

  return { ok: true };
}

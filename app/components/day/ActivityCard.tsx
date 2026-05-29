"use client";

import { useState } from "react";
import { Trash2, Edit2 } from "lucide-react";
import type { Activity } from "@/lib/db";
import { deleteActivity } from "@/app/actions/activities";
import { ActivityEditModal } from "@/app/components/day/ActivityEditModal";

type ActivityCardProps = {
  activity: Activity;
  dateParam: string;
  viewingDayParam?: string;
};

export function ActivityCard({
  activity,
  dateParam,
  viewingDayParam,
}: ActivityCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this activity?")) return;
    setIsDeleting(true);

    const formData = new FormData();
    formData.set("id", String(activity.id));
    formData.set("date", dateParam);
    if (viewingDayParam) formData.set("viewingDay", viewingDayParam);

    await deleteActivity(formData);
  }

  return (
    <>
      <li className="group rounded-xl border border-rose-200 bg-white p-4 shadow-sm shadow-rose-100/30 transition-all hover:border-rose-300 hover:bg-rose-50/50 hover:shadow-md hover:shadow-rose-100/50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-medium text-rose-950">{activity.title}</h3>
            {activity.description && (
              <p className="mt-2 text-sm leading-relaxed text-rose-700">
                {activity.description}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setEditOpen(true)}
              className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
              title="Edit activity"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors disabled:opacity-50"
              title="Delete activity"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </li>
      <ActivityEditModal
        activity={activity}
        dateParam={dateParam}
        viewingDayParam={viewingDayParam}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}

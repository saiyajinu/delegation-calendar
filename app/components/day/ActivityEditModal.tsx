"use client";

import { useState } from "react";
import type { Activity } from "@/lib/db";
import { updateActivity } from "@/app/actions/activities";
import { getPersistedUserCode } from "@/lib/user-code";
import { Modal } from "@/app/components/ui/Modal";
import { formatDateParam, parseDateParam } from "@/lib/dates";

type ActivityEditModalProps = {
  activity: Activity;
  dateParam: string;
  viewingDayParam?: string;
  open: boolean;
  onClose: () => void;
};

export function ActivityEditModal({
  activity,
  dateParam,
  viewingDayParam,
  open,
  onClose,
}: ActivityEditModalProps) {
  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description || "");
  const [date, setDate] = useState(formatDateParam(activity.date));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const userCode = getPersistedUserCode();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData();
    formData.set("id", String(activity.id));
    formData.set("title", title);
    formData.set("description", description);
    formData.set("date", date);
    if (viewingDayParam) formData.set("viewingDay", viewingDayParam);
    if (userCode) formData.set("userCode", userCode);

    const result = await updateActivity(formData);
    if (result.ok) {
      onClose();
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit activity" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-rose-950">
            Activity
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What did you do?"
            className="mt-1 w-full rounded-lg border border-rose-200 px-4 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-rose-950">
            Notes (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any additional details..."
            rows={3}
            className="mt-1 w-full rounded-lg border border-rose-200 px-4 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-rose-950">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-rose-200 px-4 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

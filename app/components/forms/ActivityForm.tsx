"use client"

import { useState, useTransition } from "react";
import { createActivity } from "@/app/actions/activities";
import { getPersistedUserCode } from "@/lib/user-code";
import { Button } from "@/app/components/ui/Button";
import { LocationPicker } from "@/app/components/forms/LocationPicker";

type ActivityFormProps = {
  defaultDate: string;
  viewingDay?: string;
  onSuccess?: () => void;
};

export function ActivityForm({ defaultDate, viewingDay, onSuccess }: ActivityFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const userCode = getPersistedUserCode();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createActivity(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSuccess?.();
      (document.getElementById("activity-form") as HTMLFormElement)?.reset();
    });
  }

  return (
    <form id="activity-form" action={handleSubmit} className="space-y-4">
      {viewingDay && <input type="hidden" name="viewingDay" value={viewingDay} />}
      {userCode && <input type="hidden" name="userCode" value={userCode} />}
      <div>
        <label htmlFor="activity-title" className="mb-1 block text-sm font-medium text-rose-900">
          Title
        </label>
        <input
          id="activity-title"
          name="title"
          required
          className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring-2"
          placeholder="Team standup"
        />
      </div>
      <div>
        <label htmlFor="activity-description" className="mb-1 block text-sm font-medium text-rose-900">
          Description <span className="font-normal text-rose-400">(optional)</span>
        </label>
        <textarea
          id="activity-description"
          name="description"
          rows={3}
          className="w-full resize-none rounded-lg border border-rose-200 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring-2"
          placeholder="Notes about what you did..."
        />
      </div>
      <div>
        <label htmlFor="activity-date" className="mb-1 block text-sm font-medium text-rose-900">
          Date
        </label>
        <input
          id="activity-date"
          name="date"
          type="date"
          required
          defaultValue={defaultDate}
          className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring-2"
        />
      </div>
      <LocationPicker />
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" isLoading={isPending} className="w-full">
        Add activity
      </Button>
    </form>
  );
}

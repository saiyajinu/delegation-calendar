"use client";

import { useState, useTransition } from "react";
import { createBusinessTrip } from "@/app/actions/business-trips";
import { Button } from "@/app/components/ui/Button";

type BusinessTripFormProps = {
  defaultStartDate: string;
  defaultEndDate?: string;
  viewingDay?: string;
  onSuccess?: () => void;
};

export function BusinessTripForm({
  defaultStartDate,
  defaultEndDate,
  viewingDay,
  onSuccess,
}: BusinessTripFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createBusinessTrip(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSuccess?.();
      (document.getElementById("trip-form") as HTMLFormElement)?.reset();
    });
  }

  return (
    <form id="trip-form" action={handleSubmit} className="space-y-4">
      {viewingDay && <input type="hidden" name="viewingDay" value={viewingDay} />}
      <div>
        <label htmlFor="trip-title" className="mb-1 block text-sm font-medium text-rose-900">
          Title
        </label>
        <input
          id="trip-title"
          name="title"
          required
          className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring-2"
          placeholder="Q2 client visit"
        />
      </div>
      <div>
        <label htmlFor="trip-city" className="mb-1 block text-sm font-medium text-rose-900">
          City
        </label>
        <input
          id="trip-city"
          name="city"
          required
          className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring-2"
          placeholder="Berlin"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="trip-start" className="mb-1 block text-sm font-medium text-rose-900">
            Start date
          </label>
          <input
            id="trip-start"
            name="startDate"
            type="date"
            required
            defaultValue={defaultStartDate}
            className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="trip-end" className="mb-1 block text-sm font-medium text-rose-900">
            End date
          </label>
          <input
            id="trip-end"
            name="endDate"
            type="date"
            required
            defaultValue={defaultEndDate ?? defaultStartDate}
            className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring-2"
          />
        </div>
      </div>
      <div>
        <label htmlFor="trip-notes" className="mb-1 block text-sm font-medium text-rose-900">
          Notes <span className="font-normal text-rose-400">(optional)</span>
        </label>
        <textarea
          id="trip-notes"
          name="notes"
          rows={3}
          className="w-full resize-none rounded-lg border border-rose-200 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring-2"
          placeholder="Flight details, hotel, etc."
        />
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" isLoading={isPending} className="w-full">
        Add business trip
      </Button>
    </form>
  );
}

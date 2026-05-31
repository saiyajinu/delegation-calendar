"use client";

import { useState } from "react";
import type { BusinessTrip } from "@/lib/db";
import { updateBusinessTrip } from "@/app/actions/business-trips";
import { getPersistedUserCode } from "@/lib/user-code";
import { Modal } from "@/app/components/ui/Modal";
import { formatDateParam } from "@/lib/dates";

type BusinessTripEditModalProps = {
  trip: BusinessTrip;
  viewingDayParam?: string;
  open: boolean;
  onClose: () => void;
};

export function BusinessTripEditModal({
  trip,
  viewingDayParam,
  open,
  onClose,
}: BusinessTripEditModalProps) {
  const [title, setTitle] = useState(trip.title);
  const [city, setCity] = useState(trip.city);
  const [notes, setNotes] = useState(trip.notes || "");
  const [startDate, setStartDate] = useState(formatDateParam(trip.startDate));
  const [endDate, setEndDate] = useState(formatDateParam(trip.endDate));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const userCode = getPersistedUserCode();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData();
    formData.set("id", String(trip.id));
    formData.set("title", title);
    formData.set("city", city);
    formData.set("notes", notes);
    formData.set("startDate", startDate);
    formData.set("endDate", endDate);
    if (viewingDayParam) formData.set("viewingDay", viewingDayParam);
    if (userCode) formData.set("userCode", userCode);

    const result = await updateBusinessTrip(formData);
    if (result.ok) {
      onClose();
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit business trip" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-rose-950">
            Trip title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Q1 Conference"
            className="mt-1 w-full rounded-lg border border-rose-200 px-4 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-rose-950">
            City
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Where are you going?"
            className="mt-1 w-full rounded-lg border border-rose-200 px-4 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
            disabled={isLoading}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-rose-950">
              Start date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-rose-200 px-4 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-rose-950">
              End date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-rose-200 px-4 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-rose-950">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional details..."
            rows={3}
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

"use client";

import { useState } from "react";
import { MapPin, Plane, Trash2, Edit2 } from "lucide-react";
import type { BusinessTrip } from "@/lib/db";
import { deleteBusinessTrip } from "@/app/actions/business-trips";
import { BusinessTripEditModal } from "@/app/components/day/BusinessTripEditModal";
import { formatTripDuration } from "@/lib/dates";

type BusinessTripCardProps = {
  trip: BusinessTrip;
  viewingDayParam?: string;
};

export function BusinessTripCard({
  trip,
  viewingDayParam,
}: BusinessTripCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this business trip? This will also remove all associated activities.")) return;
    setIsDeleting(true);

    const formData = new FormData();
    formData.set("id", String(trip.id));
    if (viewingDayParam) formData.set("viewingDay", viewingDayParam);

    await deleteBusinessTrip(formData);
  }

  return (
    <>
      <section className="group rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-6 shadow-sm shadow-pink-100/40 transition-all hover:border-pink-300 hover:shadow-md hover:shadow-pink-100/60">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-sm">
              <Plane className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-rose-950">
                {trip.title}
              </h2>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-pink-800">
                <MapPin className="h-3.5 w-3.5" />
                {trip.city}
              </p>
              <p className="mt-1 text-sm text-rose-700">
                {formatTripDuration(trip.startDate, trip.endDate)}
              </p>
              {trip.notes && (
                <p className="mt-3 rounded-lg bg-white/70 px-4 py-3 text-sm text-rose-800">
                  {trip.notes}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => setEditOpen(true)}
              className="p-2 text-rose-600 hover:bg-pink-100 rounded-lg transition-colors"
              title="Edit trip"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-rose-600 hover:bg-pink-100 rounded-lg transition-colors disabled:opacity-50"
              title="Delete trip"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
      <BusinessTripEditModal
        trip={trip}
        viewingDayParam={viewingDayParam}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}

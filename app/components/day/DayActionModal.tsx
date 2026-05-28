"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Plane } from "lucide-react";
import { Modal } from "@/app/components/ui/Modal";
import { ActivityForm } from "@/app/components/forms/ActivityForm";
import { BusinessTripForm } from "@/app/components/forms/BusinessTripForm";
import { formatDisplayDate, parseDateParam } from "@/lib/dates";

type Tab = "menu" | "activity" | "trip";

type DayActionModalProps = {
  open: boolean;
  dateParam: string | null;
  onClose: () => void;
  onCreated?: () => void;
  /** Hide “View day details” when already on the day page */
  showDayDetailsLink?: boolean;
  /** Day page being viewed — keeps delegation overview fresh after add */
  viewingDayParam?: string;
};

export function DayActionModal({
  open,
  dateParam,
  onClose,
  onCreated,
  showDayDetailsLink = true,
  viewingDayParam,
}: DayActionModalProps) {
  const [tab, setTab] = useState<Tab>("menu");

  const date = dateParam ? parseDateParam(dateParam) : null;
  const displayDate = date ? formatDisplayDate(date) : "";

  useEffect(() => {
    if (open) setTab("menu");
  }, [open, dateParam]);

  function handleClose() {
    setTab("menu");
    onClose();
  }

  function handleSuccess() {
    onCreated?.();
    handleClose();
  }

  if (!dateParam || !date) return null;

  const titles: Record<Tab, string> = {
    menu: displayDate,
    activity: "Add activity",
    trip: "Add business trip",
  };

  return (
    <Modal open={open} onClose={handleClose} title={titles[tab]} size="lg">
      {tab === "menu" && (
        <div className="space-y-4">
          <p className="text-sm text-rose-600">
            Log what you did or plan a multi-day business trip.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setTab("activity")}
              className="flex flex-col items-start gap-2 rounded-xl border border-rose-200 p-4 text-left transition-colors hover:border-violet-200 hover:bg-violet-50/80"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <CalendarDays className="h-5 w-5" />
              </span>
              <span className="font-medium text-rose-950">Add activity</span>
              <span className="text-sm text-rose-600">Single-day log entry</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("trip")}
              className="flex flex-col items-start gap-2 rounded-xl border border-rose-200 p-4 text-left transition-colors hover:border-pink-200 hover:bg-pink-50/80"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                <Plane className="h-5 w-5" />
              </span>
              <span className="font-medium text-rose-950">Add business trip</span>
              <span className="text-sm text-rose-600">Spans multiple days</span>
            </button>
          </div>
          {showDayDetailsLink && (
            <Link
              href={`/day/${dateParam}`}
              onClick={handleClose}
              className="block w-full rounded-lg border border-rose-200 py-2.5 text-center text-sm font-medium text-rose-800 transition-colors hover:bg-rose-50"
            >
              View day details →
            </Link>
          )}
        </div>
      )}
      {tab === "activity" && (
        <div>
          <button
            type="button"
            onClick={() => setTab("menu")}
            className="mb-4 text-sm text-rose-600 hover:text-rose-900"
          >
            ← Back
          </button>
          <ActivityForm
            defaultDate={dateParam}
            viewingDay={viewingDayParam}
            onSuccess={handleSuccess}
          />
        </div>
      )}
      {tab === "trip" && (
        <div>
          <button
            type="button"
            onClick={() => setTab("menu")}
            className="mb-4 text-sm text-rose-600 hover:text-rose-900"
          >
            ← Back
          </button>
          <BusinessTripForm
            defaultStartDate={dateParam}
            defaultEndDate={dateParam}
            viewingDay={viewingDayParam}
            onSuccess={handleSuccess}
          />
        </div>
      )}
    </Modal>
  );
}

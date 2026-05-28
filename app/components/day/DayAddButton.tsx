"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { DayActionModal } from "@/app/components/day/DayActionModal";

type DayAddButtonProps = {
  dateParam: string;
  /** Current day page URL segment — refreshes delegation view after add */
  viewingDayParam?: string;
  label?: string;
  variant?: "link" | "button";
  className?: string;
};

export function DayAddButton({
  dateParam,
  viewingDayParam,
  label = "Add",
  variant = "link",
  className,
}: DayAddButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const linkClass =
    className ??
    "text-sm font-medium text-rose-700 transition-colors hover:text-rose-950";
  const buttonClass =
    className ??
    "inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 shadow-sm shadow-rose-200";

  return (
    <>
      {variant === "link" ? (
        <button type="button" onClick={() => setOpen(true)} className={linkClass}>
          {label}
        </button>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
          <Plus className="h-4 w-4" aria-hidden />
          {label}
        </button>
      )}
      <DayActionModal
        open={open}
        dateParam={dateParam}
        viewingDayParam={viewingDayParam}
        onClose={() => setOpen(false)}
        onCreated={() => router.refresh()}
        showDayDetailsLink={false}
      />
    </>
  );
}

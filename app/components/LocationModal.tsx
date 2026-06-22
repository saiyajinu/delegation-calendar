"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  mobileBottomSheet?: boolean;
};

export function LocationModal({
  open,
  onClose,
  title,
  children,
  mobileBottomSheet = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const panelClasses = mobileBottomSheet
    ? "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border border-rose-200 bg-white shadow-2xl shadow-rose-300/40 animate-in fade-in duration-200 sm:inset-auto sm:relative sm:max-h-none sm:w-full sm:max-w-lg sm:rounded-2xl"
    : "relative w-full max-w-lg rounded-2xl border border-rose-200 bg-white shadow-xl shadow-rose-200/50 animate-in fade-in zoom-in-95 duration-200";

  return (
    <div
      className={`fixed inset-0 z-50 flex ${mobileBottomSheet ? "items-end sm:items-center sm:justify-center sm:p-4" : "items-center justify-center p-4"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-rose-950/30 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div ref={panelRef} className={panelClasses}>
        {mobileBottomSheet && (
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="h-1.5 w-12 rounded-full bg-rose-200" />
          </div>
        )}
        <div className="flex items-center justify-between border-b border-rose-100 px-5 py-4 sm:px-6">
          <h2 id="location-modal-title" className="text-lg font-semibold text-rose-950">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}

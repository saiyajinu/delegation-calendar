"use client";

import { useEffect, useState } from "react";
import { fetchLocationDetailsAction } from "@/app/actions/locations";
import { POPUP_PREVIEW_FIELD_LIMIT } from "@/lib/location-field-presets";
import type { LocationField } from "@/server/locations";

type MarkerPopupProps = {
  locationId: string;
  name: string;
  onOpenDetails: (id: string) => void;
};

export function MarkerPopup({ locationId, name, onOpenDetails }: MarkerPopupProps) {
  const [fields, setFields] = useState<LocationField[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFields(null);

    fetchLocationDetailsAction(locationId).then((result) => {
      if (cancelled) return;
      if (result.ok && result.data) {
        setFields(result.data.fields.slice(0, POPUP_PREVIEW_FIELD_LIMIT));
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [locationId]);

  return (
    <div className="min-w-[11rem] max-w-[14rem] space-y-3 p-1">
      <p className="text-sm font-semibold text-rose-950">{name}</p>

      {loading ? (
        <p className="text-xs text-rose-500">Loading details…</p>
      ) : fields && fields.length > 0 ? (
        <dl className="space-y-2 border-t border-rose-100 pt-2">
          {fields.map((field) => (
            <div key={field.id}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-500">
                {field.fieldName}
              </dt>
              <dd className="mt-0.5 text-sm leading-snug text-rose-800">
                {field.fieldValue?.trim() || "—"}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <button
        type="button"
        onClick={() => onOpenDetails(locationId)}
        className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
      >
        Open Details
      </button>
    </div>
  );
}

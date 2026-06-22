"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
import { fetchLocationsAction } from "@/app/actions/locations";
import type { LocationSummary } from "@/server/locations";

type LocationPickerProps = {
  name?: string;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (locationId: string | null, location: LocationSummary | null) => void;
  label?: string;
  helpText?: string;
};

export function LocationPicker({
  name = "locationId",
  value,
  defaultValue = null,
  onChange,
  label = "Map location",
  helpText = "Optional — link this entry to a pin on the Romania map.",
}: LocationPickerProps) {
  const [locations, setLocations] = useState<LocationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(defaultValue);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchLocationsAction().then((result) => {
      if (cancelled) return;
      if (result.ok && result.data) {
        setLocations(result.data);
      } else if (!result.ok) {
        setError(result.error);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedId(value);
    }
  }, [value]);

  const selected = locations.find((location) => location.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return locations;
    return locations.filter((location) =>
      location.name.toLowerCase().includes(normalized)
    );
  }, [locations, query]);

  function selectLocation(location: LocationSummary | null) {
    const nextId = location?.id ?? null;
    setSelectedId(nextId);
    onChange?.(nextId, location);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-rose-900">
          {label} <span className="font-normal text-rose-400">(optional)</span>
        </label>
        <Link
          href="/map"
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 transition-colors hover:text-emerald-900"
        >
          <MapPin className="h-3.5 w-3.5" />
          Open map
        </Link>
      </div>

      <input type="hidden" name={name} value={selectedId ?? ""} />

      {selected ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2.5">
          <MapPin className="h-4 w-4 shrink-0 text-emerald-700" />
          <span className="flex-1 text-sm font-medium text-emerald-950">{selected.name}</span>
          <button
            type="button"
            onClick={() => selectLocation(null)}
            className="rounded-lg p-2 text-emerald-700 transition-colors hover:bg-emerald-100"
            aria-label="Clear location"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="flex min-h-11 w-full items-center justify-between rounded-xl border border-rose-200 bg-white px-4 py-3 text-left text-sm transition-colors hover:border-rose-300 hover:bg-rose-50/50"
          >
            <span className="text-rose-500">
              {loading ? "Loading locations…" : "Choose a map location"}
            </span>
            <Search className="h-4 w-4 text-rose-400" />
          </button>

          {open && (
            <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-xl shadow-rose-100/80">
              <div className="border-b border-rose-100 p-3">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search locations…"
                  autoFocus
                  className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm outline-none ring-rose-300 focus:border-rose-400 focus:ring-2"
                />
              </div>
              <ul className="max-h-52 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-rose-500">
                    {locations.length === 0
                      ? "No map pins yet. Add one on the Romania map."
                      : "No locations match your search."}
                  </li>
                ) : (
                  filtered.map((location) => (
                    <li key={location.id}>
                      <button
                        type="button"
                        onClick={() => selectLocation(location)}
                        className="flex min-h-11 w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-rose-950 transition-colors hover:bg-rose-50"
                      >
                        <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
                        {location.name}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {helpText ? <p className="text-xs text-rose-500">{helpText}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

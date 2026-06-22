"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { searchPlacesAction } from "@/app/actions/geocoding";
import type { PlaceSearchResult } from "@/lib/geocoding";

type MapSearchProps = {
  onSelect: (result: PlaceSearchResult) => void;
};

export function MapSearch({ onSelect }: MapSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const timeout = window.setTimeout(() => {
      const requestId = ++requestIdRef.current;

      searchPlacesAction(trimmed).then((result) => {
        if (requestId !== requestIdRef.current) return;

        if (!result.ok) {
          setResults([]);
          setError(result.error);
          setOpen(true);
          return;
        }

        setResults(result.data);
        setOpen(true);
        if (result.data.length === 0) {
          setError('No Romanian matches found. Try adding a city, e.g. "egger chitila".');
        }
      }).finally(() => {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      });
    }, 450);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query]);

  function handleSelect(result: PlaceSearchResult) {
    onSelect(result);
    setQuery(result.name);
    setOpen(false);
    setResults([]);
    setError(null);
  }

  function handleClear() {
    setQuery("");
    setResults([]);
    setError(null);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-3 shadow-lg shadow-rose-200/60">
        <Search className="h-5 w-5 shrink-0 text-rose-400" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0 || error) setOpen(true);
          }}
          placeholder="Search Romanian companies, cities, addresses…"
          className="min-h-6 w-full bg-transparent text-sm text-rose-950 outline-none placeholder:text-rose-400"
          aria-label="Search places in Romania"
          autoComplete="off"
        />
        <span className="hidden shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700 sm:inline">
          Romania only
        </span>
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-rose-400" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg p-1 text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-700"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {open && (results.length > 0 || error) ? (
        <ul className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-rose-200 bg-white py-1 shadow-xl shadow-rose-200/70">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(result)}
                className="flex min-h-14 w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-rose-50"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  <span className="block text-sm font-medium text-rose-950">{result.name}</span>
                  {result.subtitle ? (
                    <span className="mt-0.5 block text-xs text-rose-500">{result.subtitle}</span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
          {error && results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-rose-500">{error}</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

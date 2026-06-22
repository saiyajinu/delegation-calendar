"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { MapPin } from "lucide-react";
import {
  createLocationAction,
  fetchLocationDetailsAction,
} from "@/app/actions/locations";
import { LocationDetailsPanel } from "@/app/components/LocationDetails";
import { LocationModal } from "@/app/components/LocationModal";
import { Button } from "@/app/components/ui/Button";
import type { LocationDetails, LocationSummary } from "@/server/locations";

const RomaniaMap = dynamic(
  () => import("@/app/components/RomaniaMap").then((mod) => mod.RomaniaMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-rose-50 text-sm text-rose-600">
        Loading map…
      </div>
    ),
  }
);

type MapPageClientProps = {
  initialLocations: LocationSummary[];
};

export function MapPageClient({ initialLocations }: MapPageClientProps) {
  const [locations, setLocations] = useState(initialLocations);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [newName, setNewName] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<LocationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleMapClick(lat: number, lng: number) {
    setPendingCoords({ lat, lng });
    setNewName("");
    setError(null);
    setAddModalOpen(true);
  }

  function handleOpenDetails(id: string) {
    startTransition(async () => {
      const result = await fetchLocationDetailsAction(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (!result.data) {
        setError("Failed to load location details.");
        return;
      }
      setSelectedDetails(result.data);
      setDetailsOpen(true);
      setError(null);
    });
  }

  function handleCreateLocation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pendingCoords) return;

    startTransition(async () => {
      const result = await createLocationAction({
        name: newName,
        lat: pendingCoords.lat,
        lng: pendingCoords.lng,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (!result.data) {
        setError("Failed to create location.");
        return;
      }

      const created = result.data;
      setLocations((current) => [...current, created]);
      setAddModalOpen(false);
      setPendingCoords(null);
      setNewName("");
      setError(null);
    });
  }

  function handleLocationUpdated(location: LocationSummary) {
    setLocations((current) =>
      current.map((item) => (item.id === location.id ? location : item))
    );
    setSelectedDetails((current) =>
      current && current.id === location.id ? { ...current, ...location } : current
    );
  }

  function handleLocationDeleted(id: string) {
    setLocations((current) => current.filter((item) => item.id !== id));
    setSelectedDetails(null);
    setDetailsOpen(false);
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="border-b border-rose-200 bg-white/90 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-rose-700">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>Tap anywhere on the map to add a pin</span>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-rose-500">
            {locations.length} pins
          </p>
        </div>
        {error && !addModalOpen && !detailsOpen ? (
          <p className="mx-auto mt-2 max-w-6xl text-sm text-red-600">{error}</p>
        ) : null}
      </div>

      <div className="relative min-h-0 flex-1">
        <RomaniaMap
          locations={locations}
          onMapClick={handleMapClick}
          onOpenDetails={handleOpenDetails}
        />
      </div>

      <LocationModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setPendingCoords(null);
          setError(null);
        }}
        title="Add location"
      >
        <form onSubmit={handleCreateLocation} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="new-location-name" className="text-sm font-medium text-rose-900">
              Name *
            </label>
            <input
              id="new-location-name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Company or place name"
              required
              autoFocus
              className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-base outline-none ring-rose-300 focus:border-rose-400 focus:ring-2 sm:text-sm"
            />
          </div>
          {pendingCoords ? (
            <p className="text-xs text-rose-500">
              Coordinates: {pendingCoords.lat.toFixed(5)}, {pendingCoords.lng.toFixed(5)}
            </p>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" isLoading={isPending} className="min-h-11 w-full">
            Create location
          </Button>
        </form>
      </LocationModal>

      {selectedDetails ? (
        <LocationDetailsPanel
          location={selectedDetails}
          open={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedDetails(null);
          }}
          onUpdated={handleLocationUpdated}
          onDeleted={handleLocationDeleted}
        />
      ) : null}
    </div>
  );
}

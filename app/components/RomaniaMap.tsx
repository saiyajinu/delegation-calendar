"use client";

import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { ROMANIA_BOUNDS, ROMANIA_CENTER } from "@/lib/map-config";
import type { LocationSummary } from "@/server/locations";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type RomaniaMapProps = {
  locations: LocationSummary[];
  onMapClick: (lat: number, lng: number) => void;
  onOpenDetails: (id: string) => void;
};

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onMapClick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export function RomaniaMap({
  locations,
  onMapClick,
  onOpenDetails,
}: RomaniaMapProps) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={[ROMANIA_CENTER.lat, ROMANIA_CENTER.lng]}
      zoom={ROMANIA_CENTER.zoom}
      minZoom={6}
      maxBounds={ROMANIA_BOUNDS}
      maxBoundsViscosity={1}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />
      <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} spiderfyOnMaxZoom>
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={markerIcon}
            eventHandlers={{
              click: (event) => {
                event.originalEvent.stopPropagation();
              },
            }}
          >
            <Popup>
              <div className="min-w-[10rem] space-y-3 p-1">
                <p className="text-sm font-semibold text-rose-950">{location.name}</p>
                <button
                  type="button"
                  onClick={() => onOpenDetails(location.id)}
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                >
                  Open Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

"use client";

import { useEffect } from "react";
import L from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MarkerPopup } from "@/app/components/map/MarkerPopup";
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

type FlyTarget = {
  lat: number;
  lng: number;
  zoom?: number;
  key: number;
};

type RomaniaMapProps = {
  locations: LocationSummary[];
  onMapClick: (lat: number, lng: number) => void;
  onOpenDetails: (id: string) => void;
  flyTarget?: FlyTarget | null;
  previewPin?: { lat: number; lng: number } | null;
};

function FlyToHandler({ target }: { target: FlyTarget | null | undefined }) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], target.zoom ?? 15, { duration: 1.2 });
  }, [target, map]);

  return null;
}

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
  flyTarget,
  previewPin,
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
      <FlyToHandler target={flyTarget} />
      {previewPin ? (
        <CircleMarker
          center={[previewPin.lat, previewPin.lng]}
          radius={12}
          pathOptions={{
            color: "#047857",
            fillColor: "#10b981",
            fillOpacity: 0.85,
            weight: 3,
          }}
        />
      ) : null}
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
              <MarkerPopup
                locationId={location.id}
                name={location.name}
                onOpenDetails={onOpenDetails}
              />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

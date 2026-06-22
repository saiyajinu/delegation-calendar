import { AppHeader } from "@/app/components/layout/AppHeader";
import { MapPageClient } from "@/app/map/MapPageClient";
import { getLocations } from "@/server/locations";

export const metadata = {
  title: "Romania Map | Delegation Calendar",
  description: "Interactive map of business locations across Romania",
};

export default async function MapPage() {
  const locations = await getLocations();

  return (
    <>
      <AppHeader backHref="/" backLabel="← Calendar" active="map" />
      <MapPageClient initialLocations={locations} />
    </>
  );
}

import { AppHeader } from "@/app/components/layout/AppHeader";
import { MapPageClient } from "@/app/map/MapPageClient";
import { getLocations } from "@/server/locations";
import { cookies } from "next/headers";
import { normalizeUserCode } from "@/lib/user-code";

export const metadata = {
  title: "Romania Map | Delegation Calendar",
  description: "Interactive map of business locations across Romania",
};

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const requestCookies = await cookies();
  const userCode = normalizeUserCode(requestCookies.get("userCode")?.value ?? null);
  const locations = userCode ? await getLocations(userCode) : [];

  return (
    <>
      <AppHeader backHref="/" backLabel="← Calendar" active="map" />
      <MapPageClient initialLocations={locations} />
    </>
  );
}

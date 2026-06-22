import { getLocationNamesByIds } from "@/server/locations";

export type WithLocationName<T extends { locationId: string | null }> = T & {
  locationName: string | null;
};

export async function enrichWithLocationNames<T extends { locationId: string | null }>(
  items: T[],
  userCode: string | null
): Promise<WithLocationName<T>[]> {
  if (!userCode) {
    return items.map((item) => ({ ...item, locationName: null }));
  }

  const ids = items
    .map((item) => item.locationId)
    .filter((id): id is string => Boolean(id));
  const names = await getLocationNamesByIds(ids, userCode);

  return items.map((item) => ({
    ...item,
    locationName: item.locationId ? names[item.locationId] ?? null : null,
  }));
}

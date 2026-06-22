import { isWithinRomania, ROMANIA_BOUNDS, ROMANIA_CENTER } from "@/lib/map-config";

export type PlaceSearchResult = {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
};

const ROMANIA_SEARCH_HINTS = [
  "București",
  "Chitila",
  "Ilfov",
  "Cernica",
  "Cluj-Napoca",
  "Brașov",
  "Arad",
  "Rădăuți",
  "Timișoara",
  "Iași",
  "Constanța",
] as const;

type NominatimAddress = {
  road?: string;
  house_number?: string;
  industrial?: string;
  commercial?: string;
  retail?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
  country_code?: string;
};

type NominatimResult = {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  importance?: number;
  address?: NominatimAddress;
};

type PhotonProperties = {
  osm_type?: string;
  osm_id?: number;
  name?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  country?: string;
  countrycode?: string;
};

const NOMINATIM_USER_AGENT = "DelegationCalendar/1.0 (Romania map; contact: local-app)";

function getLocality(address?: NominatimAddress): string | undefined {
  if (!address) return undefined;
  return address.city || address.town || address.village || address.municipality || address.industrial;
}

function buildSubtitle(parts: string[]): string {
  const unique = [...new Set(parts.filter(Boolean))];
  if (!unique.some((part) => part.toLowerCase() === "romania")) {
    unique.push("Romania");
  }
  return unique.join(" · ");
}

function getNominatimName(item: NominatimResult): string {
  if (item.name?.trim()) return item.name.trim();

  const address = item.address;
  if (address?.commercial?.trim()) return address.commercial.trim();
  if (address?.retail?.trim()) return address.retail.trim();
  if (address?.industrial?.trim()) return address.industrial.trim();

  const street = [address?.road, address?.house_number].filter(Boolean).join(" ").trim();
  if (street) return street;

  return item.display_name.split(",")[0]?.trim() || "Unnamed place";
}

function getNominatimSubtitle(item: NominatimResult): string {
  const address = item.address;
  const name = item.name?.trim();
  const parts: string[] = [];

  const street = [address?.road, address?.house_number].filter(Boolean).join(" ").trim();
  const locality = getLocality(address);

  if (street && street !== name) parts.push(street);
  if (locality && locality !== name) parts.push(locality);
  if (address?.county && address.county !== locality) parts.push(address.county);
  else if (address?.state && address.state !== locality) parts.push(address.state);

  return buildSubtitle(parts);
}

function getPhotonName(properties: PhotonProperties): string {
  return (
    properties.name?.trim() ||
    [properties.street, properties.housenumber].filter(Boolean).join(" ").trim() ||
    properties.city?.trim() ||
    properties.town?.trim() ||
    properties.village?.trim() ||
    "Unnamed place"
  );
}

function getPhotonSubtitle(properties: PhotonProperties): string {
  const name = properties.name?.trim();
  const parts: string[] = [];
  const street = [properties.street, properties.housenumber].filter(Boolean).join(" ").trim();
  const locality = properties.city || properties.town || properties.village;

  if (street && street !== name) parts.push(street);
  if (locality && locality !== name) parts.push(locality);
  if (properties.county && properties.county !== locality) parts.push(properties.county);
  else if (properties.state && properties.state !== locality) parts.push(properties.state);

  return buildSubtitle(parts);
}

function isRomaniaCoordinates(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && isWithinRomania(lat, lng);
}

function isRomaniaCountry(countryCode?: string, country?: string): boolean {
  if (countryCode?.toLowerCase() === "ro") return true;
  const normalized = country?.toLowerCase() ?? "";
  return normalized.includes("romania") || normalized === "ro";
}

function shouldFanOut(query: string): boolean {
  const trimmed = query.trim();
  if (trimmed.length < 3) return false;
  if (trimmed.includes(",")) return false;
  return trimmed.split(/\s+/).length <= 2;
}

function buildSearchQueries(query: string): string[] {
  const trimmed = query.trim();
  const queries = new Set<string>([trimmed]);

  if (shouldFanOut(trimmed)) {
    for (const hint of ROMANIA_SEARCH_HINTS) {
      queries.add(`${trimmed} ${hint}`);
    }
    queries.add(`${trimmed} Romania`);
  }

  return [...queries];
}

function mergePlaceResults(results: PlaceSearchResult[], query: string): PlaceSearchResult[] {
  const seen = new Set<string>();
  const normalizedQuery = query.trim().toLowerCase();

  const unique = results.filter((result) => {
    const key = `${result.name.toLowerCase()}|${result.lat.toFixed(4)}|${result.lng.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.sort((a, b) => scorePlaceResult(b, normalizedQuery) - scorePlaceResult(a, normalizedQuery));
}

function scorePlaceResult(result: PlaceSearchResult, normalizedQuery: string): number {
  const name = result.name.toLowerCase();
  let score = 0;

  if (name === normalizedQuery) score += 10;
  else if (name.startsWith(normalizedQuery)) score += 7;
  else if (name.includes(normalizedQuery)) score += 5;

  if (result.subtitle.toLowerCase().includes(normalizedQuery)) score += 1;

  return score;
}

async function searchPhoton(query: string, limit = 10): Promise<PlaceSearchResult[]> {
  const [[minLat, minLng], [maxLat, maxLng]] = ROMANIA_BOUNDS;
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    lang: "en",
    lat: String(ROMANIA_CENTER.lat),
    lon: String(ROMANIA_CENTER.lng),
    bbox: `${minLng},${minLat},${maxLng},${maxLat}`,
  });

  const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    features?: Array<{
      geometry: { coordinates: [number, number] };
      properties: PhotonProperties;
    }>;
  };

  const results: PlaceSearchResult[] = [];

  for (const [index, feature] of (data.features ?? []).entries()) {
    const [lng, lat] = feature.geometry.coordinates;
    const properties = feature.properties;

    if (!isRomaniaCoordinates(lat, lng)) continue;

    const hasCountry = Boolean(properties.countrycode || properties.country);
    if (hasCountry && !isRomaniaCountry(properties.countrycode, properties.country)) {
      continue;
    }

    results.push({
      id: `photon-${properties.osm_type ?? "place"}-${properties.osm_id ?? index}`,
      name: getPhotonName(properties),
      subtitle: getPhotonSubtitle(properties),
      lat,
      lng,
    });
  }

  return results;
}

async function searchNominatim(query: string): Promise<PlaceSearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    addressdetails: "1",
    countrycodes: "ro",
    dedupe: "0",
    limit: "20",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
        "Accept-Language": "en,ro",
        "User-Agent": NOMINATIM_USER_AGENT,
      },
      next: { revalidate: 0 },
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as NominatimResult[];
  const results: PlaceSearchResult[] = [];

  for (const item of data) {
    const lat = Number(item.lat);
    const lng = Number(item.lon);
    if (!isRomaniaCoordinates(lat, lng)) continue;

    const countryCode = item.address?.country_code?.toLowerCase();
    const country = item.address?.country;
    if (countryCode && countryCode !== "ro") continue;
    if (country && !country.toLowerCase().includes("romania")) continue;

    results.push({
      id: `nominatim-${item.place_id}`,
      name: getNominatimName(item),
      subtitle: getNominatimSubtitle(item),
      lat,
      lng,
    });
  }

  return results;
}

async function searchOsmPlaces(query: string): Promise<PlaceSearchResult[]> {
  const queries = buildSearchQueries(query);
  const photonResults = await Promise.all(queries.map((entry) => searchPhoton(entry, 8)));
  const nominatimResults = await searchNominatim(query);

  return [...photonResults.flat(), ...nominatimResults];
}

export async function searchPlacesInRomania(query: string): Promise<PlaceSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const osmResults = await searchOsmPlaces(trimmed);
  return mergePlaceResults(osmResults, trimmed).slice(0, 15);
}

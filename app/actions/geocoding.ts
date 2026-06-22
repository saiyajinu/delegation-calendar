"use server";

import { searchPlacesInRomania, type PlaceSearchResult } from "@/lib/geocoding";

export type SearchPlacesResult =
  | { ok: true; data: PlaceSearchResult[] }
  | { ok: false; error: string };

export async function searchPlacesAction(query: string): Promise<SearchPlacesResult> {
  try {
    const data = await searchPlacesInRomania(query);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Search failed.",
    };
  }
}

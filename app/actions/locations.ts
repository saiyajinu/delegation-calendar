"use server";

import { revalidatePath } from "next/cache";
import {
  addLocationField,
  createLocation,
  deleteLocation,
  deleteLocationField,
  getLocationDetails,
  getLocations,
  updateLocation,
  updateLocationField,
  type LocationDetails,
  type LocationField,
  type LocationSummary,
} from "@/server/locations";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function fetchLocationsAction(): Promise<ActionResult<LocationSummary[]>> {
  try {
    const locations = await getLocations();
    return { ok: true, data: locations };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to load locations." };
  }
}

export async function fetchLocationDetailsAction(
  id: string
): Promise<ActionResult<LocationDetails>> {
  try {
    const details = await getLocationDetails(id);
    if (!details) {
      return { ok: false, error: "Location not found." };
    }
    return { ok: true, data: details };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to load location." };
  }
}

export async function createLocationAction(data: {
  name: string;
  lat: number;
  lng: number;
}): Promise<ActionResult<LocationSummary>> {
  try {
    const location = await createLocation(data);
    revalidatePath("/map");
    return { ok: true, data: location };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to create location." };
  }
}

export async function updateLocationAction(data: {
  id: string;
  name?: string;
  lat?: number;
  lng?: number;
}): Promise<ActionResult<LocationSummary>> {
  try {
    const location = await updateLocation(data);
    revalidatePath("/map");
    return { ok: true, data: location };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update location." };
  }
}

export async function deleteLocationAction(id: string): Promise<ActionResult> {
  try {
    await deleteLocation(id);
    revalidatePath("/map");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to delete location." };
  }
}

export async function addLocationFieldAction(data: {
  locationId: string;
  fieldName: string;
  fieldValue?: string | null;
}): Promise<ActionResult<LocationField>> {
  try {
    const field = await addLocationField(data);
    revalidatePath("/map");
    return { ok: true, data: field };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to add field." };
  }
}

export async function updateLocationFieldAction(data: {
  id: string;
  fieldName?: string;
  fieldValue?: string | null;
}): Promise<ActionResult<LocationField>> {
  try {
    const field = await updateLocationField(data);
    revalidatePath("/map");
    return { ok: true, data: field };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update field." };
  }
}

export async function deleteLocationFieldAction(id: string): Promise<ActionResult> {
  try {
    await deleteLocationField(id);
    revalidatePath("/map");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to delete field." };
  }
}

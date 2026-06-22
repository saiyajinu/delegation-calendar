import { createClient } from "@libsql/client";
import { ensureDbReady } from "@/lib/db";
import { isWithinRomania } from "@/lib/map-config";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export type LocationSummary = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type LocationField = {
  id: string;
  locationId: string;
  fieldName: string;
  fieldValue: string | null;
};

export type LocationDetails = LocationSummary & {
  createdAt: number;
  fields: LocationField[];
};

function mapFieldRow(row: Record<string, unknown>): LocationField {
  return {
    id: row.id as string,
    locationId: row.location_id as string,
    fieldName: row.field_name as string,
    fieldValue: (row.field_value as string | null) ?? null,
  };
}

export async function createLocation(data: {
  name: string;
  lat: number;
  lng: number;
}): Promise<LocationSummary> {
  await ensureDbReady();

  const name = data.name.trim();
  if (!name) {
    throw new Error("Name is required.");
  }

  if (!isWithinRomania(data.lat, data.lng)) {
    throw new Error("Location must be within Romania.");
  }

  const id = crypto.randomUUID();
  const createdAt = Date.now();

  await client.execute({
    sql: `INSERT INTO locations (id, name, lat, lng, created_at) VALUES (?, ?, ?, ?, ?)`,
    args: [id, name, data.lat, data.lng, createdAt],
  });

  return { id, name, lat: data.lat, lng: data.lng };
}

export async function getLocations(): Promise<LocationSummary[]> {
  await ensureDbReady();

  const result = await client.execute({
    sql: `SELECT id, name, lat, lng FROM locations ORDER BY name COLLATE NOCASE ASC`,
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    lat: row.lat as number,
    lng: row.lng as number,
  }));
}

export async function getLocationNamesByIds(
  ids: string[]
): Promise<Record<string, string>> {
  await ensureDbReady();

  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return {};
  }

  const placeholders = uniqueIds.map(() => "?").join(", ");
  const result = await client.execute({
    sql: `SELECT id, name FROM locations WHERE id IN (${placeholders})`,
    args: uniqueIds,
  });

  const names: Record<string, string> = {};
  for (const row of result.rows) {
    names[row.id as string] = row.name as string;
  }
  return names;
}

export async function getLocationDetails(id: string): Promise<LocationDetails | null> {
  await ensureDbReady();

  const locationResult = await client.execute({
    sql: `SELECT id, name, lat, lng, created_at FROM locations WHERE id = ?`,
    args: [id],
  });

  if (locationResult.rows.length === 0) {
    return null;
  }

  const row = locationResult.rows[0];
  const fieldsResult = await client.execute({
    sql: `SELECT id, location_id, field_name, field_value FROM location_fields WHERE location_id = ? ORDER BY field_name COLLATE NOCASE ASC`,
    args: [id],
  });

  return {
    id: row.id as string,
    name: row.name as string,
    lat: row.lat as number,
    lng: row.lng as number,
    createdAt: row.created_at as number,
    fields: fieldsResult.rows.map((fieldRow) => mapFieldRow(fieldRow as Record<string, unknown>)),
  };
}

export async function updateLocation(data: {
  id: string;
  name?: string;
  lat?: number;
  lng?: number;
}): Promise<LocationSummary> {
  await ensureDbReady();

  const updates: string[] = [];
  const args: (string | number | null)[] = [];

  if (data.name !== undefined) {
    const name = data.name.trim();
    if (!name) {
      throw new Error("Name is required.");
    }
    updates.push("name = ?");
    args.push(name);
  }

  if (data.lat !== undefined) {
    updates.push("lat = ?");
    args.push(data.lat);
  }

  if (data.lng !== undefined) {
    updates.push("lng = ?");
    args.push(data.lng);
  }

  if (updates.length === 0) {
    throw new Error("No fields to update.");
  }

  const lat = data.lat;
  const lng = data.lng;
  if (lat !== undefined && lng !== undefined && !isWithinRomania(lat, lng)) {
    throw new Error("Location must be within Romania.");
  }

  args.push(data.id);

  await client.execute({
    sql: `UPDATE locations SET ${updates.join(", ")} WHERE id = ?`,
    args,
  });

  const updated = await getLocationDetails(data.id);
  if (!updated) {
    throw new Error("Location not found.");
  }

  return {
    id: updated.id,
    name: updated.name,
    lat: updated.lat,
    lng: updated.lng,
  };
}

export async function deleteLocation(id: string): Promise<void> {
  await ensureDbReady();

  await client.execute({
    sql: `DELETE FROM location_fields WHERE location_id = ?`,
    args: [id],
  });

  await client.execute({
    sql: `DELETE FROM locations WHERE id = ?`,
    args: [id],
  });
}

export async function addLocationField(data: {
  locationId: string;
  fieldName: string;
  fieldValue?: string | null;
}): Promise<LocationField> {
  await ensureDbReady();

  const fieldName = data.fieldName.trim();
  if (!fieldName) {
    throw new Error("Field name is required.");
  }

  const id = crypto.randomUUID();
  const fieldValue = data.fieldValue?.trim() || null;

  await client.execute({
    sql: `INSERT INTO location_fields (id, location_id, field_name, field_value) VALUES (?, ?, ?, ?)`,
    args: [id, data.locationId, fieldName, fieldValue],
  });

  return {
    id,
    locationId: data.locationId,
    fieldName,
    fieldValue,
  };
}

export async function updateLocationField(data: {
  id: string;
  fieldName?: string;
  fieldValue?: string | null;
}): Promise<LocationField> {
  await ensureDbReady();

  const updates: string[] = [];
  const args: (string | number | null)[] = [];

  if (data.fieldName !== undefined) {
    const fieldName = data.fieldName.trim();
    if (!fieldName) {
      throw new Error("Field name is required.");
    }
    updates.push("field_name = ?");
    args.push(fieldName);
  }

  if (data.fieldValue !== undefined) {
    updates.push("field_value = ?");
    args.push(data.fieldValue?.trim() || null);
  }

  if (updates.length === 0) {
    throw new Error("No fields to update.");
  }

  args.push(data.id);

  await client.execute({
    sql: `UPDATE location_fields SET ${updates.join(", ")} WHERE id = ?`,
    args,
  });

  const result = await client.execute({
    sql: `SELECT id, location_id, field_name, field_value FROM location_fields WHERE id = ?`,
    args: [data.id],
  });

  if (result.rows.length === 0) {
    throw new Error("Field not found.");
  }

  return mapFieldRow(result.rows[0] as Record<string, unknown>);
}

export async function deleteLocationField(id: string): Promise<void> {
  await ensureDbReady();

  await client.execute({
    sql: `DELETE FROM location_fields WHERE id = ?`,
    args: [id],
  });
}

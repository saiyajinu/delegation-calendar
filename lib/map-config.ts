export const ROMANIA_CENTER = {
  lat: 45.9432,
  lng: 24.9668,
  zoom: 7,
} as const;

export const ROMANIA_BOUNDS: [[number, number], [number, number]] = [
  [43.5, 20.0],
  [48.5, 30.5],
];

export function isWithinRomania(lat: number, lng: number): boolean {
  const [[minLat, minLng], [maxLat, maxLng]] = ROMANIA_BOUNDS;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

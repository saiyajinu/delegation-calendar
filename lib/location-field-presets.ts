export const COMMON_LOCATION_FIELD_NAMES = [
  "Name",
  "Business activity",
  "Revenue",
  "Employee count",
  "Service provider",
  "Contact phone/email",
  "Notes",
] as const;

export type CommonLocationFieldName = (typeof COMMON_LOCATION_FIELD_NAMES)[number];

export const POPUP_PREVIEW_FIELD_LIMIT = 3;

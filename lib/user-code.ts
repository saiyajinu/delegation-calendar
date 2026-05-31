export const USER_CODE_COOKIE = "userCode";
export const USER_CODE_STORAGE = "userCode";

export function normalizeUserCode(value: string | null | undefined): string | null {
  if (!value) return null;

  const normalized = value.toUpperCase().trim();
  const cleaned = normalized.replace(/[^A-Z0-9]/g, "");
  return cleaned.length === 8 ? cleaned : null;
}

export function generateUserCode(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookieString = document.cookie || "";
  const pairs = cookieString.split(";").map((part) => part.trim());
  const match = pairs.find((part) => part.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1));
}

export function getPersistedUserCode(): string | null {
  if (typeof window === "undefined") return null;

  const cookieCode = normalizeUserCode(getCookieValue(USER_CODE_COOKIE));
  if (cookieCode) return cookieCode;

  return normalizeUserCode(localStorage.getItem(USER_CODE_STORAGE));
}

export function setUserCode(code: string) {
  if (typeof window === "undefined") return;

  const normalized = normalizeUserCode(code);
  if (!normalized) return;

  document.cookie = `${USER_CODE_COOKIE}=${encodeURIComponent(normalized)}; path=/; max-age=${31536000}; sameSite=lax`;
  localStorage.setItem(USER_CODE_STORAGE, normalized);
}

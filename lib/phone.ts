const ALGERIAN_PREFIXES = ["05", "06", "07", "03"];

export function normalizeAlgerianPhone(input: string) {
  const cleaned = input.replace(/[^\d+]/g, "");
  const normalized = cleaned.startsWith("+213") ? `0${cleaned.slice(4)}` : cleaned;
  return normalized;
}

export function isValidAlgerianPhone(input: string) {
  const normalized = normalizeAlgerianPhone(input);
  if (normalized.length !== 10) return false;
  return ALGERIAN_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function formatPhoneForLogin(input: string) {
  return normalizeAlgerianPhone(input);
}

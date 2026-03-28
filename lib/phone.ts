const ALGERIAN_PREFIXES = ["05", "06", "07", "03"];

export function normalizeAlgerianPhone(input: string) {
  const cleaned = input.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+213")) {
    return `0${cleaned.slice(4)}`;
  }

  if (cleaned.startsWith("00213")) {
    return `0${cleaned.slice(5)}`;
  }

  if (cleaned.startsWith("213") && cleaned.length === 12) {
    return `0${cleaned.slice(3)}`;
  }

  return cleaned;
}

export function isValidAlgerianPhone(input: string) {
  const normalized = normalizeAlgerianPhone(input);
  if (normalized.length !== 10) return false;
  return ALGERIAN_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function formatPhoneForLogin(input: string) {
  return normalizeAlgerianPhone(input);
}

export function formatPhoneForWhatsApp(input: string) {
  const normalized = normalizeAlgerianPhone(input);

  if (!isValidAlgerianPhone(normalized)) {
    return null;
  }

  return `213${normalized.slice(1)}`;
}

export function buildWhatsAppUrl(input: string, message?: string) {
  const formatted = formatPhoneForWhatsApp(input);

  if (!formatted) {
    return null;
  }

  const suffix = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${formatted}${suffix}`;
}

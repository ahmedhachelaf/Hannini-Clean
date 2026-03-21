export function slugify(input: string) {
  const normalized = input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || `provider-${Date.now().toString(36)}`;
}

function normalizeBaseUrl(value: string) {
  return value.startsWith("http") ? value : `https://${value}`;
}

export function absoluteUrl(path: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    "https://hannini-clean.vercel.app";
  return new URL(path, normalizeBaseUrl(baseUrl)).toString();
}

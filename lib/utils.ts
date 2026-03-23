import { getAppBaseUrl } from "@/lib/app-origin";

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

export function absoluteUrl(path: string) {
  return new URL(path, getAppBaseUrl()).toString();
}

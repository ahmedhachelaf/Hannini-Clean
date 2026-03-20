import { ar } from "@/messages/ar";
import { fr } from "@/messages/fr";
import type { Locale } from "@/lib/types";

export const locales = ["ar", "fr"] as const;
export const defaultLocale: Locale = "ar";

export const dictionaries = {
  ar,
  fr,
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function resolveLocale(value?: string): Locale {
  if (value && isLocale(value)) {
    return value;
  }

  return defaultLocale;
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function getDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === "ar" ? "fr" : "ar";
}

export function getLocalizedValue<T extends Record<Locale, string>>(value: T, locale: Locale) {
  return value[locale];
}

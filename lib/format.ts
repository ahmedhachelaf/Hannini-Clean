import type { Locale } from "@/lib/types";

export function formatCurrency(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "fr-DZ").format(value);
}

export function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export function formatResponseTime(minutes: number, locale: Locale) {
  if (minutes < 60) {
    return locale === "ar" ? `${minutes} دقيقة` : `${minutes} min`;
  }

  const hours = Number((minutes / 60).toFixed(1));
  return locale === "ar" ? `${hours} ساعة` : `${hours} h`;
}

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { getAlternateLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

type LanguageSwitcherProps = {
  locale: Locale;
  labels: {
    current: string;
    alternate: string;
  };
};

export function LanguageSwitcher({ locale, labels }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const alternateLocale = getAlternateLocale(locale);

  const pathSegments = pathname.split("/").filter(Boolean);
  const nextSegments = [...pathSegments];

  if (nextSegments[0] === "ar" || nextSegments[0] === "fr") {
    nextSegments[0] = alternateLocale;
  } else {
    nextSegments.unshift(alternateLocale);
  }

  const nextPathname = `/${nextSegments.join("/")}`;
  const queryString = searchParams.toString();
  const href = queryString ? `${nextPathname}?${queryString}` : nextPathname;

  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center rounded-full border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5"
      aria-label={locale === "ar" ? "التبديل إلى الفرنسية" : "Basculer vers l'arabe"}
      title={locale === "ar" ? "التبديل إلى الفرنسية" : "Basculer vers l'arabe"}
    >
      <span>{labels.current}</span>
      <span className="mx-2 h-4 w-px bg-[var(--line)]" />
      <span className="text-[var(--muted)]">{labels.alternate}</span>
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import type { Locale } from "@/lib/types";

type SiteHeaderProps = {
  locale: Locale;
  dictionary: {
    nav: {
      home: string;
      providers: string;
      join: string;
      admin: string;
    };
    localeLabel: string;
    alternateLocaleLabel: string;
  };
};

export function SiteHeader({ locale, dictionary }: SiteHeaderProps) {
  const navItems = [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/providers`, label: dictionary.nav.providers },
    { href: `/${locale}/join`, label: dictionary.nav.join },
    { href: `/${locale}/admin`, label: dictionary.nav.admin },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/55 bg-[rgba(238,244,255,0.74)] backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-white/70 bg-[rgba(255,255,255,0.78)] px-4 py-3 shadow-[0_18px_50px_rgba(15,95,255,0.1)]">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <Image
              src="/brand/henini-mark.svg"
              alt="Henini"
              width={48}
              height={48}
              className="h-12 w-12 rounded-2xl ring-1 ring-[rgba(15,95,255,0.12)]"
            />
            <div>
              <div className={`text-lg font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>هنيني</div>
              <div className="text-xs text-[var(--muted)]">{locale === "ar" ? "خدمات منزلية موثوقة" : "Services de confiance"}</div>
            </div>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-2 text-sm font-medium text-[var(--muted)] md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="chip-button min-h-11 px-4 text-sm font-semibold">
                {item.label}
              </Link>
            ))}
          </nav>

          <Suspense
            fallback={
              <span className="inline-flex min-h-11 items-center rounded-full border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--muted)]">
                {dictionary.localeLabel}
              </span>
            }
          >
            <LanguageSwitcher
              locale={locale}
              labels={{
                current: dictionary.localeLabel,
                alternate: dictionary.alternateLocaleLabel,
              }}
            />
          </Suspense>
        </div>

        <nav aria-label="Mobile primary" className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="chip-button min-h-11 shrink-0 px-4 text-sm font-semibold"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

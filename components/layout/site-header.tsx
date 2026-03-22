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
      businesses: string;
      grow: string;
      safety: string;
      join: string;
      support: string;
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
    { href: `/${locale}/businesses`, label: dictionary.nav.businesses },
    { href: `/${locale}/grow`, label: dictionary.nav.grow },
    { href: `/${locale}/safety`, label: dictionary.nav.safety },
    { href: `/${locale}/join`, label: dictionary.nav.join },
    { href: `/${locale}/support`, label: dictionary.nav.support },
    { href: `/${locale}/admin`, label: dictionary.nav.admin },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(13,28,69,0.08)] bg-[rgba(225,236,255,0.72)] backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-[rgba(20,92,255,0.14)] bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(231,240,255,0.84))] px-4 py-3 shadow-[0_24px_60px_rgba(13,28,69,0.14)]">
          <Link href={`/${locale}`} aria-label={locale === "ar" ? "العودة إلى الصفحة الرئيسية" : "Retour à l'accueil"} className="flex items-center gap-3">
            <Image
              src="/brand/henini-mark.svg"
              alt="هَنّيني | Henini"
              width={48}
              height={48}
              className="h-12 w-12 rounded-2xl ring-1 ring-[rgba(15,95,255,0.12)]"
            />
            <div>
              <div className={`text-lg font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>هَنّيني</div>
              <div className="text-sm font-medium text-[var(--muted)]">{locale === "ar" ? "خدمات منزلية موثوقة" : "Services de confiance"}</div>
            </div>
          </Link>

          <nav aria-label={locale === "ar" ? "التنقل الرئيسي" : "Navigation principale"} className="hidden items-center gap-2 text-[0.98rem] font-medium text-[var(--muted)] md:flex">
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

        <nav
          aria-label={locale === "ar" ? "التنقل الرئيسي على الهاتف" : "Navigation principale mobile"}
          className="mt-4 flex flex-wrap gap-2 pb-1 md:hidden"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="chip-button min-h-11 max-w-full px-4 text-sm font-semibold"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

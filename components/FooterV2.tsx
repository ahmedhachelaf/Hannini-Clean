import { Suspense } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import type { Locale } from "@/lib/types";

type FooterV2Props = {
  locale: Locale;
  nav: { home: string; providers: string; businesses: string; grow: string; safety: string; join: string; support: string; };
  footer: {
    tagline: string; platformLabel: string; localServices: string; homeServices: string; howItWorks: string; about: string;
    legalLabel: string; terms: string; privacy: string; conduct: string; report: string;
    copyright: string; bottomTerms: string; bottomPrivacy: string; bottomConduct: string; bottomReport: string;
  };
  localeLabel: string;
  alternateLocaleLabel: string;
};

export function FooterV2({ locale, nav, footer, localeLabel, alternateLocaleLabel }: FooterV2Props) {
  const isRtl = locale === "ar";
  return (
    <footer>
      <div className="bg-ink-footer">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:gap-8 lg:px-8 lg:py-14">
          <div className="space-y-3">
            <div className={`text-3xl font-extrabold text-white ${isRtl ? "arabic-display" : ""}`}>هَنّيني</div>
            <p className="text-sm leading-7 text-white/45">{footer.tagline}</p>
          </div>
          <div className="space-y-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">{footer.platformLabel}</div>
            <nav className="flex flex-col gap-2">
              <Link href={`/${locale}/providers`} className="text-sm text-white/55 transition hover:text-white">{footer.localServices}</Link>
              <Link href={`/${locale}/businesses`} className="text-sm text-white/55 transition hover:text-white">{footer.homeServices}</Link>
              <Link href={`/${locale}/grow`} className="text-sm text-white/55 transition hover:text-white">{footer.howItWorks}</Link>
              <Link href={`/${locale}/safety`} className="text-sm text-white/55 transition hover:text-white">{footer.about}</Link>
            </nav>
          </div>
          <div className="space-y-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">{footer.legalLabel}</div>
            <nav className="flex flex-col gap-2">
              <Link href={`/${locale}/conduct`} className="text-sm text-white/55 transition hover:text-white">{footer.terms}</Link>
              <Link href={`/${locale}/safety`} className="text-sm text-white/55 transition hover:text-white">{footer.privacy}</Link>
              <Link href={`/${locale}/conduct`} className="text-sm text-white/55 transition hover:text-white">{footer.conduct}</Link>
              <Link href={`/${locale}/support`} className="text-sm text-white/55 transition hover:text-white">{footer.report}</Link>
            </nav>
            <div className="mt-5">
              <Suspense fallback={null}>
                <LanguageSwitcher locale={locale} labels={{ current: localeLabel, alternate: alternateLocaleLabel }} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/8 bg-ink-footer">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-5 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-white/40">
            <Link href={`/${locale}/conduct`} className="transition hover:text-white/70 hover:underline underline-offset-2">{footer.bottomTerms}</Link>
            <span aria-hidden="true">•</span>
            <Link href={`/${locale}/safety`} className="transition hover:text-white/70 hover:underline underline-offset-2">{footer.bottomPrivacy}</Link>
            <span aria-hidden="true">•</span>
            <Link href={`/${locale}/conduct`} className="transition hover:text-white/70 hover:underline underline-offset-2">{footer.bottomConduct}</Link>
            <span aria-hidden="true">•</span>
            <Link href={`/${locale}/support`} className="transition hover:text-white/70 hover:underline underline-offset-2">{footer.bottomReport}</Link>
          </div>
          <p className="text-xs text-white/40">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { getProviderSession } from "@/lib/provider-auth";
import type { Locale } from "@/lib/types";

type SiteHeaderProps = {
  locale: Locale;
  dictionary: {
    nav: {
      home: string;
      providers: string;
      businesses: string;
      business: string;
      grow: string;
      safety: string;
      join: string;
      support: string;
      admin: string;
      login: string;
      loginCompact: string;
      myAccount: string;
      menu: string;
      closeMenu: string;
    };
    localeLabel: string;
    alternateLocaleLabel: string;
    install: {
      title: string;
      helper: string;
      button: string;
      compact: string;
      menuLabel: string;
      fallbackTitle: string;
      fallbackDescription: string;
      android: string;
      ios: string;
      desktop: string;
    };
  };
};

export async function SiteHeader({ locale, dictionary }: SiteHeaderProps) {
  const session = await getProviderSession();
  const isLoggedIn = Boolean(session);

  const loginHref = isLoggedIn ? `/${locale}/provider` : `/${locale}/provider/login`;
  const loginLabel = isLoggedIn ? dictionary.nav.myAccount : dictionary.nav.login;
  const loginLabelCompact = isLoggedIn ? dictionary.nav.myAccount : dictionary.nav.loginCompact;

  const navItems = [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/providers`, label: dictionary.nav.providers },
    { href: `/${locale}/businesses`, label: dictionary.nav.businesses },
    { href: `/${locale}/business`, label: dictionary.nav.business },
    { href: `/${locale}/grow`, label: dictionary.nav.grow },
    { href: `/${locale}/safety`, label: dictionary.nav.safety },
    { href: `/${locale}/join`, label: dictionary.nav.join },
    { href: `/${locale}/support`, label: dictionary.nav.support },
    { href: `/${locale}/admin`, label: dictionary.nav.admin },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(13,28,69,0.08)] bg-[rgba(225,236,255,0.72)] backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 rounded-[1.75rem] border border-[rgba(20,92,255,0.14)] bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(231,240,255,0.84))] px-4 py-3 shadow-[0_24px_60px_rgba(13,28,69,0.14)]">

          {/* Logo */}
          <Link
            href={`/${locale}`}
            aria-label={locale === "ar" ? "العودة إلى الصفحة الرئيسية" : "Retour à l’accueil"}
            className="flex min-w-0 items-center gap-3"
          >
            <Image
              src="/brand/henini-mark.svg"
              alt="هَنّيني | Hannini"
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-2xl ring-1 ring-[rgba(15,95,255,0.12)]"
            />
            <div className="min-w-0">
              <div className={`truncate text-lg font-extrabold tracking-tight text-[var(--ink)] ${locale === "ar" ? "arabic-display" : ""}`}>
                هَنّيني
              </div>
              <div className="truncate text-sm font-medium text-[var(--muted)]">
                {locale === "ar" ? "خدمات منزلية موثوقة" : "Services de confiance"}
              </div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav
            aria-label={locale === "ar" ? "التنقل الرئيسي" : "Navigation principale"}
            className="hidden items-center gap-1.5 text-[0.98rem] font-medium text-[var(--muted)] lg:flex"
          >
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="chip-button min-h-11 px-3.5 text-sm font-semibold">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden items-center gap-2 lg:flex">
            <Link href={loginHref} className="button-primary min-h-11 px-5 text-sm font-bold">
              {loginLabel}
            </Link>
            <PwaInstallButton locale={locale} copy={dictionary.install} variant="inline" />
            <Suspense
              fallback={
                <span className="inline-flex min-h-11 max-w-full items-center rounded-full border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--muted)]">
                  {dictionary.localeLabel}
                </span>
              }
            >
              <LanguageSwitcher locale={locale} labels={{ current: dictionary.localeLabel, alternate: dictionary.alternateLocaleLabel }} />
            </Suspense>
          </div>

          {/* Mobile right side */}
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <Suspense
              fallback={
                <span className="inline-flex min-h-11 items-center rounded-full border border-[var(--line)] bg-white px-3 text-sm font-semibold text-[var(--muted)]">
                  {dictionary.localeLabel}
                </span>
              }
            >
              <LanguageSwitcher locale={locale} labels={{ current: dictionary.localeLabel, alternate: dictionary.alternateLocaleLabel }} />
            </Suspense>

            <Link
              href={loginHref}
              className="inline-flex h-11 shrink-0 items-center rounded-full border border-[rgba(20,92,255,0.22)] bg-[linear-gradient(135deg,var(--navy)_0%,var(--accent)_52%,#4d9bff_100%)] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(14,50,132,0.22)]"
            >
              {loginLabelCompact}
            </Link>

            <MobileMenu
              locale={locale}
              navItems={navItems}
              loginHref={loginHref}
              loginLabel={loginLabel}
              menuLabel={dictionary.nav.menu}
              closeLabel={dictionary.nav.closeMenu}
            >
              <PwaInstallButton locale={locale} copy={dictionary.install} variant="inline" />
            </MobileMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

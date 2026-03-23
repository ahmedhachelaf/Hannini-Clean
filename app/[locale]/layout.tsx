import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";
import { getDictionary, getDirection, isLocale, locales } from "@/lib/i18n";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <div dir={getDirection(locale)} lang={locale} className="locale-shell">
      <a href="#main-content" className="skip-link">
        {locale === "ar" ? "انتقل إلى المحتوى" : "Aller au contenu"}
      </a>
      <SiteHeader locale={locale} dictionary={dictionary} />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <SiteFooter locale={locale} nav={dictionary.nav} />
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-end px-4 pb-[max(env(safe-area-inset-bottom),0px)] md:hidden">
        <div className="pointer-events-auto">
          <PwaInstallButton locale={locale} copy={dictionary.install} />
        </div>
      </div>
    </div>
  );
}

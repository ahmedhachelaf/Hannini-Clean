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
      <SiteHeader locale={locale} dictionary={dictionary} />
      <main>{children}</main>
      <SiteFooter locale={locale} nav={dictionary.nav} />
      <div className="pointer-events-none fixed bottom-4 left-0 right-0 z-30 flex justify-center px-4">
        <div className="pointer-events-auto">
          <PwaInstallButton locale={locale} />
        </div>
      </div>
    </div>
  );
}

import { HomePageContent } from "@/components/home/home-page-content";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { defaultLocale, getDictionary, getDirection } from "@/lib/i18n";
import { getCategories, getFeaturedProviders, getSearchSummary, getZones } from "@/lib/repository";

export const revalidate = 300;

export default async function RootPage() {
  const locale = defaultLocale;
  const dictionary = getDictionary(locale);
  const [categories, zones, featuredProviders, featuredBusinesses, summary] = await Promise.all([
    getCategories(),
    getZones(),
    getFeaturedProviders("service_provider"),
    getFeaturedProviders("home_business"),
    getSearchSummary(),
  ]);

  return (
    <div dir={getDirection(locale)} lang={locale} className="locale-shell">
      <SiteHeader locale={locale} dictionary={dictionary} />
      <main>
        <HomePageContent
          locale={locale}
          dictionary={dictionary}
          categories={categories}
          zones={zones}
          featuredProviders={featuredProviders}
          featuredBusinesses={featuredBusinesses}
          summary={summary}
        />
      </main>
      <SiteFooter locale={locale} nav={dictionary.nav} />
    </div>
  );
}

import { HomePageContent } from "@/components/home/home-page-content";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getCategories, getFeaturedProviders, getSearchSummary, getZones } from "@/lib/repository";
import { notFound } from "next/navigation";

export const revalidate = 300;

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const [categories, zones, featuredProviders, summary] = await Promise.all([
    getCategories(),
    getZones(),
    getFeaturedProviders(),
    getSearchSummary(),
  ]);

  return (
    <HomePageContent
      locale={locale}
      dictionary={dictionary}
      categories={categories}
      zones={zones}
      featuredProviders={featuredProviders}
      summary={summary}
    />
  );
}

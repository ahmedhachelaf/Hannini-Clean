import { ProviderSignupForm } from "@/components/forms/provider-signup-form";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getCategories, getZones } from "@/lib/repository";
import { notFound } from "next/navigation";

type JoinPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function JoinPage({ params }: JoinPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const [categories, zones] = await Promise.all([getCategories(), getZones()]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <ProviderSignupForm locale={locale} categories={categories} zones={zones} labels={dictionary.join} />
    </div>
  );
}

import { BookingForm } from "@/components/forms/booking-form";
import { formatCurrency } from "@/lib/format";
import { getDictionary, getLocalizedValue, isLocale } from "@/lib/i18n";
import { getCategories, getProviderBySlug, getZones } from "@/lib/repository";
import { notFound } from "next/navigation";

type BookingPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function BookingPage({ params }: BookingPageProps) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const provider = await getProviderBySlug(slug);

  if (!provider) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const [categories, zones] = await Promise.all([getCategories(), getZones()]);
  const category = categories.find((item) => item.slug === provider.categorySlug) ?? null;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-10">
      <BookingForm locale={locale} provider={provider} categories={categories} zones={zones} labels={dictionary.booking} />

      <aside className="surface-card rounded-[1.75rem] p-6">
        <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{provider.displayName}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{category ? `${category.icon} ${getLocalizedValue(category.name, locale)}` : provider.categorySlug}</p>
        <div className="mt-6 space-y-3 text-sm text-[var(--muted)]">
          <div>
            <span className="font-semibold text-[var(--ink)]">{dictionary.common.hourlyRate}:</span> {formatCurrency(provider.hourlyRate, locale)}
          </div>
          <div>
            <span className="font-semibold text-[var(--ink)]">{dictionary.common.travelFee}:</span> {formatCurrency(provider.travelFee, locale)}
          </div>
          <div>
            <span className="font-semibold text-[var(--ink)]">{dictionary.common.languages}:</span> {provider.languages.join(" • ")}
          </div>
        </div>
      </aside>
    </div>
  );
}

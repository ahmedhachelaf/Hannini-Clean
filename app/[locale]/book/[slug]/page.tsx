import { BookingForm } from "@/components/forms/booking-form";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { getDictionary, getLocalizedValue, isLocale } from "@/lib/i18n";
import { getCategoryIcon } from "@/lib/icon-map";
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
  const CategoryIcon = getCategoryIcon(category?.slug ?? provider.categorySlug);
  const primaryPriceLabel = provider.profileType === "home_business" ? dictionary.common.startingPrice : dictionary.common.hourlyRate;
  const secondaryFeeLabel = provider.profileType === "home_business" ? dictionary.common.deliveryFee : dictionary.common.travelFee;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-10">
      <BookingForm locale={locale} provider={provider} categories={categories} zones={zones} labels={dictionary.booking} />

      <aside className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(236,244,255,0.9))] p-6">
        <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{provider.displayName}</h2>
        <p className="mt-2 flex items-center gap-2 text-sm text-[var(--muted)]">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(15,95,255,0.16)] bg-white shadow-[0_8px_18px_rgba(12,40,104,0.12)]">
            <CategoryIcon size={14} strokeWidth={2.2} className="text-[var(--navy)]" />
          </span>
          <span>{category ? getLocalizedValue(category.name, locale) : provider.categorySlug}</span>
        </p>
        <div className="mt-6 space-y-3 text-sm text-[var(--muted)]">
          <div>
            <span className="font-semibold text-[var(--ink)]">{primaryPriceLabel}:</span> {formatCurrency(provider.hourlyRate, locale)}
          </div>
          <div>
            <span className="font-semibold text-[var(--ink)]">{secondaryFeeLabel}:</span> {formatCurrency(provider.travelFee, locale)}
          </div>
          <div>
            <span className="font-semibold text-[var(--ink)]">{dictionary.common.languages}:</span> {provider.languages.join(" • ")}
          </div>
        </div>
        <div className="mt-6 rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-white/88 p-4 text-sm leading-7 text-[var(--muted)]">
          {provider.profileType === "home_business"
            ? locale === "ar"
              ? "يمكنك استخدام هذا الطلب كاستفسار أو طلب مسبق لنشاط منزلي، مع صور مرجعية وتنبيه واتساب لتنسيق التفاصيل لاحقاً."
              : "Vous pouvez utiliser cette demande comme précommande ou prise de contact pour une activité à domicile, avec photos et suivi WhatsApp."
            : locale === "ar"
              ? "يمكنك إضافة صور للمشكلة وتفعيل تنبيه واتساب. في هذا الـMVP يتم تمرير هذه التفاصيل ضمن الطلب للمتابعة اليدوية."
              : "Vous pouvez ajouter des photos du problème et demander une notification WhatsApp. Dans ce MVP, ces détails sont transmis dans la demande pour suivi manuel."}
        </div>
        {provider.profileType === "home_business" && provider.bulkOrders?.available ? (
          <div className="mt-5 rounded-[1.25rem] border border-[rgba(15,95,255,0.14)] bg-white p-4 text-sm text-[var(--muted)] shadow-[0_18px_50px_rgba(15,95,255,0.08)]">
            <div className="font-semibold text-[var(--ink)]">{dictionary.booking.fields.businessBuyerTitle}</div>
            <p className="mt-2 leading-7">{dictionary.booking.fields.businessBuyerHint}</p>
            <div className="mt-3 space-y-2">
              {provider.bulkOrders.minimumOrderQuantity ? (
                <div>
                  <span className="font-semibold text-[var(--ink)]">{dictionary.provider.minimumOrderQuantity}:</span>{" "}
                  {provider.bulkOrders.minimumOrderQuantity}
                </div>
              ) : null}
              {provider.bulkOrders.productionCapacity ? (
                <div>
                  <span className="font-semibold text-[var(--ink)]">{dictionary.provider.productionCapacity}:</span>{" "}
                  {provider.bulkOrders.productionCapacity}
                </div>
              ) : null}
              {provider.bulkOrders.leadTime ? (
                <div>
                  <span className="font-semibold text-[var(--ink)]">{dictionary.provider.leadTime}:</span> {provider.bulkOrders.leadTime}
                </div>
              ) : null}
              {provider.bulkOrders.deliveryArea ? (
                <div>
                  <span className="font-semibold text-[var(--ink)]">{dictionary.provider.deliveryArea}:</span>{" "}
                  {provider.bulkOrders.deliveryArea}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
        <Link
          href={`/${locale}/support?actor=customer&category=booking_issue&providerSlug=${provider.slug}&providerId=${provider.id}`}
          className="button-secondary mt-5"
        >
          {dictionary.booking.supportLink}
        </Link>
      </aside>
    </div>
  );
}

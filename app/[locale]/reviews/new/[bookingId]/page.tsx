import { ReviewForm } from "@/components/forms/review-form";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getBookingById, getProviderById } from "@/lib/repository";
import { notFound } from "next/navigation";

type ReviewPageProps = {
  params: Promise<{ locale: string; bookingId: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function ReviewPage({ params, searchParams }: ReviewPageProps) {
  const [{ locale, bookingId }, query] = await Promise.all([params, searchParams]);

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const booking = await getBookingById(bookingId);

  if (!booking || !query.token || booking.customerAccessToken !== query.token) {
    notFound();
  }

  const provider = await getProviderById(booking.providerId, true);

  if (!provider) {
    notFound();
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8 lg:py-10">
      <ReviewForm
        locale={locale}
        provider={provider}
        bookingId={bookingId}
        customerAccessToken={query.token}
        labels={dictionary.review}
      />

      <aside className="surface-card rounded-[1.75rem] p-6">
        <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{provider.displayName}</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          {locale === "ar" ? "التقييم مرتبط بهذا الحجز فقط." : "Cet avis reste lié à cette réservation uniquement."}
        </p>
        <div className="mt-3 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {locale === "ar" ? "سيتم وسم هذا التقييم كتجربة موثقة لأنه مرتبط بحجز مكتمل." : "Cet avis sera marqué comme vérifié car il est lié à une réservation complétée."}
        </div>
        <div className="mt-6 space-y-2 text-sm text-[var(--muted)]">
          <div>
            <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "رقم الحجز:" : "Réservation :"}</span> {booking.id}
          </div>
          <div>
            <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "التاريخ:" : "Date :"}</span> {booking.date}
          </div>
          <div>
            <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الوقت:" : "Heure :"}</span> {booking.time}
          </div>
        </div>
      </aside>
    </div>
  );
}

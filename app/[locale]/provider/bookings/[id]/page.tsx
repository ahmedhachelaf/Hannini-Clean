import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProviderBookingActions } from "@/components/providers/provider-booking-actions";
import { formatDate } from "@/lib/format";
import { getAuthenticatedProvider } from "@/lib/provider-auth";
import { isLocale } from "@/lib/i18n";
import { getBookingById, getZones } from "@/lib/repository";

type ProviderBookingDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProviderBookingDetailPage({ params }: ProviderBookingDetailPageProps) {
  const { locale, id } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const provider = await getAuthenticatedProvider();

  if (!provider) {
    redirect(`/${locale}/provider/login`);
  }

  const [booking, zones] = await Promise.all([getBookingById(id), getZones()]);

  if (!booking || booking.providerId !== provider.id) {
    notFound();
  }

  const zone = zones.find((item) => item.slug === booking.zoneSlug);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Link href={`/${locale}/provider`} className="button-secondary w-fit">
        {locale === "ar" ? "العودة إلى اللوحة" : "Retour au tableau"}
      </Link>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px]">
        <article className="surface-card rounded-[1.75rem] p-6">
          <h1 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
            {locale === "ar" ? "تفاصيل الطلب" : "Détail de la demande"}
          </h1>
          <div className="mt-5 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
            <div><span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الزبون" : "Client"}:</span> {booking.customerName}</div>
            <div><span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الهاتف" : "Téléphone"}:</span> {booking.phoneNumber}</div>
            <div><span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "التاريخ" : "Date"}:</span> {formatDate(booking.date, locale)}</div>
            <div><span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الوقت" : "Heure"}:</span> {booking.time}</div>
            <div><span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الحالة" : "Statut"}:</span> {booking.status}</div>
            <div><span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "المنطقة" : "Zone"}:</span> {zone ? zone.name[locale] : booking.zoneSlug}</div>
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)]">
            <div><span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "العنوان" : "Adresse"}:</span> {booking.address}</div>
            <div className="mt-3"><span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الوصف" : "Description"}:</span> {booking.issueDescription}</div>
            {booking.providerNote ? (
              <div className="mt-3"><span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "ملاحظتك الحالية" : "Votre note actuelle"}:</span> {booking.providerNote}</div>
            ) : null}
            {booking.proposedDate || booking.proposedTime ? (
              <div className="mt-3">
                <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "موعد بديل مقترح" : "Créneau proposé"}:</span>{" "}
                {booking.proposedDate ?? booking.date} • {booking.proposedTime ?? booking.time}
              </div>
            ) : null}
          </div>

          <div className="mt-4">
            <a href={booking.googleMapsUrl} target="_blank" rel="noreferrer" className="button-secondary">
              {locale === "ar" ? "فتح الموقع" : "Ouvrir la localisation"}
            </a>
          </div>
        </article>

        <ProviderBookingActions locale={locale} booking={booking} />
      </section>
    </div>
  );
}

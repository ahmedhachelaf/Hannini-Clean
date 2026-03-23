import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/format";
import { isLocale } from "@/lib/i18n";
import { getBookingById } from "@/lib/repository";

type CustomerBookingStatusPageProps = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ token?: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CustomerBookingStatusPage({ params, searchParams }: CustomerBookingStatusPageProps) {
  const [{ locale, id }, query] = await Promise.all([params, searchParams]);

  if (!isLocale(locale)) {
    notFound();
  }

  const booking = await getBookingById(id);

  if (!booking || !query.token || booking.customerAccessToken !== query.token) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="surface-card rounded-[1.75rem] p-6">
        <h1 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
          {locale === "ar" ? "متابعة حالة الطلب" : "Suivi de la demande"}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          {locale === "ar"
            ? "تم حفظ الطلب داخل Hannini. ستظهر هنا آخر حالة يحدّثها مزوّد الخدمة أو فريق الإدارة."
            : "La demande est bien enregistrée dans Hannini. Les dernières mises à jour du prestataire ou de l’admin apparaissent ici."}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4">
            <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "الحالة" : "Statut"}</div>
            <div className="mt-2 text-2xl font-extrabold text-[var(--ink)]">{booking.status}</div>
          </div>
          <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-4">
            <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "الموعد" : "Créneau"}</div>
            <div className="mt-2 text-xl font-extrabold text-[var(--ink)]">
              {formatDate(booking.proposedDate ?? booking.date, locale)} • {booking.proposedTime ?? booking.time}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)]">
          <div><span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الخدمة" : "Service"}:</span> {booking.selectedService}</div>
          <div className="mt-2"><span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الوصف" : "Description"}:</span> {booking.issueDescription}</div>
          {booking.providerNote ? (
            <div className="mt-3"><span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "رسالة من مزوّد الخدمة" : "Message du prestataire"}:</span> {booking.providerNote}</div>
          ) : null}
        </div>

        <div className="mt-5">
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/support?actor=customer&category=booking_issue&bookingId=${booking.id}&providerId=${booking.providerId}&providerSlug=${booking.providerSlug}`} className="button-secondary">
              {locale === "ar" ? "طلب مساعدة بشأن هذا الطلب" : "Demander de l’aide sur cette demande"}
            </Link>
            {booking.status === "completed" ? (
              <Link href={`/${locale}/reviews/new/${booking.id}?token=${booking.customerAccessToken}`} className="button-primary">
                {locale === "ar" ? "إضافة تقييم بعد الإنجاز" : "Laisser un avis après le service"}
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

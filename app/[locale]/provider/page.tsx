import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProviderLogoutButton } from "@/components/providers/provider-logout-button";
import { formatDate } from "@/lib/format";
import { getAuthenticatedProvider } from "@/lib/provider-auth";
import { isLocale } from "@/lib/i18n";
import { getBookingsForProvider, getCategories, getZones } from "@/lib/repository";

type ProviderDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const statusTone: Record<string, string> = {
  pending: "status-pill status-pill--pending",
  confirmed: "status-pill status-pill--verified",
  completed: "status-pill status-pill--verified",
  cancelled: "status-pill border border-rose-200 bg-rose-50 text-rose-700",
};

export default async function ProviderDashboardPage({ params }: ProviderDashboardPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const provider = await getAuthenticatedProvider();

  if (!provider) {
    redirect(`/${locale}/provider/login`);
  }

  const [bookings, categories, zones] = await Promise.all([
    getBookingsForProvider(provider.id),
    getCategories(),
    getZones(),
  ]);
  const category = categories.find((item) => item.slug === provider.categorySlug);
  const zoneMap = new Map(zones.map((zone) => [zone.slug, zone]));
  const upcomingBookings = bookings.filter((booking) => booking.status !== "completed" && booking.status !== "cancelled");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="surface-card rounded-[1.75rem] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className={`text-3xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
              {locale === "ar" ? "لوحة مزود الخدمة" : "Tableau prestataire"}
            </h1>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {locale === "ar"
                ? "هنا ترى الطلبات الجديدة، تراجع حالتك الحالية، وتنتقل سريعاً إلى تعديل الملف أو إيقاف الظهور."
                : "Retrouvez ici les nouvelles demandes, votre état actuel et un accès rapide à la gestion du profil."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ProviderLogoutButton locale={locale} />
            <Link href={`/${locale}/provider/profile`} className="button-primary">
              {locale === "ar" ? "تعديل الملف وإدارته" : "Modifier et gérer le profil"}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4">
            <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "الحالة الحالية" : "Statut actuel"}</div>
            <div className="mt-2 text-2xl font-extrabold text-[var(--ink)]">{provider.status}</div>
          </div>
          <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-4">
            <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "طلبات تحتاج متابعة" : "Demandes à traiter"}</div>
            <div className="mt-2 text-2xl font-extrabold text-[var(--ink)]">{upcomingBookings.length}</div>
          </div>
          <div className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4">
            <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "الفئة الأساسية" : "Catégorie principale"}</div>
            <div className="mt-2 text-2xl font-extrabold text-[var(--ink)]">{category ? category.name[locale] : provider.categorySlug}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_380px]">
        <div className="surface-card rounded-[1.75rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold">{locale === "ar" ? "الطلبات الواردة" : "Demandes reçues"}</h2>
            <span className="status-pill border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]">{bookings.length}</span>
          </div>
          <div className="mt-5 space-y-4">
            {bookings.length === 0 ? (
              <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-4 text-sm text-[var(--muted)]">
                {locale === "ar" ? "لا توجد طلبات بعد." : "Aucune demande pour le moment."}
              </div>
            ) : (
              bookings.map((booking) => (
                <article key={booking.id} className="rounded-[1.5rem] border border-[var(--line)] bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-extrabold text-[var(--ink)]">{booking.customerName}</div>
                      <div className="mt-1 text-sm text-[var(--muted)]">
                        {formatDate(booking.date, locale)} • {booking.time}
                      </div>
                    </div>
                    <span className={statusTone[booking.status] ?? "status-pill border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]"}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
                    <div>{locale === "ar" ? "الخدمة" : "Service"}: {booking.selectedService}</div>
                    <div>{locale === "ar" ? "التواصل المفضل" : "Canal préféré"}: {booking.preferredContactMethod}</div>
                    <div>{locale === "ar" ? "المنطقة" : "Zone"}: {zoneMap.get(booking.zoneSlug)?.name[locale] ?? booking.zoneSlug}</div>
                    <div>{locale === "ar" ? "الهاتف" : "Téléphone"}: {booking.phoneNumber}</div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{booking.issueDescription}</p>
                  <div className="mt-4">
                    <Link href={`/${locale}/provider/bookings/${booking.id}`} className="button-secondary">
                      {locale === "ar" ? "فتح التفاصيل" : "Voir les détails"}
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="surface-card rounded-[1.75rem] p-6">
            <h2 className="text-xl font-extrabold">{locale === "ar" ? "التوفر الحالي" : "Disponibilités"}</h2>
            <div className="mt-4 space-y-3">
              {provider.availability.length === 0 ? (
                <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-4 text-sm text-[var(--muted)]">
                  {locale === "ar" ? "لم تضف أوقات التوفر بعد." : "Aucune disponibilité enregistrée pour l’instant."}
                </div>
              ) : (
                provider.availability.map((slot) => (
                  <div key={slot.dayKey} className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4 text-sm">
                    <div className="font-semibold text-[var(--ink)]">{slot.label[locale]}</div>
                    <div className="mt-1 text-[var(--muted)]">{slot.startTime} - {slot.endTime}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="surface-card rounded-[1.75rem] p-6">
            <h2 className="text-xl font-extrabold">{locale === "ar" ? "الظهور والمراجعة" : "Visibilité et revue"}</h2>
            <div className="mt-4 rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)]">
              <div>
                <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الحالة:" : "Statut :"}</span> {provider.status}
              </div>
              <div className="mt-2">
                <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "التحقق:" : "Vérification :"}</span>{" "}
                {provider.isVerified ? (locale === "ar" ? "موثّق" : "Vérifié") : locale === "ar" ? "غير موثّق" : "Non vérifié"}
              </div>
              {provider.verification.adminNote ? (
                <div className="mt-3">
                  <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "ملاحظة الإدارة:" : "Note admin :"}</span>{" "}
                  {provider.verification.adminNote}
                </div>
              ) : null}
              {provider.verification.rejectionReason ? (
                <div className="mt-3">
                  <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "سبب الرفض:" : "Motif de refus :"}</span>{" "}
                  {provider.verification.rejectionReason}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

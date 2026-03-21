import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/admin/logout-button";
import { MetadataManager } from "@/components/admin/metadata-manager";
import { ProviderActions } from "@/components/admin/provider-actions";
import { SupportCaseActions } from "@/components/admin/support-case-actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { formatDate } from "@/lib/format";
import { getDictionary, getLocalizedValue, isLocale } from "@/lib/i18n";
import { getAdminDashboardData } from "@/lib/repository";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AdminPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  if (!(await isAdminAuthenticated())) {
    redirect(`/${locale}/admin/login`);
  }

  const dictionary = getDictionary(locale);
  const dashboard = await getAdminDashboardData();
  const categoryMap = new Map(dashboard.categories.map((category) => [category.slug, category]));
  const zoneMap = new Map(dashboard.zones.map((zone) => [zone.slug, zone]));
  const supportStatusLabels = {
    open: dictionary.admin.open,
    in_review: dictionary.admin.inReview,
    waiting_for_user: dictionary.admin.waitingForUser,
    resolved: dictionary.admin.resolved,
  };
  const providerStatusLabels = {
    approved: dictionary.common.approved,
    pending: dictionary.common.pending,
    rejected: dictionary.common.rejected,
    needs_more_info: dictionary.admin.needsMoreInfo,
  };
  const pendingProviders = dashboard.providers.filter((provider) => provider.status === "pending" || provider.status === "needs_more_info");
  const reviewedProviders = dashboard.providers.filter((provider) => provider.status === "approved" || provider.status === "rejected");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={`section-title font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.admin.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{dictionary.admin.description}</p>
        </div>
        <LogoutButton locale={locale} label={dictionary.admin.logout} />
      </section>

      <section className="surface-card rounded-[1.75rem] p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold">{dictionary.admin.providers}</h2>
        </div>
        <div className="space-y-8">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h3 className="text-base font-extrabold">{locale === "ar" ? "طلبات بانتظار المراجعة" : "Dossiers en attente de revue"}</h3>
              <span className="status-pill status-pill--pending">{pendingProviders.length}</span>
            </div>
            <div className="space-y-4">
              {pendingProviders.length === 0 ? (
                <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-4 text-sm text-[var(--muted)]">
                  {locale === "ar" ? "لا توجد طلبات معلقة حالياً." : "Aucune demande en attente pour le moment."}
                </div>
              ) : (
                pendingProviders.map((provider) => (
                  <ProviderAdminCard
                    key={provider.id}
                    locale={locale}
                    provider={provider}
                    providerStatusLabel={providerStatusLabels[provider.status]}
                    categoryLabel={getLocalizedValue(categoryMap.get(provider.categorySlug)?.name ?? { ar: provider.categorySlug, fr: provider.categorySlug }, locale)}
                    zoneLabels={provider.zones.map((zoneSlug) => getLocalizedValue(zoneMap.get(zoneSlug)?.name ?? { ar: zoneSlug, fr: zoneSlug }, locale))}
                    labels={dictionary.admin}
                  />
                ))
              )}
            </div>
          </div>

          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h3 className="text-base font-extrabold">{locale === "ar" ? "مزودون تمت مراجعتهم" : "Profils déjà traités"}</h3>
              <span className="status-pill border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]">{reviewedProviders.length}</span>
            </div>
            <div className="space-y-4">
              {reviewedProviders.map((provider) => (
                <ProviderAdminCard
                  key={provider.id}
                  locale={locale}
                  provider={provider}
                  providerStatusLabel={providerStatusLabels[provider.status]}
                  categoryLabel={getLocalizedValue(categoryMap.get(provider.categorySlug)?.name ?? { ar: provider.categorySlug, fr: provider.categorySlug }, locale)}
                  zoneLabels={provider.zones.map((zoneSlug) => getLocalizedValue(zoneMap.get(zoneSlug)?.name ?? { ar: zoneSlug, fr: zoneSlug }, locale))}
                  labels={dictionary.admin}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="surface-card rounded-[1.75rem] p-6">
          <h2 className="text-xl font-extrabold">{dictionary.admin.bookings}</h2>
          <div className="mt-5 space-y-4">
            {dashboard.bookings.map((booking) => (
              <article key={booking.id} className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4">
                <div className="font-semibold">{booking.customerName}</div>
                <div className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  {booking.providerSlug} • {formatDate(booking.date, locale)} • {booking.time}
                </div>
                <div className="mt-1 text-sm text-[var(--muted)]">
                  {booking.address} • {booking.preferredContactMethod}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="surface-card rounded-[1.75rem] p-6">
          <h2 className="text-xl font-extrabold">{dictionary.admin.reviews}</h2>
          <div className="mt-5 space-y-4">
            {dashboard.reviews.map((review) => (
              <article key={review.id} className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4">
                <div className="font-semibold">{review.customerName}</div>
                <div className="mt-2 text-sm text-[var(--muted)]">
                  {review.rating}/5 • {formatDate(review.createdAt, locale)}
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{review.comment}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-card rounded-[1.75rem] p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold">{dictionary.admin.supportCases}</h2>
        </div>
        <div className="space-y-5">
          {dashboard.supportCases.map((supportCase) => (
            <article key={supportCase.id} className="rounded-[1.5rem] border border-[var(--line)] bg-white p-5">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="status-pill border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]">
                      {supportStatusLabels[supportCase.status]}
                    </span>
                    <span className="status-pill border border-[var(--line)] bg-white text-[var(--ink)]">
                      {supportCase.category}
                    </span>
                    <span className="status-pill border border-[var(--line)] bg-white text-[var(--ink)]">
                      #{supportCase.id}
                    </span>
                  </div>
                  <h3 className={`mt-3 text-lg font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{supportCase.subject}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{supportCase.message}</p>
                  <div className="mt-4 grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
                    <div>{locale === "ar" ? "المقدّم" : "Auteur"}: {supportCase.actorRole}</div>
                    <div>{locale === "ar" ? "الهاتف" : "Téléphone"}: {supportCase.phoneNumber ?? "-"}</div>
                    <div>{locale === "ar" ? "مرجع الحجز" : "Référence réservation"}: {supportCase.bookingId ?? "-"}</div>
                    <div>{locale === "ar" ? "مرجع المزود" : "Référence prestataire"}: {supportCase.providerSlug ?? "-"}</div>
                  </div>
                  <div className="mt-4 space-y-3 rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] p-4">
                    {supportCase.messages.map((message) => (
                      <div key={message.id} className="rounded-[1rem] border border-[var(--line)] bg-white p-3 text-sm">
                        <div className="font-semibold text-[var(--ink)]">{message.authorName}</div>
                        <div className="mt-1 text-xs text-[var(--muted)]">{message.authorRole}</div>
                        <p className="mt-2 leading-7 text-[var(--muted)]">{message.message}</p>
                        {message.attachmentNames.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.attachmentNames.map((attachment) => (
                              <span key={attachment} className="chip-button min-h-0 px-3 py-2 text-xs">
                                {attachment}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <SupportCaseActions locale={locale} supportCase={supportCase} labels={dictionary.admin} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card rounded-[1.75rem] p-6">
        <div className="mb-5">
          <h2 className="text-xl font-extrabold">{dictionary.admin.categories} / {dictionary.admin.zones}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{dictionary.admin.metadataDescription}</p>
        </div>

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4">
            <h3 className="font-bold">{dictionary.admin.categories}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {dashboard.categories.map((category) => (
                <span key={category.slug} className="rounded-full border border-[var(--line)] bg-[var(--soft)] px-3 py-2 text-sm">
                  {category.icon} {getLocalizedValue(category.name, locale)}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4">
            <h3 className="font-bold">{dictionary.admin.zones}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {dashboard.zones.map((zone) => (
                <span key={zone.slug} className="rounded-full border border-[var(--line)] bg-[var(--soft)] px-3 py-2 text-sm">
                  {getLocalizedValue(zone.name, locale)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <MetadataManager locale={locale} labels={dictionary.admin} />
      </section>
    </div>
  );
}

function ProviderAdminCard({
  locale,
  provider,
  providerStatusLabel,
  categoryLabel,
  zoneLabels,
  labels,
}: {
  locale: "ar" | "fr";
  provider: Awaited<ReturnType<typeof getAdminDashboardData>>["providers"][number];
  providerStatusLabel: string;
  categoryLabel: string;
  zoneLabels: string[];
  labels: {
    approve: string;
    reject: string;
    needsMoreInfo: string;
    verify: string;
    unverify: string;
  };
}) {
  return (
    <article className="rounded-[1.5rem] border border-[var(--line)] bg-white p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <div>
            <h3 className={`text-lg font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{provider.displayName}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className={`status-pill ${
                  provider.status === "approved"
                    ? "status-pill--verified"
                    : provider.status === "needs_more_info"
                      ? "border border-amber-200 bg-amber-50 text-amber-700"
                      : provider.status === "rejected"
                        ? "status-pill--danger"
                        : "status-pill--pending"
                }`}
              >
                {providerStatusLabel}
              </span>
              <span className="status-pill border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]">{categoryLabel}</span>
              {provider.isVerified ? <span className="status-pill status-pill--verified">{locale === "ar" ? "شارة موثّق" : "Badge vérifié"}</span> : null}
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">{zoneLabels.join(locale === "ar" ? " • " : " • ")}</p>
          </div>

          <div className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
            <div>{locale === "ar" ? "واتساب" : "WhatsApp"}: {provider.whatsappNumber}</div>
            <div>{locale === "ar" ? "الهاتف" : "Téléphone"}: {provider.phoneNumber}</div>
            <div>{locale === "ar" ? "التقييم" : "Note"}: {provider.rating}</div>
            <div>{locale === "ar" ? "الأعمال المكتملة" : "Missions terminées"}: {provider.completedJobs}</div>
          </div>

          <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] p-4 text-sm text-[var(--muted)]">
            <div className="font-semibold text-[var(--ink)]">{locale === "ar" ? "أدلة الطلب" : "Pièces du dossier"}</div>
            <div className="mt-2">
              {locale === "ar" ? "وثيقة التحقق:" : "Document :"} {provider.verification.documentName ?? (locale === "ar" ? "غير مرفق" : "Non fourni")}
            </div>
            <div className="mt-1">
              {locale === "ar" ? "ملاحظات الإدارة:" : "Notes admin :"} {provider.verification.notes ?? (locale === "ar" ? "لا توجد" : "Aucune")}
            </div>
            <div className="mt-1">
              {locale === "ar" ? "صور الأعمال:" : "Photos :"} {provider.galleryCaptions?.length ?? provider.gallery.length}
            </div>
          </div>

          {provider.gallery.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {provider.gallery.slice(0, 3).map((imageUrl, index) => (
                <div key={`${provider.id}-${imageUrl}-${index}`} className="overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt={provider.galleryCaptions?.[index] ?? provider.displayName} className="h-28 w-full object-cover" />
                  <div className="border-t border-[var(--line)] bg-white px-3 py-2 text-xs text-[var(--muted)]">
                    {provider.galleryCaptions?.[index] ?? (locale === "ar" ? `عينة ${index + 1}` : `Sample ${index + 1}`)}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <ProviderActions
          providerId={provider.id}
          locale={locale}
          status={provider.status}
          isVerified={provider.isVerified}
          labels={labels}
        />
      </div>
    </article>
  );
}

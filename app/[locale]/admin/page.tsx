import { redirect } from "next/navigation";
import { BusinessRequestActions } from "@/components/admin/business-request-actions";
import { LogoutButton } from "@/components/admin/logout-button";
import { MetadataManager } from "@/components/admin/metadata-manager";
import { ProviderActions } from "@/components/admin/provider-actions";
import { SupportCaseActions } from "@/components/admin/support-case-actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { APP_BUILD_LABEL } from "@/lib/build-info";
import { formatDate } from "@/lib/format";
import { getDictionary, getLocalizedValue, isLocale } from "@/lib/i18n";
import { getGrowthStage, getOpportunityTypes, getProviderReadiness, isMentorReady } from "@/lib/provider-growth";
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
  const supportCategoryLabels = dictionary.support.categories;
  const businessStatusLabels = {
    new: dictionary.admin.businessNew,
    under_review: dictionary.admin.businessUnderReview,
    matched: dictionary.admin.businessMatched,
    closed: dictionary.admin.businessClosed,
    rejected: dictionary.admin.businessRejected,
  };
  const providerStatusLabels = {
    approved: dictionary.common.approved,
    draft: locale === "ar" ? "مسودة" : "Brouillon",
    submitted: locale === "ar" ? "مرسل" : "Soumis",
    under_review: locale === "ar" ? "قيد المراجعة" : "En revue",
    rejected: dictionary.common.rejected,
    needs_more_info: dictionary.admin.needsMoreInfo,
    suspended: locale === "ar" ? "معلّق" : "Suspendu",
    deactivated_by_provider: locale === "ar" ? "أوقفه المزود" : "Désactivé par le prestataire",
    pending_deletion: locale === "ar" ? "بانتظار الحذف" : "Suppression demandée",
    deleted: locale === "ar" ? "محذوف" : "Supprimé",
  };
  const providerActionLabels = {
    approve: dictionary.admin.approve,
    reject: dictionary.admin.reject,
    needsMoreInfo: dictionary.admin.needsMoreInfo,
    verify: dictionary.admin.verify,
    unverify: dictionary.admin.unverify,
    suspend: locale === "ar" ? "تعليق" : "Suspendre",
    reactivate: locale === "ar" ? "إعادة التفعيل" : "Réactiver",
  };
  const pendingProviders = dashboard.providers.filter((provider) =>
    provider.status === "submitted" || provider.status === "under_review" || provider.status === "needs_more_info",
  );
  const reviewedProviders = dashboard.providers.filter((provider) =>
    provider.status === "approved" ||
    provider.status === "rejected" ||
    provider.status === "suspended" ||
    provider.status === "deactivated_by_provider" ||
    provider.status === "pending_deletion",
  );
  const approvedProviders = dashboard.providers.filter((provider) => provider.status === "approved");
  const verifiedProviders = dashboard.providers.filter((provider) => provider.isVerified);
  const supportCasesNeedingAttention = dashboard.supportCases.filter(
    (supportCase) => supportCase.status !== "resolved" || supportCase.requestSafetyBlock || supportCase.privacySensitive,
  );
  const activeBusinessRequests = dashboard.businessRequests.filter((request) => request.status !== "closed" && request.status !== "rejected");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={`section-title font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.admin.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{dictionary.admin.description}</p>
          <p className="mt-2 text-xs font-medium text-[var(--muted)]">
            {locale === "ar" ? "إصدار الواجهة الحالي" : "Version active"}: {APP_BUILD_LABEL}
          </p>
        </div>
        <LogoutButton locale={locale} label={dictionary.admin.logout} />
      </section>

      <section className="surface-card rounded-[1.75rem] p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold">{dictionary.admin.providers}</h2>
        </div>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-4">
            <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "بانتظار القرار" : "En attente de décision"}</div>
            <div className="mt-2 text-3xl font-extrabold text-[var(--ink)]">{pendingProviders.length}</div>
          </div>
          <div className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4">
            <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "مقبولون ويظهرون للعموم" : "Approuvés et visibles"}</div>
            <div className="mt-2 text-3xl font-extrabold text-[var(--ink)]">{approvedProviders.length}</div>
          </div>
          <div className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4">
            <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "موثّقون" : "Vérifiés"}</div>
            <div className="mt-2 text-3xl font-extrabold text-[var(--ink)]">{verifiedProviders.length}</div>
          </div>
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
                    labels={providerActionLabels}
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
                  labels={providerActionLabels}
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-semibold">{booking.customerName}</div>
                  <span className="status-pill border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]">{booking.status}</span>
                </div>
                <div className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  {booking.providerSlug} • {formatDate(booking.proposedDate ?? booking.date, locale)} • {booking.proposedTime ?? booking.time}
                </div>
                <div className="mt-1 text-sm text-[var(--muted)]">
                  {booking.address} • {booking.preferredContactMethod}
                </div>
                {booking.providerNote ? <div className="mt-2 text-sm text-[var(--muted)]">{booking.providerNote}</div> : null}
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
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-4">
            <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "حالات مفتوحة أو قيد المتابعة" : "Cas ouverts ou en suivi"}</div>
            <div className="mt-2 text-3xl font-extrabold text-[var(--ink)]">{supportCasesNeedingAttention.length}</div>
          </div>
          <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-4">
            <div className="text-sm font-semibold text-rose-700">{locale === "ar" ? "طلبات حظر التواصل" : "Demandes de blocage"}</div>
            <div className="mt-2 text-3xl font-extrabold text-rose-800">
              {dashboard.supportCases.filter((supportCase) => supportCase.requestSafetyBlock).length}
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-blue-200 bg-blue-50 px-4 py-4">
            <div className="text-sm font-semibold text-blue-700">{locale === "ar" ? "حالات حساسة" : "Cas sensibles"}</div>
            <div className="mt-2 text-3xl font-extrabold text-blue-800">
              {dashboard.supportCases.filter((supportCase) => supportCase.privacySensitive).length}
            </div>
          </div>
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
                      {supportCategoryLabels[supportCase.category]}
                    </span>
                    {supportCase.requestSafetyBlock ? (
                      <span className="status-pill border border-rose-200 bg-rose-50 text-rose-700">
                        {dictionary.admin.blockRequested}
                      </span>
                    ) : null}
                    {supportCase.privacySensitive ? (
                      <span className="status-pill border border-blue-200 bg-blue-50 text-blue-700">
                        {dictionary.admin.privateHandling}
                      </span>
                    ) : null}
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
                    <div>{locale === "ar" ? "طلب حظر التواصل" : "Demande de blocage"}: {supportCase.requestSafetyBlock ? (locale === "ar" ? "نعم" : "Oui") : (locale === "ar" ? "لا" : "Non")}</div>
                    <div>{locale === "ar" ? "معالجة بحساسية أعلى" : "Traitement sensible"}: {supportCase.privacySensitive ? (locale === "ar" ? "نعم" : "Oui") : (locale === "ar" ? "لا" : "Non")}</div>
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
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold">{dictionary.admin.businessRequests}</h2>
        </div>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-4">
            <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "طلبات نشطة" : "Demandes actives"}</div>
            <div className="mt-2 text-3xl font-extrabold text-[var(--ink)]">{activeBusinessRequests.length}</div>
          </div>
          <div className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4">
            <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "تمت مطابقتها" : "Déjà mises en relation"}</div>
            <div className="mt-2 text-3xl font-extrabold text-[var(--ink)]">
              {dashboard.businessRequests.filter((request) => request.status === "matched").length}
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4">
            <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "طلبات جديدة" : "Nouvelles demandes"}</div>
            <div className="mt-2 text-3xl font-extrabold text-[var(--ink)]">
              {dashboard.businessRequests.filter((request) => request.status === "new").length}
            </div>
          </div>
        </div>
        <div className="space-y-5">
          {dashboard.businessRequests.length === 0 ? (
            <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-4 text-sm text-[var(--muted)]">
              {dictionary.admin.businessNoRequests}
            </div>
          ) : (
            dashboard.businessRequests.map((businessRequest) => {
              const categoryLabel = getLocalizedValue(
                categoryMap.get(businessRequest.categorySlug)?.name ?? { ar: businessRequest.categorySlug, fr: businessRequest.categorySlug },
                locale,
              );
              const provinceLabel = getLocalizedValue(
                dashboard.zones.find((zone) => zone.provinceSlug === businessRequest.wilayaSlug)?.provinceName ?? { ar: businessRequest.wilayaSlug, fr: businessRequest.wilayaSlug },
                locale,
              );
              const suggestedProviders = approvedProviders.filter((provider) => {
                if (provider.categorySlug !== businessRequest.categorySlug) {
                  return false;
                }

                if (businessRequest.preferredProviderType === "either") {
                  return true;
                }

                return provider.profileType === businessRequest.preferredProviderType;
              });

              return (
                <article key={businessRequest.id} className="rounded-[1.5rem] border border-[var(--line)] bg-white p-5">
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="status-pill border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]">
                          {businessStatusLabels[businessRequest.status]}
                        </span>
                        <span className="status-pill border border-[var(--line)] bg-white text-[var(--ink)]">
                          {categoryLabel}
                        </span>
                        <span className="status-pill border border-[var(--line)] bg-white text-[var(--ink)]">
                          {provinceLabel}
                        </span>
                        <span className="status-pill border border-[var(--line)] bg-white text-[var(--ink)]">
                          #{businessRequest.id}
                        </span>
                      </div>
                      <h3 className={`mt-3 text-lg font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{businessRequest.companyName}</h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{businessRequest.description}</p>
                      <div className="mt-4 grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
                        <div>{dictionary.admin.businessContact}: {businessRequest.contactName}</div>
                        <div>{locale === "ar" ? "الهاتف" : "Téléphone"}: {businessRequest.phone}</div>
                        <div>{dictionary.admin.businessFrequency}: {businessRequest.frequency === "recurring" ? (locale === "ar" ? "متكرر" : "Récurrent") : (locale === "ar" ? "مرة واحدة" : "Ponctuel")}</div>
                        <div>{dictionary.admin.businessTimeline}: {businessRequest.timeline}</div>
                        <div>{dictionary.admin.businessPreferredType}: {businessRequest.preferredProviderType === "either" ? (locale === "ar" ? "أيّهما مناسب" : "Peu importe") : businessRequest.preferredProviderType === "home_business" ? (locale === "ar" ? "نشاط منزلي" : "Activité à domicile") : (locale === "ar" ? "مزود خدمة فردي" : "Prestataire individuel")}</div>
                        <div>{dictionary.admin.businessBudget}: {businessRequest.budget || "-"}</div>
                      </div>
                      {businessRequest.attachmentNames.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {businessRequest.attachmentNames.map((attachment) => (
                            <span key={attachment} className="chip-button min-h-0 px-3 py-2 text-xs">
                              {attachment}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <BusinessRequestActions
                      locale={locale}
                      businessRequest={businessRequest}
                      suggestedProviders={suggestedProviders}
                      labels={dictionary.admin}
                    />
                  </div>
                </article>
              );
            })
          )}
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
    suspend: string;
    reactivate: string;
  };
}) {
  const readiness = getProviderReadiness(provider);
  const growthStage = getGrowthStage(provider);
  const opportunities = getOpportunityTypes(provider);
  const stageLabels = {
    starting: locale === "ar" ? "بداية المسار" : "Début de parcours",
    building: locale === "ar" ? "يبني حضوره" : "Profil en construction",
    trusted: locale === "ar" ? "موثوق ويتقدم" : "Fiable et en progression",
    thriving: locale === "ar" ? "موثوق ويزدهر" : "Trusted and thriving",
  };
  const readinessLabels = {
    category: locale === "ar" ? "الفئة" : "Catégorie",
    location: locale === "ar" ? "الموقع" : "Zone",
    contact: locale === "ar" ? "التواصل" : "Contact",
    description: locale === "ar" ? "الوصف" : "Description",
    pricing: locale === "ar" ? "السعر" : "Tarification",
    portfolio: locale === "ar" ? "المعرض" : "Portfolio",
    availability: locale === "ar" ? "التوفر" : "Disponibilités",
    moderation: locale === "ar" ? "المراجعة" : "Revue",
    trust: locale === "ar" ? "الثقة" : "Confiance",
    digital: locale === "ar" ? "الروابط" : "Présence digitale",
    bulk: locale === "ar" ? "الجملة" : "Volume",
  };
  const opportunityLabels = {
    individual_customers: locale === "ar" ? "أفراد" : "Particuliers",
    repeat_clients: locale === "ar" ? "متكرر" : "Récurrent",
    occasion_orders: locale === "ar" ? "مناسبات" : "Occasions",
    business_buyers: locale === "ar" ? "مهني" : "Acheteurs pro",
    bulk_ready: locale === "ar" ? "جملة" : "Volume",
  };
  const readinessTierLabels = {
    starter: locale === "ar" ? "بداية واعدة" : "Bon départ",
    building: locale === "ar" ? "قابل للتحسن" : "En progression",
    good: locale === "ar" ? "جاهز جيداً" : "Bien préparé",
    strong: locale === "ar" ? "جاهز بقوة" : "Très solide",
  };

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
                        : provider.status === "suspended"
                          ? "border border-slate-300 bg-slate-100 text-slate-700"
                        : "status-pill--pending"
                }`}
              >
                {providerStatusLabel}
              </span>
              <span className="status-pill border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]">{categoryLabel}</span>
              {provider.isVerified ? <span className="status-pill status-pill--verified">{locale === "ar" ? "شارة موثّق" : "Badge vérifié"}</span> : null}
              <span className={`status-pill ${provider.status === "approved" ? "status-pill--verified" : "status-pill--pending"}`}>
                {provider.status === "approved"
                  ? locale === "ar"
                    ? "ظاهر للعموم"
                    : "Visible publiquement"
                  : locale === "ar"
                    ? "مخفي عن القوائم العامة"
                    : "Masqué des listes publiques"}
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">{zoneLabels.join(locale === "ar" ? " • " : " • ")}</p>
          </div>

          <div className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
            <div>{locale === "ar" ? "واتساب" : "WhatsApp"}: {provider.whatsappNumber}</div>
            <div>{locale === "ar" ? "الهاتف" : "Téléphone"}: {provider.phoneNumber}</div>
            <div>{locale === "ar" ? "التقييم" : "Note"}: {provider.rating}</div>
            <div>{locale === "ar" ? "الأعمال المكتملة" : "Missions terminées"}: {provider.completedJobs}</div>
          </div>

          <div className="rounded-[1.25rem] border border-[rgba(15,95,255,0.14)] bg-[linear-gradient(180deg,rgba(243,248,255,0.96),rgba(255,255,255,0.98))] p-4 text-sm text-[var(--muted)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الجاهزية والنمو" : "Préparation et progression"}</div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="status-pill border border-[var(--line)] bg-white text-[var(--ink)]">{readiness.score}%</span>
                <span className="chip-button min-h-0 px-3 py-2 text-xs">{readinessTierLabels[readiness.scoreTier]}</span>
              </div>
            </div>
            <div className="mt-2">{locale === "ar" ? "المرحلة الحالية:" : "Étape actuelle :"} {stageLabels[growthStage]}</div>
            <div className="mt-3 overflow-hidden rounded-full bg-[rgba(15,95,255,0.08)]">
              <div
                className="h-2 rounded-full bg-[linear-gradient(90deg,#0f5fff,#4f8dff)]"
                style={{ width: `${Math.max(readiness.score, 8)}%` }}
                aria-hidden="true"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {readiness.checks.slice(0, 6).map((check) => (
                <span
                  key={check.key}
                  className={`status-pill ${
                    check.complete ? "status-pill--verified" : "border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]"
                  }`}
                >
                  {readinessLabels[check.key]}
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {opportunities.map((opportunity) => (
                <span key={opportunity} className="chip-button min-h-0 px-3 py-2 text-xs">
                  {opportunityLabels[opportunity]}
                </span>
              ))}
              {isMentorReady(provider) ? (
                <span className="chip-button min-h-0 px-3 py-2 text-xs">
                  {locale === "ar" ? "جاهز للإلهام" : "Mentor-ready"}
                </span>
              ) : null}
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] p-4 text-sm text-[var(--muted)]">
            <div className="font-semibold text-[var(--ink)]">{locale === "ar" ? "أدلة الطلب" : "Pièces du dossier"}</div>
            <div className="mt-2">
              {locale === "ar" ? "وثيقة التحقق:" : "Document :"} {provider.verification.documentName ?? (locale === "ar" ? "غير مرفق" : "Non fourni")}
            </div>
            <div className="mt-1">
              {locale === "ar" ? "تأكيد 16+:" : "Confirmation 16+ :"} {provider.verification.ageConfirmed ? (locale === "ar" ? "مؤكد" : "Confirmé") : (locale === "ar" ? "غير مؤكد" : "Non confirmé")}
            </div>
            <div className="mt-1">
              {locale === "ar" ? "الموافقة على القواعد:" : "Accord conduite :"} {provider.verification.conductAccepted ? (locale === "ar" ? "مؤكد" : "Confirmé") : (locale === "ar" ? "غير مؤكد" : "Non confirmé")}
            </div>
            <div className="mt-1">
              {locale === "ar" ? "الموافقة على السياسات:" : "Accord politiques :"} {provider.verification.policyAccepted ? (locale === "ar" ? "مؤكد" : "Confirmé") : (locale === "ar" ? "غير مؤكد" : "Non confirmé")}
            </div>
            <div className="mt-1">
              {locale === "ar" ? "ملاحظات الإدارة:" : "Notes admin :"} {provider.verification.notes ?? (locale === "ar" ? "لا توجد" : "Aucune")}
            </div>
            {provider.verification.rejectionReason ? (
              <div className="mt-1">
                {locale === "ar" ? "سبب الرفض:" : "Motif du rejet :"} {provider.verification.rejectionReason}
              </div>
            ) : null}
            {provider.verification.adminNote ? (
              <div className="mt-1">
                {locale === "ar" ? "ملاحظة داخلية:" : "Note interne :"} {provider.verification.adminNote}
              </div>
            ) : null}
            <div className="mt-1">
              {locale === "ar" ? "صور الأعمال:" : "Photos :"} {provider.galleryCaptions?.length ?? provider.gallery.length}
            </div>
            <div className="mt-1">
              {locale === "ar" ? "نتيجة الإجراء:" : "Effet public :"}{" "}
              {provider.status === "approved"
                ? locale === "ar"
                  ? "الملف يمكن أن يظهر في القوائم العامة."
                  : "Le profil peut apparaître dans les listes publiques."
                : locale === "ar"
                  ? "الملف يبقى خارج القوائم العامة حتى القبول."
                  : "Le profil reste hors des listes publiques tant qu'il n'est pas approuvé."}
            </div>
          </div>

          {provider.socialLinks && Object.values(provider.socialLinks).some(Boolean) ? (
            <div className="rounded-[1.25rem] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
              <div className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الحضور الرقمي" : "Présence digitale"}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {provider.socialLinks.facebook ? <a href={provider.socialLinks.facebook} target="_blank" rel="noreferrer" className="chip-button min-h-0 px-3 py-2 text-xs">Facebook</a> : null}
                {provider.socialLinks.instagram ? <a href={provider.socialLinks.instagram} target="_blank" rel="noreferrer" className="chip-button min-h-0 px-3 py-2 text-xs">Instagram</a> : null}
                {provider.socialLinks.tiktok ? <a href={provider.socialLinks.tiktok} target="_blank" rel="noreferrer" className="chip-button min-h-0 px-3 py-2 text-xs">TikTok</a> : null}
                {provider.socialLinks.whatsappBusiness ? <a href={provider.socialLinks.whatsappBusiness} target="_blank" rel="noreferrer" className="chip-button min-h-0 px-3 py-2 text-xs">WhatsApp Business</a> : null}
                {provider.socialLinks.website ? <a href={provider.socialLinks.website} target="_blank" rel="noreferrer" className="chip-button min-h-0 px-3 py-2 text-xs">{locale === "ar" ? "موقع" : "Site web"}</a> : null}
              </div>
            </div>
          ) : null}

          {provider.bulkOrders?.available ? (
            <div className="rounded-[1.25rem] border border-[rgba(15,95,255,0.14)] bg-[linear-gradient(180deg,rgba(243,248,255,0.96),rgba(255,255,255,0.98))] p-4 text-sm text-[var(--muted)]">
              <div className="font-semibold text-[var(--ink)]">{locale === "ar" ? "جاهز لطلبات الجملة أو المشترين المهنيين" : "Ouvert aux commandes en volume"}</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {provider.bulkOrders.minimumOrderQuantity ? (
                  <div>{locale === "ar" ? "الحد الأدنى:" : "Minimum :"} {provider.bulkOrders.minimumOrderQuantity}</div>
                ) : null}
                {provider.bulkOrders.productionCapacity ? (
                  <div>{locale === "ar" ? "القدرة:" : "Capacité :"} {provider.bulkOrders.productionCapacity}</div>
                ) : null}
                {provider.bulkOrders.leadTime ? <div>{locale === "ar" ? "المهلة:" : "Délai :"} {provider.bulkOrders.leadTime}</div> : null}
                {provider.bulkOrders.deliveryArea ? <div>{locale === "ar" ? "منطقة التوصيل:" : "Zone de livraison :"} {provider.bulkOrders.deliveryArea}</div> : null}
              </div>
            </div>
          ) : null}

          {provider.gallery.length > 0 ? (
            <div className="rounded-[1.25rem] border border-[var(--line)] bg-white p-4">
              <div className="mb-3 font-semibold text-[var(--ink)]">{locale === "ar" ? "معرض الأعمال للمراجعة" : "Portfolio pour revue"}</div>
              <div className="grid gap-3 sm:grid-cols-3">
                {provider.gallery.slice(0, 3).map((imageUrl, index) => (
                  <div key={`${provider.id}-${imageUrl}-${index}`} className="overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] shadow-[0_14px_28px_rgba(12,40,104,0.08)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={provider.galleryCaptions?.[index] ?? provider.displayName} className="h-32 w-full object-cover" />
                    <div className="border-t border-[var(--line)] bg-white px-3 py-3 text-xs leading-6 text-[var(--muted)]">
                      {provider.galleryCaptions?.[index] ?? (locale === "ar" ? `عينة ${index + 1}` : `Sample ${index + 1}`)}
                    </div>
                  </div>
                ))}
              </div>
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

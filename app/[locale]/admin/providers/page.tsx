import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProviderVerificationActions } from "@/components/admin/provider-verification-actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { formatDate } from "@/lib/format";
import { getDictionary, getLocalizedValue, isLocale } from "@/lib/i18n";
import { getAdminDashboardData } from "@/lib/repository";

type AdminProvidersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    tab?: string;
    q?: string;
    wilaya?: string;
    category?: string;
    page?: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function buildQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  return query.toString();
}

export default async function AdminProvidersPage({ params, searchParams }: AdminProvidersPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  if (!(await isAdminAuthenticated())) {
    redirect(`/${locale}/admin/login`);
  }

  const query = await searchParams;
  const tab = query.tab === "verified" ? "verified" : "pending";
  const search = (query.q ?? "").trim().toLowerCase();
  const selectedWilaya = query.wilaya ?? "";
  const selectedCategory = query.category ?? "";
  const page = Math.max(1, Number(query.page ?? "1") || 1);
  const pageSize = 20;

  const dictionary = getDictionary(locale);
  const dashboard = await getAdminDashboardData();
  const zoneMap = new Map(dashboard.zones.map((zone) => [zone.slug, zone]));

  const wilayaOptions = Array.from(
    new Map(dashboard.zones.map((zone) => [zone.provinceSlug, zone.provinceName])).entries(),
  ).map(([slug, name]) => ({ slug, name }));

  const filteredProviders = dashboard.providers.filter((provider) => {
    const verificationStatus = provider.verification.status;
    if (tab === "pending" && verificationStatus !== "pending") {
      return false;
    }
    if (tab === "verified" && verificationStatus !== "verified") {
      return false;
    }

    if (search) {
      const haystack = [
        provider.displayName,
        provider.workshopName ?? "",
        provider.phoneNumber,
        provider.whatsappNumber,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) {
        return false;
      }
    }

    if (selectedCategory && provider.categorySlug !== selectedCategory) {
      return false;
    }

    if (selectedWilaya) {
      const matchesWilaya = provider.zones.some((zoneSlug) => zoneMap.get(zoneSlug)?.provinceSlug === selectedWilaya);
      if (!matchesWilaya) {
        return false;
      }
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProviders.length / pageSize));
  const pageIndex = Math.min(page, totalPages);
  const visibleProviders = filteredProviders.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
  const pendingCount = dashboard.providers.filter((provider) => provider.verification.status === "pending").length;
  const verifiedCount = dashboard.providers.filter((provider) => provider.verification.status === "verified").length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section>
        <h1 className={`text-3xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
          {locale === "ar" ? "التحقق من المزوّدين" : "Vérification des prestataires"}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
          {locale === "ar"
            ? "هذه القائمة تفصل بين المزوّدين بانتظار التوثيق والمزوّدين الذين حصلوا على شارة التوثيق."
            : "Cette liste sépare les profils en attente de vérification et ceux déjà vérifiés."}
        </p>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href={`/${locale}/admin/providers?${buildQuery({ ...query, tab: "pending", page: "1" })}`}
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${
            tab === "pending" ? "border-terracotta bg-terracotta-pale text-terracotta" : "border-[var(--line)] bg-white text-[var(--muted)]"
          }`}
        >
          {locale === "ar" ? "بانتظار التحقق" : "En attente"} ({pendingCount})
        </Link>
        <Link
          href={`/${locale}/admin/providers?${buildQuery({ ...query, tab: "verified", page: "1" })}`}
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${
            tab === "verified" ? "border-terracotta bg-terracotta-pale text-terracotta" : "border-[var(--line)] bg-white text-[var(--muted)]"
          }`}
        >
          {locale === "ar" ? "المُحقَّقون" : "Vérifiés"} ({verifiedCount})
        </Link>
      </section>

      <section className="surface-card rounded-[1.75rem] p-6">
        <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              {locale === "ar" ? "بحث بالاسم أو الهاتف" : "Recherche nom / téléphone"}
            </span>
            <input name="q" defaultValue={query.q ?? ""} className="input-base" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              {locale === "ar" ? "الولاية" : "Wilaya"}
            </span>
            <select name="wilaya" defaultValue={selectedWilaya} className="input-base">
              <option value="">{locale === "ar" ? "كل الولايات" : "Toutes les wilayas"}</option>
              {wilayaOptions.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {getLocalizedValue(item.name, locale)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              {locale === "ar" ? "الفئة" : "Catégorie"}
            </span>
            <select name="category" defaultValue={selectedCategory} className="input-base">
              <option value="">{locale === "ar" ? "كل الفئات" : "Toutes les catégories"}</option>
              {dashboard.categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {getLocalizedValue(category.name, locale)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <input type="hidden" name="tab" value={tab} />
            <button type="submit" className="button-primary w-full">
              {locale === "ar" ? "تحديث" : "Mettre à jour"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-5">
        {visibleProviders.length === 0 ? (
          <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-4 text-sm text-[var(--muted)]">
            {locale === "ar" ? "لا توجد نتائج حالياً." : "Aucun résultat pour le moment."}
          </div>
        ) : (
          visibleProviders.map((provider) => {
            const categoryLabel =
              dashboard.categories.find((category) => category.slug === provider.categorySlug)?.name ?? {
                ar: provider.categorySlug,
                fr: provider.categorySlug,
              };
            const zoneLabels = provider.zones
              .map((zoneSlug) => zoneMap.get(zoneSlug))
              .filter(Boolean)
              .map((zone) => zone?.provinceName);
            const primaryZoneLabel = zoneLabels[0] ? getLocalizedValue(zoneLabels[0]!, locale) : "-";
            const contactVerified = Boolean(provider.verification.phoneVerified || provider.verification.emailVerified);

            return (
              <article key={provider.id} className="grid gap-5 rounded-[1.5rem] border border-[var(--line)] bg-white p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="status-pill border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]">
                      {provider.verification.status === "verified"
                        ? locale === "ar" ? "موثّق" : "Vérifié"
                        : locale === "ar" ? "قيد التحقق" : "En attente"}
                    </span>
                    <span className="status-pill border border-[var(--line)] bg-white text-[var(--ink)]">
                      {getLocalizedValue(categoryLabel, locale)}
                    </span>
                    <span className="status-pill border border-[var(--line)] bg-white text-[var(--ink)]">{primaryZoneLabel}</span>
                    <span className={`status-pill border ${contactVerified ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                      {contactVerified
                        ? locale === "ar" ? "جهة الاتصال مؤكدة" : "Contact vérifié"
                        : locale === "ar" ? "التحقق من جهة الاتصال مفقود" : "Contact non vérifié"}
                    </span>
                  </div>
                  <h3 className={`mt-3 text-lg font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{provider.displayName}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {locale === "ar" ? "الهاتف" : "Téléphone"}: {provider.phoneNumber}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {locale === "ar" ? "تاريخ التسجيل" : "Inscription"}:{" "}
                    {provider.verification.acceptedAt ? formatDate(provider.verification.acceptedAt, locale) : "-"}
                  </p>
                  <Link href={`/${locale}/providers/${provider.slug}`} className="mt-3 inline-flex text-sm font-semibold text-terracotta">
                    {locale === "ar" ? "عرض الملف الكامل" : "Voir le profil"}
                  </Link>
                </div>

                <ProviderVerificationActions
                  locale={locale}
                  providerId={provider.id}
                  status={provider.verification.status}
                  contactVerified={contactVerified}
                />
              </article>
            );
          })
        )}
      </section>

      <section className="flex items-center justify-between text-sm text-[var(--muted)]">
        <span>
          {locale === "ar"
            ? `الصفحة ${pageIndex} من ${totalPages}`
            : `Page ${pageIndex} sur ${totalPages}`}
        </span>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/admin/providers?${buildQuery({ ...query, page: String(Math.max(1, pageIndex - 1)) })}`}
            className={`rounded-full border px-3 py-1 ${
              pageIndex <= 1 ? "pointer-events-none border-[var(--line)] bg-[var(--soft)] text-[var(--muted)]" : "border-[var(--line)] bg-white text-[var(--ink)]"
            }`}
          >
            {locale === "ar" ? "السابق" : "Précédent"}
          </Link>
          <Link
            href={`/${locale}/admin/providers?${buildQuery({ ...query, page: String(Math.min(totalPages, pageIndex + 1)) })}`}
            className={`rounded-full border px-3 py-1 ${
              pageIndex >= totalPages ? "pointer-events-none border-[var(--line)] bg-[var(--soft)] text-[var(--muted)]" : "border-[var(--line)] bg-white text-[var(--ink)]"
            }`}
          >
            {locale === "ar" ? "التالي" : "Suivant"}
          </Link>
        </div>
      </section>
    </div>
  );
}

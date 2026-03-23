import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProviderLogoutButton } from "@/components/providers/provider-logout-button";
import { formatDate } from "@/lib/format";
import { getAuthenticatedProvider } from "@/lib/provider-auth";
import { isLocale } from "@/lib/i18n";
import { getBookingsForProvider, getCategories, getReviews, getZones } from "@/lib/repository";

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

function getProviderStatusCopy(locale: "ar" | "fr", status: string) {
  if (locale === "ar") {
    return {
      approved: {
        label: "مقبول ويظهر للزبائن",
        description: "ملفك ظاهر الآن للعموم ويمكنك متابعة الطلبات والحجوزات من هذه اللوحة.",
      },
      submitted: {
        label: "تم إرسال الطلب",
        description: "طلبك وصل إلى الإدارة وهو الآن بانتظار المراجعة اليدوية قبل الظهور للعموم.",
      },
      under_review: {
        label: "قيد المراجعة",
        description: "الإدارة تراجع الملف ووثيقة التحقق. يمكنك تحديث بياناتك أو العودة لاحقاً لمتابعة الحالة.",
      },
      needs_more_info: {
        label: "نحتاج معلومات إضافية",
        description: "هناك تفاصيل ناقصة أو تحتاج توضيحاً. راجع ملاحظة الإدارة وحدّث الملف من صفحة الإدارة الذاتية.",
      },
      rejected: {
        label: "الطلب غير مقبول حالياً",
        description: "الملف غير ظاهر للعموم حالياً. راجع سبب الرفض أو ملاحظة الإدارة ثم حدّث بياناتك إذا لزم.",
      },
      suspended: {
        label: "الملف معلّق",
        description: "تم إيقاف ظهور الملف من جهة الإدارة مؤقتاً، لذلك لن يظهر في القوائم العامة الآن.",
      },
      deactivated_by_provider: {
        label: "الملف موقوف مؤقتاً",
        description: "أوقفت ظهور ملفك بنفسك. يمكنك إعادة التفعيل لاحقاً من صفحة الملف.",
      },
      pending_deletion: {
        label: "طلب مغادرة قيد المعالجة",
        description: "تم تسجيل طلب مغادرة المنصة مع الحفاظ على السجل الإداري والمراجعة عند الحاجة.",
      },
      deleted: {
        label: "تم إغلاق الملف",
        description: "هذا الملف لم يعد نشطاً داخل Hannini.",
      },
      draft: {
        label: "مسودة",
        description: "الملف لم يكتمل بعد ولم يدخل دورة المراجعة.",
      },
    }[status] ?? {
      label: status,
      description: "يمكنك متابعة حالتك من هذه اللوحة وتحديث الملف عند الحاجة.",
    };
  }

  return {
    approved: {
      label: "Approuvé et visible",
      description: "Votre profil est maintenant visible publiquement et vous pouvez suivre vos demandes depuis ce tableau.",
    },
    submitted: {
      label: "Demande envoyée",
      description: "Votre dossier a bien été reçu par l’admin et attend maintenant la revue manuelle avant publication.",
    },
    under_review: {
      label: "En cours de revue",
      description: "L’admin vérifie votre dossier et votre justificatif. Vous pouvez mettre votre profil à jour puis revenir plus tard.",
    },
    needs_more_info: {
      label: "Informations complémentaires nécessaires",
      description: "Certains éléments doivent être précisés. Consultez la note admin et mettez votre profil à jour.",
    },
    rejected: {
      label: "Demande non retenue pour le moment",
      description: "Le profil n’est pas visible publiquement. Consultez le motif puis corrigez votre dossier si nécessaire.",
    },
    suspended: {
      label: "Profil suspendu",
      description: "La visibilité a été suspendue par l’admin, donc le profil n’apparaît pas dans les listes publiques pour l’instant.",
    },
    deactivated_by_provider: {
      label: "Profil mis en pause",
      description: "Vous avez vous-même mis la visibilité du profil en pause. Vous pourrez le réactiver depuis votre profil.",
    },
    pending_deletion: {
      label: "Départ en attente de traitement",
      description: "Votre demande de départ a bien été enregistrée tout en conservant l’historique administratif utile.",
    },
    deleted: {
      label: "Profil fermé",
      description: "Ce profil n’est plus actif dans Hannini.",
    },
    draft: {
      label: "Brouillon",
      description: "Le profil n’est pas encore complet et n’est pas entré dans le circuit de revue.",
    },
  }[status] ?? {
    label: status,
    description: "Vous pouvez suivre votre état depuis ce tableau et mettre le profil à jour si besoin.",
  };
}

export default async function ProviderDashboardPage({ params }: ProviderDashboardPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const provider = await getAuthenticatedProvider();

  if (!provider) {
    redirect(`/${locale}/provider/login`);
  }

  const [bookings, categories, zones, reviews] = await Promise.all([
    getBookingsForProvider(provider.id),
    getCategories(),
    getZones(),
    getReviews(provider.id),
  ]);
  const category = categories.find((item) => item.slug === provider.categorySlug);
  const zoneMap = new Map(zones.map((zone) => [zone.slug, zone]));
  const upcomingBookings = bookings.filter((booking) => booking.status !== "completed" && booking.status !== "cancelled");
  const recentReviews = reviews.slice(0, 3);
  const statusCopy = getProviderStatusCopy(locale, provider.status);
  const completedBookings = bookings.filter((booking) => booking.status === "completed").length;

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
            <Link href={`/${locale}/providers`} className="button-secondary">
              {locale === "ar" ? "استخدم Hannini كزبون" : "Utiliser Hannini comme client"}
            </Link>
            <ProviderLogoutButton locale={locale} />
            <Link href={`/${locale}/provider/profile`} className="button-primary">
              {locale === "ar" ? "تعديل الملف وإدارته" : "Modifier et gérer le profil"}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4">
            <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "الحالة الحالية" : "Statut actuel"}</div>
            <div className="mt-2 text-2xl font-extrabold text-[var(--ink)]">{statusCopy.label}</div>
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

        <div className="mt-5 rounded-[1.35rem] border border-[rgba(20,92,255,0.12)] bg-[var(--soft)] px-5 py-4 text-sm leading-7 text-[var(--muted)]">
          <div className="font-semibold text-[var(--ink)]">{statusCopy.label}</div>
          <div className="mt-2">{statusCopy.description}</div>
          {provider.verification.adminNote ? (
            <div className="mt-3">
              <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "ملاحظة الإدارة:" : "Note admin :"}</span>{" "}
              {provider.verification.adminNote}
            </div>
          ) : null}
          {provider.verification.rejectionReason ? (
            <div className="mt-3">
              <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "سبب القرار:" : "Motif :"}</span>{" "}
              {provider.verification.rejectionReason}
            </div>
          ) : null}
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
            <h2 className="text-xl font-extrabold">{locale === "ar" ? "التقييمات والسمعة" : "Avis et réputation"}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4">
                <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "متوسط التقييم" : "Note moyenne"}</div>
                <div className="mt-2 text-2xl font-extrabold text-[var(--ink)]">{provider.rating.toFixed(1)}</div>
              </div>
              <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-4">
                <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "خدمات مكتملة" : "Services terminés"}</div>
                <div className="mt-2 text-2xl font-extrabold text-[var(--ink)]">{completedBookings}</div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {recentReviews.length === 0 ? (
                <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-4 text-sm text-[var(--muted)]">
                  {locale === "ar" ? "لا توجد تقييمات جديدة بعد. ستظهر هنا بعد إنهاء الطلبات وإرسال الزبائن لآرائهم." : "Aucun nouvel avis pour le moment. Ils apparaîtront ici après la fin des demandes et l’envoi des retours clients."}
                </div>
              ) : (
                recentReviews.map((review) => (
                  <article key={review.id} className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-[var(--ink)]">{review.customerName}</div>
                      <div className="text-[var(--muted)]">{review.rating}/5</div>
                    </div>
                    <p className="mt-2 leading-7 text-[var(--muted)]">{review.comment}</p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="surface-card rounded-[1.75rem] p-6">
            <h2 className="text-xl font-extrabold">{locale === "ar" ? "الظهور والمراجعة" : "Visibilité et revue"}</h2>
            <div className="mt-4 rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)]">
              <div><span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الحالة:" : "Statut :"}</span> {statusCopy.label}</div>
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
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/support?actor=provider&category=account_help&providerId=${provider.id}&providerSlug=${provider.slug}`}
                className="button-secondary"
              >
                {locale === "ar" ? "طلب مساعدة أو مراجعة" : "Demander de l’aide ou une revue"}
              </Link>
              <Link
                href={`/${locale}/support?actor=provider&category=unsafe_behavior&providerId=${provider.id}&providerSlug=${provider.slug}`}
                className="button-secondary"
              >
                {locale === "ar" ? "الإبلاغ عن سلوك غير آمن" : "Signaler un comportement dangereux"}
              </Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

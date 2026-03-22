import Link from "next/link";
import { getDictionary, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

type SafetyPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SafetyPage({ params }: SafetyPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="surface-card rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.99),rgba(227,239,255,0.96)_58%,rgba(206,225,255,0.92))] p-6 text-[var(--ink)] shadow-[0_28px_60px_rgba(12,40,104,0.18)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--ink)]">{dictionary.safety.title}</div>
            <h1 className={`mt-3 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl ${locale === "ar" ? "arabic-display" : ""}`}>
              {dictionary.safety.subtitle}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--ink)]">{dictionary.safety.description}</p>
          </div>

          <div className="rounded-[1.5rem] border border-[rgba(15,95,255,0.12)] bg-white p-5 backdrop-blur">
            <div className="text-sm font-semibold text-[var(--ink)]">{locale === "ar" ? "خطوات سريعة" : "Actions rapides"}</div>
            <div className="mt-4 space-y-3">
              {dictionary.safety.quickActions.map((item) => (
                <div key={item} className="rounded-[1.15rem] border border-[rgba(15,95,255,0.12)] bg-[var(--soft)] px-4 py-3 text-sm leading-7 text-[var(--ink)]">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/${locale}/support?category=unsafe_behavior`} className="button-secondary">
                {dictionary.safety.cta}
              </Link>
              <Link href={`/${locale}/conduct`} className="button-secondary">
                {dictionary.conduct.linkLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {dictionary.safety.cards.map((card) => (
          <article key={card.title} className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(231,240,255,0.9))] p-6 shadow-[0_18px_40px_rgba(15,95,255,0.08)]">
            <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{card.title}</h2>
            <ul className="mt-5 space-y-3">
              {card.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 rounded-[1.15rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-3 text-sm leading-7 text-[var(--ink)]">
                  <span className="mt-2 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(231,240,255,0.9))] p-6 shadow-[0_18px_40px_rgba(15,95,255,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--ink)]">
              {locale === "ar" ? "الدعم داخل مركز الأمان" : "Support dans le centre sécurité"}
            </div>
            <h2 className={`mt-2 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
              {locale === "ar" ? "إذا احتجت مساعدة أو متابعة واضحة" : "Si vous avez besoin d'aide ou d'un suivi clair"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-[var(--ink)]">
              {locale === "ar"
                ? "يمكنك فتح طلب دعم من هنا عند وجود تحرش، سلوك غير آمن، احتيال، أو حاجة إلى تدخل الإدارة. سيظهر الطلب داخل لوحة الإدارة بحالة متابعة واضحة."
                : "Vous pouvez ouvrir une demande de support depuis ici en cas de harcèlement, comportement dangereux, fraude ou besoin d'un relais admin. La demande apparaît ensuite dans l'admin avec un suivi clair."}
            </p>
          </div>
          <Link href={`/${locale}/support`} className="button-secondary">
            {locale === "ar" ? "افتح الدعم" : "Ouvrir le support"}
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            locale === "ar" ? "الإبلاغ عن التحرش أو الإساءة" : "Signaler un harcèlement ou une intimidation",
            locale === "ar" ? "الإبلاغ عن احتيال أو نصب" : "Signaler une fraude ou une arnaque",
            locale === "ar" ? "طلب حظر التواصل أو متابعة أكثر خصوصية" : "Demander un blocage de contact ou un traitement plus discret",
            locale === "ar" ? "فتح طلب دعم عام مرتبط بالحجز أو بالمزوّد" : "Ouvrir un support lié à une réservation ou à un prestataire",
          ].map((item) => (
            <div key={item} className="rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-4 text-sm leading-7 text-[var(--ink)]">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

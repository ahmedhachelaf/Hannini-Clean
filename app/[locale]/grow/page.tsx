import Link from "next/link";
import { getDictionary, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { TipOfDayCard } from "@/components/grow/tip-of-the-day-card";

type GrowPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function GrowPage({ params }: GrowPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const pathwaySteps = [
    locale === "ar" ? "انضممت" : "Rejoint",
    locale === "ar" ? "أكملت الملف" : "Profil complété",
    locale === "ar" ? "أضفت معرض أعمال" : "Portfolio ajouté",
    locale === "ar" ? "تمت المراجعة" : "Dossier revu",
    locale === "ar" ? "تم القبول" : "Approuvé",
    locale === "ar" ? "أول زبون" : "Premier client",
    locale === "ar" ? "أول 5 أعمال" : "5 premières missions",
    locale === "ar" ? "تقييم قوي" : "Très bien noté",
    locale === "ar" ? "جاهز للجملة" : "Prêt au volume",
    locale === "ar" ? "جاهز لإلهام غيره" : "Mentor-ready",
  ];
  const profileStrengthSignals = [
    locale === "ar" ? "الفئة والمنطقة واضحتان" : "Catégorie et zone clairement définies",
    locale === "ar" ? "التواصل متاح عبر الهاتف أو واتساب" : "Contact clair par téléphone ou WhatsApp",
    locale === "ar" ? "سعر البداية ورسوم التنقل/التوصيل واضحة" : "Prix de départ et frais visibles",
    locale === "ar" ? "الوصف يشرح الخدمة أو النشاط بشكل مختصر" : "Description simple et crédible",
    locale === "ar" ? "صور الأعمال مرفوعة وتظهر الجودة" : "Échantillons visuels publiés",
    locale === "ar" ? "الحالة الإدارية والثقة واضحة" : "Statut de revue et confiance visibles",
  ];
  const extraGuides = [
    {
      title: locale === "ar" ? "كيف تستعد لطلبات أكبر أو مشترين مهنيين" : "Se préparer aux commandes en volume",
      description:
        locale === "ar"
          ? "إذا كنت نشاطاً منزلياً أو منتجاً صغيراً، اذكر الحد الأدنى، القدرة، والمهلة حتى تبدو جاهزاً لفرص أكبر."
          : "Pour une activité à domicile ou une petite production, indiquez minimum, capacité et délai pour rassurer les acheteurs plus importants.",
      bullets:
        locale === "ar"
          ? [
              "لا تفعّل خيار الجملة إلا عندما تكون قادراً على الالتزام بالكمية.",
              "اذكر ما يمكنك تسليمه أسبوعياً أو لكل مناسبة.",
              "حدد منطقة التوصيل أو التسليم بوضوح.",
            ]
          : [
              "N'activez l'option volume que si vous pouvez vraiment tenir la cadence.",
              "Indiquez ce que vous pouvez livrer par semaine ou par occasion.",
              "Précisez clairement la zone de livraison ou remise.",
            ],
    },
    {
      title: locale === "ar" ? "كيف تحسن الاعتمادية وسرعة الرد" : "Améliorer fiabilité et temps de réponse",
      description:
        locale === "ar"
          ? "الفرص المتكررة تأتي عندما يعرف الزبون أنك ترد بسرعة وتلتزم بما تعد به."
          : "Les opportunités répétées arrivent quand le client sait que vous répondez vite et tenez vos engagements.",
      bullets:
        locale === "ar"
          ? [
              "حدد ساعات واضحة للرد أو الاستقبال.",
              "استخدم رسالة أولية مختصرة ثم اطلب التفاصيل الأساسية.",
              "إذا تعذر التنفيذ، اعتذر مبكراً بدل ترك الطلب معلقاً.",
            ]
          : [
              "Affichez des horaires clairs de réponse ou de prise en charge.",
              "Utilisez un premier message simple puis demandez les détails essentiels.",
              "Si vous ne pouvez pas accepter, dites-le tôt au lieu de laisser attendre.",
            ],
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="surface-card gradient-frame rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.99),rgba(227,239,255,0.96)_58%,rgba(206,225,255,0.92))] p-6 text-[var(--ink)] shadow-[0_30px_70px_rgba(12,40,104,0.18)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--ink)]">{dictionary.nav.grow}</div>
            <h1 className={`mt-3 text-4xl font-extrabold tracking-[-0.05em] text-[var(--ink)] sm:text-5xl ${locale === "ar" ? "arabic-display" : ""}`}>
              {dictionary.grow.title}
            </h1>
            <p className="mt-4 text-lg font-semibold text-[var(--ink)]">{dictionary.grow.subtitle}</p>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--ink)]">{dictionary.grow.description}</p>
          </div>

          <div className="rounded-[1.5rem] border border-[rgba(20,92,255,0.18)] bg-white p-5 shadow-[0_8px_24px_rgba(11,63,184,0.08)]">
            <div className="text-sm font-bold text-[var(--navy)]">{dictionary.nav.providers}</div>
            <div className="mt-2 text-sm leading-7 text-[var(--ink)]">{dictionary.grow.laneService}</div>
            <div className="mt-4 text-sm font-bold text-[var(--navy)]">{dictionary.nav.businesses}</div>
            <div className="mt-2 text-sm leading-7 text-[var(--ink)]">{dictionary.grow.laneBusiness}</div>
            <div className="mt-5 rounded-[1.25rem] border border-[rgba(20,92,255,0.16)] bg-[var(--soft)] px-4 py-4 text-sm font-semibold leading-7 text-[var(--navy)]">
              {dictionary.grow.academySoon}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="surface-card rounded-[1.75rem] p-6">
          <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.grow.checklistTitle}</h2>
          <div className="mt-5 space-y-3">
            {dictionary.grow.checklistItems.map((item, index) => (
              <div key={item} className="rounded-[1.35rem] border border-[rgba(15,95,255,0.12)] bg-[var(--soft)] p-4 shadow-[0_10px_24px_rgba(15,95,255,0.06)]">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-sm font-extrabold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-7 text-[var(--muted)]">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <div className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(232,242,255,0.9))] p-6 shadow-[0_18px_40px_rgba(15,95,255,0.08)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
                  {locale === "ar" ? "رحلة التقدّم داخل هَنّيني" : "Parcours de progression sur Hannini"}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                  {locale === "ar"
                    ? "الفكرة ليست مجرد الظهور. هَنّيني يساعدك تتحرك خطوة بخطوة من ملف جديد إلى نشاط يبعث على الثقة ويستقبل فرصاً أوضح وأكبر."
                    : "L'objectif n'est pas seulement d'être visible. Hannini vous aide à avancer, étape après étape, d'un nouveau profil vers une activité plus fiable et mieux préparée."}
                </p>
              </div>
              <span className="status-pill border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]">
                {locale === "ar" ? "رحلة خفيفة وعملية" : "Parcours léger et utile"}
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {pathwaySteps.map((step, index) => (
                <div key={step} className="rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)] shadow-[0_10px_24px_rgba(15,95,255,0.06)]">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--navy)] text-sm font-extrabold text-white">
                      {index + 1}
                    </div>
                    <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(20,92,255,0.28),rgba(20,92,255,0.03))]" aria-hidden="true" />
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                    {locale === "ar" ? `مرحلة ${index + 1}` : `Étape ${index + 1}`}
                  </div>
                  <div className="mt-2 font-semibold text-[var(--ink)]">{step}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-[1.75rem] p-6">
            <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
              {locale === "ar" ? "ما الذي يجعل الملف أقوى؟" : "Qu'est-ce qui renforce un profil ?"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
              {locale === "ar"
                ? "في هذا الـMVP، الجاهزية تعني أن ملفك يشرح ما تقدمه، يظهر عينات من العمل، ويعطي انطباعاً واضحاً عن الثقة والقدرة على الاستجابة."
                : "Dans ce MVP, la préparation d'un profil repose sur la clarté de l'offre, la présence d'exemples de travail et une impression nette de confiance et de réactivité."}
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {profileStrengthSignals.map((signal) => (
                <div key={signal} className="rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-[var(--soft)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                  {signal}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <TipOfDayCard
              locale={locale}
              liveSoon={dictionary.grow.liveSoon}
              labels={{
                title: dictionary.grow.tipTitle,
                todayBadge: dictionary.grow.tipTodayBadge,
                firstVisitBadge: dictionary.grow.tipFirstVisitBadge,
                rotateLabel: dictionary.grow.tipNext,
                totalLabel: dictionary.grow.tipCountLabel,
              }}
            />

            <article className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(232,242,255,0.92))] p-6 shadow-[0_18px_40px_rgba(15,95,255,0.08)]">
              <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.grow.communityTitle}</h2>
              <div className="mt-5 space-y-3">
                {dictionary.grow.communityItems.map((item) => (
                  <div key={`${item.author}-${item.quote}`} className="rounded-[1.35rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,95,255,0.06)]">
                    <p className="text-sm leading-7 text-[var(--ink)]">“{item.quote}”</p>
                    <p className="mt-2 text-xs font-semibold text-[var(--muted)]">— {item.author}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(232,242,255,0.92))] p-6 shadow-[0_18px_40px_rgba(15,95,255,0.08)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.grow.practicalTitle}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{dictionary.grow.practicalDescription}</p>
              </div>
              <span className="status-pill border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]">
                {dictionary.grow.practicalBadge}
              </span>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {dictionary.grow.modules.map((module) => (
                <article key={module.title} className="rounded-[1.5rem] border border-[rgba(15,95,255,0.12)] bg-white p-5 shadow-[0_12px_28px_rgba(15,95,255,0.06)]">
                  <h3 className={`text-lg font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{module.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{module.description}</p>
                  <ul className="mt-4 space-y-3">
                    {module.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3 text-sm leading-7 text-[var(--muted)]">
                        <span className="mt-2 inline-flex h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  {module.signals?.length ? (
                    <div className="mt-4 rounded-[1.15rem] border border-[rgba(15,95,255,0.12)] bg-[var(--soft)] px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--navy)]">
                        {module.signalsTitle ?? dictionary.grow.signalsTitle}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-[var(--muted)]">
                        {module.signals.map((item) => (
                          <span key={item} className="rounded-full border border-[rgba(15,95,255,0.16)] bg-white px-3 py-1 text-xs font-semibold text-[var(--navy)]">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {module.examples?.length ? (
                    <div className="mt-4 rounded-[1.15rem] border border-[rgba(15,95,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(235,244,255,0.9))] px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--navy)]">
                        {module.examplesTitle ?? dictionary.grow.examplesTitle}
                      </div>
                      <ul className="mt-2 space-y-2 text-sm leading-7 text-[var(--muted)]">
                        {module.examples.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <span className="mt-2 inline-flex h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {module.avoid?.length ? (
                    <div className="mt-4 rounded-[1.15rem] border border-[rgba(255,96,96,0.18)] bg-[rgba(255,96,96,0.08)] px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgba(171,38,38,0.9)]">
                        {dictionary.grow.avoidTitle}
                      </div>
                      <ul className="mt-2 space-y-2 text-sm leading-7 text-[rgba(109,27,27,0.9)]">
                        {module.avoid.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <span className="mt-2 inline-flex h-2 w-2 shrink-0 rounded-full bg-[rgba(171,38,38,0.9)]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(232,242,255,0.9))] p-6 shadow-[0_18px_40px_rgba(15,95,255,0.08)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.grow.miniCardsTitle}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                  {locale === "ar"
                    ? "تذكيرات سريعة يمكن تنفيذها اليوم لتقوية الحضور، الوضوح، والانطباع المهني."
                    : "Des repères simples à appliquer aujourd'hui pour renforcer clarté, confiance et sérieux."}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {dictionary.grow.miniCards.map((card) => (
                <article key={card.title} className="rounded-[1.35rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-5 shadow-[0_12px_28px_rgba(15,95,255,0.06)]">
                  <h3 className={`text-base font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{card.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className={`section-title font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.grow.guidesTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                {locale === "ar"
                  ? "بطاقات قصيرة ومباشرة تساعدك تبدأ بطريقة أوضح وتبني ثقة أفضل مع الزبائن."
                  : "Des cartes courtes et concrètes pour démarrer plus clairement et inspirer davantage confiance aux clients."}
              </p>
            </div>
            <Link href={`/${locale}/join`} className="button-secondary">
              {dictionary.join.title}
            </Link>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {dictionary.grow.guides.map((guide) => (
              <article key={guide.title} className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(231,240,255,0.88))] p-6 shadow-[0_18px_40px_rgba(15,95,255,0.08)]">
                <h3 className={`text-xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>{guide.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{guide.description}</p>
                <ul className="mt-5 space-y-3">
                  {guide.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 rounded-[1.15rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-3 text-sm leading-7 text-[var(--muted)]">
                      <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
            {extraGuides.map((guide) => (
              <article key={guide.title} className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(231,240,255,0.88))] p-6 shadow-[0_18px_40px_rgba(15,95,255,0.08)]">
                <h3 className={`text-xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>{guide.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{guide.description}</p>
                <ul className="mt-5 space-y-3">
                  {guide.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 rounded-[1.15rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-3 text-sm leading-7 text-[var(--muted)]">
                      <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="surface-card rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.99),rgba(229,239,255,0.96)_62%,rgba(208,226,255,0.94))] p-6 text-[var(--ink)] shadow-[0_24px_60px_rgba(12,40,104,0.16)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.grow.safetyTitle}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-[var(--ink)]">{dictionary.grow.safetyDescription}</p>
              </div>
              <Link href={`/${locale}/safety`} className="button-secondary">
                {dictionary.nav.safety}
              </Link>
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {dictionary.grow.safetyItems.map((item) => (
                <div key={item} className="rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-3 text-sm leading-7 text-[var(--ink)] shadow-[0_10px_24px_rgba(15,95,255,0.06)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

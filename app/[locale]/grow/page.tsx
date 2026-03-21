import Link from "next/link";
import { getDictionary, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

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
      <section className="surface-card gradient-frame rounded-[2rem] bg-[linear-gradient(135deg,rgba(13,28,69,0.98),rgba(20,92,255,0.92)_72%,rgba(96,165,250,0.84))] p-6 text-white shadow-[0_30px_70px_rgba(12,40,104,0.18)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/72">{dictionary.nav.grow}</div>
            <h1 className={`mt-3 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl ${locale === "ar" ? "arabic-display" : ""}`}>
              {dictionary.grow.title}
            </h1>
            <p className="mt-4 text-lg font-semibold text-white/84">{dictionary.grow.subtitle}</p>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-white/82">{dictionary.grow.description}</p>
          </div>

          <div className="rounded-[1.5rem] border border-white/12 bg-white/10 p-5 backdrop-blur">
            <div className="text-sm font-semibold text-white/74">{dictionary.nav.providers}</div>
            <div className="mt-2 text-sm leading-7 text-white/82">{dictionary.grow.laneService}</div>
            <div className="mt-4 text-sm font-semibold text-white/74">{dictionary.nav.businesses}</div>
            <div className="mt-2 text-sm leading-7 text-white/82">{dictionary.grow.laneBusiness}</div>
            <div className="mt-5 rounded-[1.25rem] border border-white/12 bg-[rgba(8,18,37,0.18)] px-4 py-4 text-sm leading-7 text-white/80">
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
                  {locale === "ar" ? "مسار النمو داخل هنيني" : "Parcours de progression sur Henini"}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                  {locale === "ar"
                    ? "الفكرة ليست مجرد الظهور في السوق. هنيني يساعدك تنتقل من ملف جديد إلى نشاط موثوق، جاهز لتكرار الطلبات وفرص أكبر."
                    : "L'objectif n'est pas seulement d'être visible. Henini aide à passer d'un nouveau profil à une activité fiable, prête pour des demandes répétées et des opportunités plus ambitieuses."}
                </p>
              </div>
              <span className="status-pill border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]">
                {locale === "ar" ? "خفيف وعملي" : "Léger et utile"}
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {pathwaySteps.map((step, index) => (
                <div key={step} className="rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)] shadow-[0_10px_24px_rgba(15,95,255,0.06)]">
                  <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--navy)] text-sm font-extrabold text-white">
                    {index + 1}
                  </div>
                  <div className="font-semibold text-[var(--ink)]">{step}</div>
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

          <div className="surface-card rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(13,28,69,0.98),rgba(20,92,255,0.9)_72%,rgba(96,165,250,0.76))] p-6 text-white shadow-[0_24px_60px_rgba(12,40,104,0.16)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.grow.safetyTitle}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-white/82">{dictionary.grow.safetyDescription}</p>
              </div>
              <Link href={`/${locale}/safety`} className="button-secondary border-white/18 bg-white/10 text-white shadow-[0_18px_36px_rgba(8,18,37,0.18)]">
                {dictionary.nav.safety}
              </Link>
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {dictionary.grow.safetyItems.map((item) => (
                <div key={item} className="rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-3 text-sm leading-7 text-white/84">
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

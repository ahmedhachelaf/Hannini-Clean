"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <p className="text-xl font-bold text-[var(--ink)]">تعذّر تحميل نموذج التقييم</p>
      <p className="text-[var(--muted)]">Impossible de charger le formulaire d&apos;avis.</p>
      <button onClick={reset} className="button-primary px-8">
        إعادة المحاولة / Réessayer
      </button>
    </div>
  );
}

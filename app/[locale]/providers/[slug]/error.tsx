"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <p className="text-xl font-bold text-[var(--ink)]">حدث خطأ أثناء تحميل الملف</p>
      <p className="text-[var(--muted)]">Une erreur est survenue lors du chargement du profil.</p>
      <button
        onClick={reset}
        className="button-primary px-8"
      >
        إعادة المحاولة / Réessayer
      </button>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-7xl font-extrabold text-[var(--accent)] opacity-80">٤٠٤</div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-[var(--ink)]" style={{ fontFamily: "var(--font-arabic-serif)" }}>
          الصفحة غير موجودة
        </h1>
        <p className="text-[var(--muted)]">Page introuvable — cette adresse n&apos;existe pas.</p>
      </div>

      <Link
        href="/ar"
        className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent)] px-8 font-bold text-white shadow-md transition-opacity hover:opacity-90"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}

import Link from "next/link";
import type { Locale } from "@/lib/types";

type SiteFooterProps = {
  locale: Locale;
  nav: {
    home: string;
    providers: string;
    join: string;
    admin: string;
  };
};

export function SiteFooter({ locale, nav }: SiteFooterProps) {
  return (
    <footer className="border-t border-[var(--line)] bg-[rgba(255,255,255,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="max-w-xl space-y-3">
          <div className={`text-2xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>هنيني</div>
          <p className="text-sm leading-7 text-[var(--muted)]">
            {locale === "ar"
              ? "هنيني منصة خدمات منزلية عملية بواجهة عربية أولاً، وملفات موثوقة، وحجز بالتاريخ والوقت، وتأكيد عبر واتساب."
              : "Henini est un MVP de marketplace de services à domicile avec interface claire, profils fiables, réservation datée et confirmation via WhatsApp."}
          </p>
          <p className="text-sm font-semibold text-[var(--muted)]">© Ahmed Hachelaf</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm font-medium text-[var(--muted)]">
          <Link href={`/${locale}`}>{nav.home}</Link>
          <Link href={`/${locale}/providers`}>{nav.providers}</Link>
          <Link href={`/${locale}/join`}>{nav.join}</Link>
          <Link href={`/${locale}/admin`}>{nav.admin}</Link>
        </div>
      </div>
    </footer>
  );
}

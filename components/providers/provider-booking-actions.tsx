"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Booking, Locale } from "@/lib/types";

type ProviderBookingActionsProps = {
  locale: Locale;
  booking: Booking;
};

export function ProviderBookingActions({ locale, booking }: ProviderBookingActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [providerNote, setProviderNote] = useState(booking.providerNote ?? "");
  const [proposedDate, setProposedDate] = useState(booking.proposedDate ?? booking.date);
  const [proposedTime, setProposedTime] = useState(booking.proposedTime ?? booking.time);

  async function run(action: "confirm" | "decline" | "reschedule" | "complete") {
    setPending(action);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`/api/provider/bookings/${booking.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          providerNote,
          proposedDate,
          proposedTime,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        setIsError(true);
        setMessage(data.message ?? (locale === "ar" ? "تعذر تحديث الطلب." : "Impossible de mettre à jour la demande."));
        return;
      }

      setMessage(data.message ?? (locale === "ar" ? "تم تحديث الطلب." : "Demande mise à jour."));
      router.refresh();
    } catch {
      setIsError(true);
      setMessage(locale === "ar" ? "تعذر تحديث الطلب." : "Impossible de mettre à jour la demande.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-5">
      <div className="text-sm font-semibold text-[var(--muted)]">
        {locale === "ar" ? "إجراءات الطلب" : "Actions sur la demande"}
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
          {locale === "ar" ? "ملاحظة للمراجعة أو للزبون" : "Note de suivi ou pour le client"}
        </span>
        <textarea
          value={providerNote}
          onChange={(event) => setProviderNote(event.target.value)}
          rows={3}
          className="input-base min-h-24 resize-y"
        />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {locale === "ar" ? "تاريخ بديل عند إعادة الجدولة" : "Date proposée si report"}
          </span>
          <input value={proposedDate} onChange={(event) => setProposedDate(event.target.value)} type="date" className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {locale === "ar" ? "وقت بديل" : "Heure proposée"}
          </span>
          <input value={proposedTime} onChange={(event) => setProposedTime(event.target.value)} type="time" className="input-base" />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" disabled={pending !== null} className="button-primary" onClick={() => run("confirm")}>
          {pending === "confirm" ? (locale === "ar" ? "..." : "...") : locale === "ar" ? "تأكيد" : "Confirmer"}
        </button>
        <button type="button" disabled={pending !== null} className="button-secondary" onClick={() => run("reschedule")}>
          {pending === "reschedule" ? (locale === "ar" ? "..." : "...") : locale === "ar" ? "إعادة الجدولة" : "Proposer un autre horaire"}
        </button>
        <button
          type="button"
          disabled={pending !== null}
          className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 disabled:opacity-60"
          onClick={() => run("complete")}
        >
          {pending === "complete" ? (locale === "ar" ? "..." : "...") : locale === "ar" ? "تم الإنجاز" : "Marquer comme terminé"}
        </button>
        <button
          type="button"
          disabled={pending !== null}
          className="rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 disabled:opacity-60"
          onClick={() => run("decline")}
        >
          {pending === "decline" ? (locale === "ar" ? "..." : "...") : locale === "ar" ? "رفض" : "Refuser"}
        </button>
      </div>

      {message ? (
        <div
          role={isError ? "alert" : "status"}
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${isError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}

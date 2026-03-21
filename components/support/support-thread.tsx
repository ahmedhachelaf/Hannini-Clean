"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale, SupportCase } from "@/lib/types";

type SupportThreadProps = {
  locale: Locale;
  supportCase: SupportCase;
  labels: {
    threadTitle: string;
    threadDescription: string;
    replyLabel: string;
    yourNameLabel: string;
    attachmentsLabel: string;
    sendReply: string;
    categories: Record<string, string>;
    safetyBlockLabel: string;
    privacySensitiveLabel: string;
  };
};

export function SupportThread({ locale, supportCase, labels }: SupportThreadProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleReply(formData: FormData) {
    setPending(true);
    setError("");

    try {
      const response = await fetch(`/api/support/${supportCase.id}/messages`, {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        setError(data.message ?? (locale === "ar" ? "تعذر إرسال الرد." : "Impossible d'envoyer la réponse."));
        return;
      }

      router.refresh();
    } catch {
      setError(locale === "ar" ? "تعذر إرسال الرد." : "Impossible d'envoyer la réponse.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[1.75rem] p-6">
        <h1 className={`text-3xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>{labels.threadTitle}</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{labels.threadDescription}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
          <span className="status-pill border border-[var(--line)] bg-white text-[var(--ink)]">{supportCase.status}</span>
          <span className="status-pill border border-[var(--line)] bg-white text-[var(--ink)]">{labels.categories[supportCase.category]}</span>
          {supportCase.requestSafetyBlock ? (
            <span className="status-pill border border-rose-200 bg-rose-50 text-rose-700">{labels.safetyBlockLabel}</span>
          ) : null}
          {supportCase.privacySensitive ? (
            <span className="status-pill border border-blue-200 bg-blue-50 text-blue-700">{labels.privacySensitiveLabel}</span>
          ) : null}
          <span className="status-pill border border-[var(--line)] bg-white text-[var(--ink)]">#{supportCase.id}</span>
        </div>
      </section>

      <section className="space-y-4">
        {supportCase.messages.length === 0 ? (
          <article className="surface-card rounded-[1.5rem] p-5 text-sm text-[var(--muted)]">{supportCase.message}</article>
        ) : (
          supportCase.messages.map((message) => (
            <article key={message.id} className="surface-card rounded-[1.5rem] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-bold text-[var(--ink)]">{message.authorName}</div>
                <div className="text-xs text-[var(--muted)]">
                  {message.authorRole} • {new Date(message.createdAt).toLocaleString(locale === "ar" ? "ar-DZ" : "fr-FR")}
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{message.message}</p>
              {message.attachmentNames.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.attachmentNames.map((attachment) => (
                    <span key={attachment} className="chip-button min-h-0 px-3 py-2 text-xs">
                      {attachment}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        )}
      </section>

      <form action={handleReply} className="surface-card rounded-[1.75rem] p-6">
        <input type="hidden" name="caseId" value={supportCase.id} />
        <input type="hidden" name="authorRole" value={supportCase.actorRole} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.yourNameLabel}</span>
            <input name="authorName" required className="input-base" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.attachmentsLabel}</span>
            <input name="attachments" type="file" accept="image/*" multiple className="input-base py-3" />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.replyLabel}</span>
          <textarea name="message" required rows={5} className="input-base min-h-32 resize-y" />
        </label>
        {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
        <button type="submit" disabled={pending} className="button-primary mt-4">
          {pending ? (locale === "ar" ? "جارٍ الإرسال..." : "Envoi...") : labels.sendReply}
        </button>
      </form>
    </div>
  );
}

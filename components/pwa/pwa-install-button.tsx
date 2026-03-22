"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/types";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type PwaInstallButtonProps = {
  locale: Locale;
};

export function PwaInstallButton({ locale }: PwaInstallButtonProps) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setInstalled(true);
      setInstallEvent(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (installed || !installEvent) {
    return null;
  }

  async function handleInstall() {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  return (
    <div className="surface-card w-full max-w-[22rem] rounded-[1.5rem] border border-[rgba(20,92,255,0.18)] bg-[linear-gradient(180deg,rgba(10,31,87,0.96),rgba(18,78,211,0.94)_62%,rgba(63,140,255,0.9))] p-3 text-white shadow-[0_22px_48px_rgba(8,34,99,0.3)]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-extrabold tracking-[0.01em]">
            {locale === "ar" ? "تنزيل التطبيق" : "Installer l’application"}
          </div>
          <p className="mt-1 text-xs leading-6 text-white/82">
            {locale === "ar"
              ? "ثبّت هَنّيني للوصول السريع من هاتفك أو جهازك."
              : "Ajoutez Hannini pour un acces rapide depuis votre appareil."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="button-secondary min-h-12 shrink-0 border-white/10 bg-white px-4 text-sm font-bold text-[var(--navy)] shadow-[0_18px_36px_rgba(8,18,37,0.22)]"
        >
          {locale === "ar" ? "تثبيت" : "Installer"}
        </button>
      </div>
    </div>
  );
}

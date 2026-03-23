"use client";

import { useEffect, useMemo, useState } from "react";
import { APP_BUILD_LABEL } from "@/lib/build-info";
import type { Locale } from "@/lib/types";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type InstallCopy = {
  title: string;
  helper: string;
  button: string;
  compact: string;
  fallbackTitle: string;
  fallbackDescription: string;
  android: string;
  ios: string;
  desktop: string;
};

type PwaInstallButtonProps = {
  locale: Locale;
  copy: InstallCopy;
  variant?: "floating" | "inline";
};

type InstallSnapshot = {
  deferredPrompt: BeforeInstallPromptEvent | null;
  installed: boolean;
  isIos: boolean;
  isAndroid: boolean;
};

let installSnapshot: InstallSnapshot = {
  deferredPrompt: null,
  installed: false,
  isIos: false,
  isAndroid: false,
};

let listenersBound = false;
let buildLogged = false;
let controllerChangeBound = false;
const snapshotListeners = new Set<(snapshot: InstallSnapshot) => void>();

function emitSnapshot() {
  snapshotListeners.forEach((listener) => listener(installSnapshot));
}

function setInstallSnapshot(patch: Partial<InstallSnapshot>) {
  installSnapshot = { ...installSnapshot, ...patch };
  emitSnapshot();
}

function detectInstallState() {
  if (typeof window === "undefined") {
    return;
  }

  const iosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  const displayModeStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const ua = window.navigator.userAgent.toLowerCase();

  setInstallSnapshot({
    installed: iosStandalone || displayModeStandalone,
    isIos: /iphone|ipad|ipod/.test(ua),
    isAndroid: /android/.test(ua),
  });
}

function bindInstallListeners() {
  if (listenersBound || typeof window === "undefined") {
    return;
  }

  listenersBound = true;

  if (!buildLogged) {
    console.info(`[Hannini] build ${APP_BUILD_LABEL}`);
    buildLogged = true;
  }

  if ("serviceWorker" in navigator) {
    void navigator.serviceWorker.register("/sw.js").then((registration) => {
      void registration.update();

      if (registration.waiting && navigator.serviceWorker.controller) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      registration.addEventListener("updatefound", () => {
        const nextWorker = registration.installing;
        if (!nextWorker) {
          return;
        }

        nextWorker.addEventListener("statechange", () => {
          if (nextWorker.state === "installed" && navigator.serviceWorker.controller) {
            nextWorker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    });

    if (!controllerChangeBound) {
      controllerChangeBound = true;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (window.sessionStorage.getItem("hannini-sw-reloaded") === "1") {
          return;
        }

        window.sessionStorage.setItem("hannini-sw-reloaded", "1");
        window.location.reload();
      });
    }
  }

  detectInstallState();

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    setInstallSnapshot({ deferredPrompt: event as BeforeInstallPromptEvent });
  });

  window.addEventListener("appinstalled", () => {
    setInstallSnapshot({ installed: true, deferredPrompt: null });
  });

  window.matchMedia("(display-mode: standalone)").addEventListener?.("change", detectInstallState);
}

export function PwaInstallButton({ locale, copy, variant = "floating" }: PwaInstallButtonProps) {
  const [snapshot, setSnapshot] = useState<InstallSnapshot>(installSnapshot);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    bindInstallListeners();
    detectInstallState();
    snapshotListeners.add(setSnapshot);

    return () => {
      snapshotListeners.delete(setSnapshot);
    };
  }, []);

  const fallbackText = useMemo(() => {
    if (snapshot.isIos) {
      return copy.ios;
    }

    if (snapshot.isAndroid) {
      return copy.android;
    }

    return copy.desktop;
  }, [copy.android, copy.desktop, copy.ios, snapshot.isAndroid, snapshot.isIos]);

  if (snapshot.installed) {
    return null;
  }

  async function handleInstall() {
    if (!snapshot.deferredPrompt) {
      setShowFallback((current) => !current);
      return;
    }

    await snapshot.deferredPrompt.prompt();
    await snapshot.deferredPrompt.userChoice;
    setInstallSnapshot({ deferredPrompt: null });
    setShowFallback(false);
  }

  if (variant === "inline") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={handleInstall}
          aria-expanded={showFallback}
          aria-label={copy.button}
          className="button-secondary min-h-11 px-4 text-sm font-bold"
        >
          {copy.compact}
        </button>
        {showFallback ? (
          <div className="absolute end-0 top-[calc(100%+0.65rem)] z-40 w-[min(22rem,calc(100vw-2rem))] rounded-[1.25rem] border border-[rgba(20,92,255,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(235,244,255,0.97))] p-4 text-[var(--ink)] shadow-[0_24px_52px_rgba(13,28,69,0.18)]">
            <div className="text-sm font-extrabold text-[var(--navy)]">{copy.fallbackTitle}</div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.fallbackDescription}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--ink)]">{fallbackText}</p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="surface-card w-full max-w-[22rem] rounded-[1.5rem] border border-[rgba(20,92,255,0.18)] bg-[linear-gradient(180deg,rgba(10,31,87,0.96),rgba(18,78,211,0.94)_62%,rgba(63,140,255,0.9))] p-3 text-white shadow-[0_22px_48px_rgba(8,34,99,0.3)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-extrabold tracking-[0.01em]">{copy.title}</div>
          <p className="mt-1 text-xs leading-6 text-white/86">{copy.helper}</p>
          {showFallback ? (
            <div className="mt-2 rounded-[1rem] border border-white/16 bg-white/10 p-3">
              <div className="text-xs font-bold text-white">{copy.fallbackTitle}</div>
              <p className="mt-1 text-xs leading-5 text-white/88">{copy.fallbackDescription}</p>
              <p className="mt-2 text-xs font-semibold leading-5 text-white">{fallbackText}</p>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleInstall}
          aria-expanded={showFallback}
          className="button-secondary min-h-12 shrink-0 border-white/10 bg-white px-4 text-sm font-bold text-[var(--navy)] shadow-[0_18px_36px_rgba(8,18,37,0.22)]"
        >
          {copy.button}
        </button>
      </div>
    </div>
  );
}

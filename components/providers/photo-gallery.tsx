"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Locale } from "@/lib/types";

type PhotoGalleryProps = {
  images: string[];
  captions?: string[];
  providerName: string;
  locale: Locale;
};

export function PhotoGallery({ images, captions, providerName, locale }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  // Focus trap: focus close button when lightbox opens
  useEffect(() => {
    if (lightboxIndex !== null) {
      closeButtonRef.current?.focus();
    }
  }, [lightboxIndex]);

  // Prevent body scroll while lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  // Touch swipe handlers
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) goPrev();
    else goNext();
  }

  if (images.length === 0) return null;

  const galleryLabel = locale === "ar" ? "معرض الأعمال" : "Portfolio";
  const closeLabel = locale === "ar" ? "إغلاق" : "Fermer";
  const prevLabel = locale === "ar" ? "السابق" : "Précédent";
  const nextLabel = locale === "ar" ? "التالي" : "Suivant";
  const photoOfLabel = locale === "ar" ? "من" : "sur";
  const isRtl = locale === "ar";

  const [coverImg, ...thumbImgs] = images;

  return (
    <section aria-label={galleryLabel}>
      {/* ── Hero image + thumbnail strip ── */}
      <div className="overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[var(--soft)]">
        {/* Cover */}
        <button
          type="button"
          className="group relative block h-[320px] w-full overflow-hidden sm:h-[400px] lg:h-[480px]"
          onClick={() => openLightbox(0)}
          aria-label={`${galleryLabel} — ${providerName}`}
        >
          <Image
            src={coverImg}
            alt={captions?.[0] ?? `${providerName} — ${galleryLabel}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 75vw, 900px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(13,28,69,0.38)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="rounded-full bg-white/90 px-5 py-2.5 text-sm font-bold text-[var(--navy)]">
              {locale === "ar" ? "فتح المعرض" : "Ouvrir le portfolio"}
            </span>
          </div>
        </button>

        {/* Thumbnail row */}
        {thumbImgs.length > 0 ? (
          <div className="flex gap-1 border-t border-[var(--line)] bg-[rgba(13,28,69,0.04)]">
            {thumbImgs.slice(0, 5).map((src, idx) => {
              const realIdx = idx + 1;
              const isLast = realIdx === 5 && images.length > 6;
              return (
                <button
                  key={realIdx}
                  type="button"
                  onClick={() => openLightbox(realIdx)}
                  className="group relative h-[80px] flex-1 overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                  aria-label={captions?.[realIdx] ?? `Photo ${realIdx + 1}`}
                >
                  <Image
                    src={src}
                    alt={captions?.[realIdx] ?? `${providerName} photo ${realIdx + 1}`}
                    fill
                    sizes="120px"
                    className="object-cover transition-opacity duration-150 group-hover:opacity-80"
                  />
                  {isLast ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[rgba(13,28,69,0.55)]">
                      <span className="text-sm font-bold text-white">+{images.length - 5}</span>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={galleryLabel}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(5,10,28,0.95)]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeLightbox}
            aria-label={closeLabel}
            className="absolute end-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <X size={20} strokeWidth={2} />
          </button>

          {/* Prev */}
          {images.length > 1 ? (
            <button
              type="button"
              onClick={isRtl ? goNext : goPrev}
              aria-label={prevLabel}
              className="absolute start-3 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronLeft size={22} strokeWidth={2} />
            </button>
          ) : null}

          {/* Image */}
          <div className="relative mx-16 flex h-full max-h-[85vh] w-full max-w-5xl items-center justify-center">
            <Image
              src={images[lightboxIndex]}
              alt={captions?.[lightboxIndex] ?? `${providerName} photo ${lightboxIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 85vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Next */}
          {images.length > 1 ? (
            <button
              type="button"
              onClick={isRtl ? goPrev : goNext}
              aria-label={nextLabel}
              className="absolute end-3 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronRight size={22} strokeWidth={2} />
            </button>
          ) : null}

          {/* Counter + caption */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5">
            <span className="text-xs font-semibold text-white/60">
              {lightboxIndex + 1} {photoOfLabel} {images.length}
            </span>
            {captions?.[lightboxIndex] ? (
              <p className="max-w-md rounded-xl bg-white/10 px-4 py-2 text-center text-sm text-white backdrop-blur-sm">
                {captions[lightboxIndex]}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

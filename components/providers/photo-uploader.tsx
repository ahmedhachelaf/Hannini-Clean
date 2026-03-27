"use client";

import Image from "next/image";
import { UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { deleteProviderPhoto, uploadProviderPhoto } from "@/app/actions/photos";
import type { Locale } from "@/lib/types";

type UploadedPhoto = {
  url: string;
  storagePath: string;
  status: "done" | "uploading" | "error";
  progress: number;
  errorMessage?: string;
};

type PhotoUploaderProps = {
  locale: Locale;
  maxPhotos?: number;
  initialPhotos?: { url: string; storagePath: string }[];
  onPhotosChange?: (photos: { url: string; storagePath: string }[]) => void;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function getCopy(locale: Locale) {
  return {
    title: locale === "ar" ? "صور الأعمال" : "Photos du portfolio",
    hint:
      locale === "ar"
        ? "اسحب وأفلت الصور هنا، أو اضغط لاختيارها. الحد الأقصى 5 ميغابايت لكل صورة. الصيغ المقبولة: JPEG، PNG، WebP."
        : "Glissez-déposez vos photos ici, ou cliquez pour les choisir. Max 5 Mo par image. Formats acceptés : JPEG, PNG, WebP.",
    upload: locale === "ar" ? "اختر صوراً" : "Choisir des photos",
    uploading: locale === "ar" ? "جارٍ الرفع…" : "Envoi en cours…",
    deleteLabel: locale === "ar" ? "حذف" : "Supprimer",
    errorSize: locale === "ar" ? "الملف أكبر من 5 ميغابايت" : "Fichier > 5 Mo",
    errorType: locale === "ar" ? "نوع الملف غير مدعوم" : "Type de fichier non accepté",
    maxReached: (n: number) =>
      locale === "ar" ? `وصلت للحد الأقصى (${n} صور)` : `Maximum atteint (${n} photos)`,
    dragActive: locale === "ar" ? "أفلت الصور هنا" : "Relâchez ici",
    cover: locale === "ar" ? "الغلاف" : "Couverture",
  };
}

export function PhotoUploader({
  locale,
  maxPhotos = 10,
  initialPhotos = [],
  onPhotosChange,
}: PhotoUploaderProps) {
  const copy = getCopy(locale);
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>(
    initialPhotos.map((p) => ({ ...p, status: "done", progress: 100 })),
  );
  const [isDragOver, setIsDragOver] = useState(false);

  function notifyParent(updated: UploadedPhoto[]) {
    const done = updated.filter((p) => p.status === "done");
    onPhotosChange?.(done.map((p) => ({ url: p.url, storagePath: p.storagePath })));
  }

  async function handleFiles(files: FileList) {
    const remaining = maxPhotos - photos.filter((p) => p.status === "done").length;
    const toProcess = Array.from(files).slice(0, remaining);

    if (toProcess.length === 0) return;

    // Validate
    const validated = toProcess.map((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return { file, error: copy.errorType };
      }
      if (file.size > MAX_SIZE_BYTES) {
        return { file, error: copy.errorSize };
      }
      return { file, error: null };
    });

    // Add placeholders
    const placeholders: UploadedPhoto[] = validated.map(({ file, error }) => ({
      url: URL.createObjectURL(file),
      storagePath: "",
      status: error ? "error" : "uploading",
      progress: 0,
      errorMessage: error ?? undefined,
    }));

    setPhotos((prev) => {
      const next = [...prev, ...placeholders];
      return next;
    });

    // Upload each valid file
    for (let i = 0; i < validated.length; i++) {
      const { file, error } = validated[i];
      if (error) continue;

      const placeholderIndex = photos.length + i;

      // Fake progress to 40% immediately for UX
      setPhotos((prev) => {
        const next = [...prev];
        if (next[placeholderIndex]) next[placeholderIndex] = { ...next[placeholderIndex], progress: 40 };
        return next;
      });

      const fd = new FormData();
      fd.append("file", file);

      const result = await uploadProviderPhoto(fd);

      setPhotos((prev) => {
        const next = [...prev];
        if (!next[placeholderIndex]) return next;
        if (result.ok) {
          next[placeholderIndex] = {
            url: result.url,
            storagePath: result.storagePath,
            status: "done",
            progress: 100,
          };
        } else {
          next[placeholderIndex] = {
            ...next[placeholderIndex],
            status: "error",
            progress: 0,
            errorMessage: result.error,
          };
        }
        notifyParent(next);
        return next;
      });
    }
  }

  async function handleDelete(index: number) {
    const photo = photos[index];
    if (photo.storagePath) {
      await deleteProviderPhoto(photo.storagePath);
    }
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== index);
      notifyParent(next);
      return next;
    });
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function onDragLeave() {
    setIsDragOver(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  }

  const doneCount = photos.filter((p) => p.status === "done").length;
  const atMax = doneCount >= maxPhotos;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {!atMax ? (
        <div
          role="button"
          tabIndex={0}
          aria-label={copy.upload}
          className={`flex min-h-[9rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
            isDragOver
              ? "border-[var(--accent)] bg-[rgba(20,92,255,0.06)]"
              : "border-[rgba(11,63,184,0.28)] bg-[var(--soft)] hover:border-[rgba(11,63,184,0.48)]"
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-[0.9rem] border border-[rgba(11,63,184,0.2)] bg-white text-[var(--navy)] shadow-[0_12px_28px_rgba(12,40,104,0.12)]">
            <UploadCloud size={22} strokeWidth={2} />
          </span>
          <p className="text-sm text-[var(--muted)]">
            {isDragOver ? copy.dragActive : copy.hint}
          </p>
          <button
            type="button"
            className="button-secondary min-h-0 px-4 py-2 text-sm"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            {copy.upload}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            multiple
            className="sr-only"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            aria-hidden="true"
          />
        </div>
      ) : (
        <p className="rounded-xl bg-[var(--soft)] px-4 py-3 text-sm text-[var(--muted)]">
          {copy.maxReached(maxPhotos)}
        </p>
      )}

      {/* Photo grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo, index) => (
            <div
              key={`${photo.storagePath || photo.url}-${index}`}
              className="group relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--soft)]"
            >
              <div className="relative aspect-square">
                <Image
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  fill
                  sizes="150px"
                  className={`object-cover transition-opacity ${photo.status !== "done" ? "opacity-50" : ""}`}
                  unoptimized={photo.url.startsWith("blob:")}
                />
              </div>

              {/* Cover badge on first photo */}
              {index === 0 && photo.status === "done" ? (
                <div className="absolute start-1.5 top-1.5 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[0.65rem] font-bold text-white">
                  {copy.cover}
                </div>
              ) : null}

              {/* Progress bar */}
              {photo.status === "uploading" ? (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[rgba(20,92,255,0.15)]">
                  <div
                    className="h-full bg-[var(--accent)] transition-all"
                    style={{ width: `${photo.progress}%` }}
                  />
                </div>
              ) : null}

              {/* Error state */}
              {photo.status === "error" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[rgba(185,28,28,0.7)] px-2 text-center">
                  <span className="text-[0.7rem] font-bold text-white">{photo.errorMessage}</span>
                </div>
              ) : null}

              {/* Delete button */}
              {photo.status === "done" ? (
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  aria-label={`${copy.deleteLabel} photo ${index + 1}`}
                  className="absolute end-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(185,28,28,0.8)] text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <X size={12} strokeWidth={2} />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

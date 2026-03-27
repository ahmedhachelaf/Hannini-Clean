"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";

type UploadedFile = {
  file: File;
  preview: string | null;
};

type SupportFileUploaderProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
  labels: {
    uploadLabel: string;
    uploadFormats: string;
    uploadMaxReached: string;
    uploadRemove: string;
  };
  maxFiles?: number;
};

export function SupportFileUploader({ files, onFilesChange, labels, maxFiles = 5 }: SupportFileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previews, setPreviews] = useState<(string | null)[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const slots = maxFiles - files.length;
    if (slots <= 0) return;

    const accepted = Array.from(incoming)
      .filter((f) => ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(f.type))
      .slice(0, slots);

    const newPreviews = accepted.map((f) => (f.type.startsWith("image/") ? URL.createObjectURL(f) : null));

    onFilesChange([...files, ...accepted]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeFile(index: number) {
    const url = previews[index];
    if (url) URL.revokeObjectURL(url);

    const nextFiles = files.filter((_, i) => i !== index);
    const nextPreviews = previews.filter((_, i) => i !== index);
    onFilesChange(nextFiles);
    setPreviews(nextPreviews);

    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files);
  }

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const atMax = files.length >= maxFiles;

  return (
    <div className="space-y-3">
      {!atMax ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-[0.875rem] border-[1.5px] border-dashed p-6 text-center transition-colors ${
            isDragOver
              ? "border-[var(--accent)] bg-[rgba(15,95,255,0.06)]"
              : "border-[var(--line)] bg-[var(--soft)] hover:bg-[rgba(15,95,255,0.03)]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            multiple
            className="sr-only"
            onChange={handleChange}
          />
          <div className="pointer-events-none flex flex-col items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--muted)]"
            >
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            <span className="text-sm font-medium text-[var(--ink)]">{labels.uploadLabel}</span>
            <span className="text-xs text-[var(--muted)]">{labels.uploadFormats}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-[0.875rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {labels.uploadMaxReached}
        </div>
      )}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-3 rounded-[0.75rem] border border-[var(--line)] bg-white px-3 py-2">
              {previews[i] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previews[i]!} alt="" className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--soft)] text-lg">
                  📄
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[var(--ink)]">
                  {f.name.length > 26 ? f.name.slice(0, 26) + "…" : f.name}
                </div>
                <div className="text-xs text-[var(--muted)]">{formatSize(f.size)}</div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={labels.uploadRemove}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-lg leading-none text-[var(--muted)] transition-colors hover:bg-rose-50 hover:text-rose-600"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

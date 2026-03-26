/**
 * Shimmer skeleton loaders for photo-heavy UI sections.
 * Use inside Suspense boundaries or loading states.
 */

/** Single photo tile skeleton — matches the thumbnail in PhotoGallery */
export function PhotoTileSkeleton({ aspectRatio = "aspect-square" }: { aspectRatio?: string }) {
  return (
    <div
      className={`${aspectRatio} w-full animate-pulse overflow-hidden rounded-2xl bg-[linear-gradient(90deg,rgba(20,92,255,0.06)_0%,rgba(20,92,255,0.13)_50%,rgba(20,92,255,0.06)_100%)] bg-[length:200%_100%]`}
      aria-hidden="true"
    />
  );
}

/** Gallery hero + thumbnail strip skeleton */
export function PhotoGallerySkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[var(--line)]" aria-hidden="true">
      {/* Cover skeleton */}
      <div className="relative h-[320px] w-full animate-pulse bg-[linear-gradient(90deg,rgba(20,92,255,0.06)_0%,rgba(20,92,255,0.13)_50%,rgba(20,92,255,0.06)_100%)] bg-[length:200%_100%] sm:h-[400px]" />
      {/* Thumbnail strip skeleton */}
      <div className="flex gap-1 border-t border-[var(--line)]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[80px] flex-1 animate-pulse bg-[linear-gradient(90deg,rgba(20,92,255,0.05)_0%,rgba(20,92,255,0.1)_50%,rgba(20,92,255,0.05)_100%)] bg-[length:200%_100%]"
          />
        ))}
      </div>
    </div>
  );
}

/** Provider card skeleton matching the photo-first card layout */
export function ProviderCardSkeleton() {
  return (
    <div className="surface-card gradient-frame flex h-full flex-col overflow-hidden rounded-[1.75rem]" aria-hidden="true">
      {/* Cover */}
      <div className="h-[200px] w-full animate-pulse bg-[linear-gradient(90deg,rgba(20,92,255,0.07)_0%,rgba(20,92,255,0.14)_50%,rgba(20,92,255,0.07)_100%)] bg-[length:200%_100%]" />
      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Identity row */}
        <div className="flex items-start gap-3">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-[rgba(20,92,255,0.1)]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-[rgba(20,92,255,0.1)]" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-[rgba(20,92,255,0.07)]" />
            <div className="h-3 w-full animate-pulse rounded-full bg-[rgba(20,92,255,0.07)]" />
          </div>
        </div>
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-[rgba(20,92,255,0.07)]" />
          ))}
        </div>
        {/* Location */}
        <div className="h-12 animate-pulse rounded-xl bg-[rgba(20,92,255,0.07)]" />
        {/* CTA buttons */}
        <div className="mt-auto flex gap-2.5">
          <div className="h-11 flex-1 animate-pulse rounded-full bg-[rgba(20,92,255,0.1)]" />
          <div className="h-11 flex-1 animate-pulse rounded-full bg-[rgba(20,92,255,0.15)]" />
        </div>
      </div>
    </div>
  );
}

/** Showcase strip skeleton (horizontal scroll) */
export function WorkShowcaseSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-3 overflow-x-hidden" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[180px] w-[240px] shrink-0 animate-pulse overflow-hidden rounded-[1.25rem] bg-[linear-gradient(90deg,rgba(20,92,255,0.07)_0%,rgba(20,92,255,0.13)_50%,rgba(20,92,255,0.07)_100%)] bg-[length:200%_100%]"
        />
      ))}
    </div>
  );
}

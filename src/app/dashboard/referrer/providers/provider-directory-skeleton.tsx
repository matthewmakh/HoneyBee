'use client';

export function ProviderDirectorySkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Search & Filter Bar Skeleton */}
      <div className="flex flex-col gap-4">
        {/* Search bar */}
        <div className="h-10 bg-muted/60 rounded-lg animate-pulse" />
        
        {/* Quick filters */}
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 rounded-full bg-muted/60 animate-pulse"
              style={{ width: `${60 + i * 15}px` }}
            />
          ))}
        </div>

        {/* Filter row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 h-10 bg-muted/60 rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="w-28 h-10 bg-muted/60 rounded-lg animate-pulse" />
            <div className="w-10 h-10 bg-muted/60 rounded-lg animate-pulse" />
          </div>
          <div className="w-44 h-10 bg-muted/60 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Results count skeleton */}
      <div className="h-4 w-32 bg-muted/60 rounded animate-pulse" />

      {/* Provider Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ProviderCardSkeleton key={i} delay={i * 100} />
        ))}
      </div>
    </div>
  );
}

function ProviderCardSkeleton({ delay }: { delay: number }) {
  return (
    <div
      className="rounded-xl border bg-card overflow-hidden flex flex-col animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Profile Header */}
      <div className="p-5 pb-3 flex items-start gap-3">
        {/* Avatar */}
        <div className="h-14 w-14 rounded-full bg-muted/60 shrink-0" />

        <div className="flex-1 space-y-2">
          {/* Name */}
          <div className="h-4 w-3/4 bg-muted/60 rounded" />
          {/* Member ID */}
          <div className="h-3 w-16 bg-muted/60 rounded" />
          {/* Location & Rating */}
          <div className="flex gap-2">
            <div className="h-3 w-12 bg-muted/60 rounded" />
            <div className="h-3 w-16 bg-muted/60 rounded" />
          </div>
        </div>

        {/* Commission badge */}
        <div className="h-6 w-14 bg-muted/60 rounded-full shrink-0" />
      </div>

      {/* Description */}
      <div className="px-5 pb-3 space-y-2">
        <div className="h-3 w-full bg-muted/60 rounded" />
        <div className="h-3 w-2/3 bg-muted/60 rounded" />
      </div>

      {/* Category Tags */}
      <div className="px-5 pb-4 flex gap-1">
        {[1, 2, 3].map((j) => (
          <div
            key={j}
            className="h-5 bg-muted/60 rounded-full"
            style={{ width: `${40 + j * 10}px` }}
          />
        ))}
      </div>

      {/* CTA Button */}
      <div className="px-4 pb-4">
        <div className="h-9 w-full bg-muted/60 rounded-lg" />
      </div>
    </div>
  );
}

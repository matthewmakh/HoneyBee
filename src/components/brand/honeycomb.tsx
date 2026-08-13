import { cn } from '@/lib/utils';

/**
 * Decorative tiling honeycomb texture. Purely ornamental — hidden from
 * assistive tech and never placed where it can intercept pointer events.
 */
export function Honeycomb({
  className,
  opacity = 0.06,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={{ opacity }}
    >
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id="honeycomb-tile"
            width="56"
            height="97"
            patternUnits="userSpaceOnUse"
            patternTransform="scale(1.15)"
          >
            <path
              d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 48 L56 64 L56 97 M28 48 L0 64 L0 97"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#honeycomb-tile)" />
      </svg>
    </div>
  );
}

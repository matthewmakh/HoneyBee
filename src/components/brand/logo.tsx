import { cn } from '@/lib/utils';
import { LogoMark } from './logo-mark';

type LogoProps = {
  className?: string;
  markClassName?: string;
  /** Hide the wordmark and show the badge alone. */
  markOnly?: boolean;
  /** Use the gold-hexagon variant and light text for dark surfaces. */
  inverted?: boolean;
  /** Shorten the wordmark to "Honeybee" — for tight headers. */
  short?: boolean;
};

export function Logo({
  className,
  markClassName,
  markOnly = false,
  inverted = false,
  short = false,
}: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark inverted={inverted} className={markClassName} />
      {!markOnly && (
        <span
          className={cn(
            'font-semibold tracking-tight',
            inverted ? 'text-white' : 'text-foreground'
          )}
        >
          {short ? 'Honeybee' : 'Honeybee Referral Club'}
        </span>
      )}
    </span>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  /** If provided, navigates to this route. Otherwise goes back in history. */
  href?: string;
  label?: string;
  className?: string;
}

/**
 * Consistent "back" control used across inner pages. Renders a Link when an
 * explicit href is given (predictable destination), otherwise falls back to
 * browser history.
 */
export function BackButton({ href, label = 'Back', className }: BackButtonProps) {
  const router = useRouter();

  const classes = cn(
    'inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors',
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        <ArrowLeft className="h-4 w-4" />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => router.back()} className={classes}>
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}

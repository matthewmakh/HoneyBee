'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * High-contrast toggle for switching between the Bee Team (referrer) and
 * A-Team (provider) dashboards. Intentionally dark with a bright active pill so
 * it's always obvious which dashboard you're currently viewing.
 */
export function PortalSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const current: 'referrer' | 'provider' = pathname.startsWith('/dashboard/provider')
    ? 'provider'
    : 'referrer';

  const base =
    'flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors';
  const active = 'bg-amber-400 text-slate-900 shadow-sm';
  const inactive = 'text-slate-200 hover:text-white hover:bg-white/10';

  return (
    <div
      role="tablist"
      aria-label="Switch dashboard"
      className={cn(
        'inline-flex items-center gap-1 rounded-lg bg-slate-900 p-1 shadow-inner ring-1 ring-slate-700',
        className
      )}
    >
      <Link
        href="/dashboard/referrer"
        role="tab"
        aria-selected={current === 'referrer'}
        className={cn(base, current === 'referrer' ? active : inactive)}
      >
        <Users className="h-4 w-4" />
        Bee Team
      </Link>
      <Link
        href="/dashboard/provider"
        role="tab"
        aria-selected={current === 'provider'}
        className={cn(base, current === 'provider' ? active : inactive)}
      >
        <Briefcase className="h-4 w-4" />
        A-Team
      </Link>
    </div>
  );
}

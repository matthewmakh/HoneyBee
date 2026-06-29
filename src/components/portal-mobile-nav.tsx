'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Megaphone, Users, Network, Wallet, Upload, Settings } from 'lucide-react';

interface Props {
  canUseReferrerPortal: boolean;
  canUseProviderPortal: boolean;
}

const itemClass =
  'flex flex-col items-center justify-center gap-1 px-2 py-2 text-muted-foreground hover:text-foreground transition-colors';

/**
 * Mobile bottom nav. Context-aware so members with both portals see one tidy set
 * of tabs for the side they're on (no duplicate Wallet, no 8-item overflow).
 */
export function PortalMobileNav({ canUseReferrerPortal, canUseProviderPortal }: Props) {
  const pathname = usePathname();
  const onProviderPath = pathname.startsWith('/dashboard/provider');
  const side: 'provider' | 'referrer' =
    onProviderPath && canUseProviderPortal
      ? 'provider'
      : canUseReferrerPortal
      ? 'referrer'
      : 'provider';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="flex items-center justify-around h-16 px-2">
        <Link href="/dashboard" className={itemClass}>
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </Link>

        {side === 'referrer' ? (
          <>
            <Link href="/dashboard/referrer/refer" className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-amber-600 hover:text-amber-700">
              <Megaphone className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Refer</span>
            </Link>
            <Link href="/dashboard/referrer/providers" className={itemClass}>
              <Users className="h-5 w-5" />
              <span className="text-[10px]">Catalog</span>
            </Link>
            <Link href="/dashboard/referrer/team" className={itemClass}>
              <Network className="h-5 w-5" />
              <span className="text-[10px]">Team</span>
            </Link>
            <Link href="/dashboard/referrer/wallet" className={itemClass}>
              <Wallet className="h-5 w-5" />
              <span className="text-[10px]">Wallet</span>
            </Link>
          </>
        ) : (
          <>
            <Link href="/dashboard/provider/pitch" className={itemClass}>
              <Upload className="h-5 w-5" />
              <span className="text-[10px]">Pitch</span>
            </Link>
            <Link href="/dashboard/provider/wallet" className={itemClass}>
              <Wallet className="h-5 w-5" />
              <span className="text-[10px]">Wallet</span>
            </Link>
            <Link href="/dashboard/provider/settings" className={itemClass}>
              <Settings className="h-5 w-5" />
              <span className="text-[10px]">Settings</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

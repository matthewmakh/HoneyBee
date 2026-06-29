'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui';
import { Megaphone, Wallet, Network, Upload } from 'lucide-react';

interface Props {
  canUseReferrerPortal: boolean;
  canUseProviderPortal: boolean;
}

/**
 * Desktop secondary nav links. Context-aware: shows the *current* portal's links
 * only, so a member with both portals no longer sees two "Wallet" links at once.
 */
export function PortalNavLinks({ canUseReferrerPortal, canUseProviderPortal }: Props) {
  const pathname = usePathname();
  const onProviderPath = pathname.startsWith('/dashboard/provider');

  // Resolve which side's links to show based on the current path + access.
  const side: 'provider' | 'referrer' =
    onProviderPath && canUseProviderPortal
      ? 'provider'
      : canUseReferrerPortal
      ? 'referrer'
      : 'provider';

  if (side === 'provider') {
    return (
      <div className="hidden md:flex items-center gap-1">
        <Link href="/dashboard/provider/pitch">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
            <Upload className="h-4 w-4" />
            Pitch
          </Button>
        </Link>
        <Link href="/dashboard/provider/wallet">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
            <Wallet className="h-4 w-4" />
            Wallet
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-1">
      <Link href="/dashboard/referrer/refer">
        <Button size="sm" className="gap-1.5 bg-amber-400 text-slate-900 hover:bg-amber-300">
          <Megaphone className="h-4 w-4" />
          Refer
        </Button>
      </Link>
      <Link href="/dashboard/referrer/wallet">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <Wallet className="h-4 w-4" />
          Wallet
        </Button>
      </Link>
      <Link href="/dashboard/referrer/team">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <Network className="h-4 w-4" />
          Team
        </Button>
      </Link>
    </div>
  );
}

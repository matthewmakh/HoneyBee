'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { Copy, Check, Share2, UserPlus } from 'lucide-react';

/**
 * The member's personal invite link. Anyone who registers through it is
 * created with this member as both L-1 manager and lifetime original sponsor.
 */
export function SponsorInviteCard({
  memberId,
  companyName,
}: {
  memberId: string;
  companyName: string;
}) {
  const [copied, setCopied] = useState(false);

  // Built in the browser so the link carries whatever host the app runs on.
  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/register?sponsor=${encodeURIComponent(memberId)}`
      : `/register?sponsor=${encodeURIComponent(memberId)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (http, permissions) — select-able input below still works.
    }
  };

  const share = async () => {
    try {
      await navigator.share({
        title: 'Join my team at Honeybee Referral Club',
        text: `Join ${companyName}'s team on the Honeybee Referral Club — earn commissions on referrals you were already making.`,
        url: inviteUrl,
      });
    } catch {
      // User dismissed the sheet, or share unsupported — nothing to do.
    }
  };

  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <Card className="border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="h-5 w-5 text-[hsl(var(--gold))]" />
          Sponsor a new member
        </CardTitle>
        <CardDescription>
          Anyone who joins through your link lands on your team — you become their
          manager and keep the lifetime sponsor line.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={inviteUrl}
          onFocus={(e) => e.target.select()}
          className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 font-mono text-xs text-muted-foreground"
          aria-label="Your invite link"
        />
        <div className="flex gap-2">
          <Button onClick={copy} className="gap-1.5" size="sm">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy link'}
          </Button>
          {canShare && (
            <Button onClick={share} variant="outline" size="sm" className="gap-1.5">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

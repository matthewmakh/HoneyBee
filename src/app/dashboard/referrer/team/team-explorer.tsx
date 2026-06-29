'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { getInitials, cn } from '@/lib/utils';
import { TEAM_ROLE_LABELS } from '@/lib/types';
import type { TeamMemberCard } from '@/lib/services/teams';
import { ChangeManagerForm } from './change-manager-form';
import { Mail, Phone, ExternalLink, Users, ArrowUp, ArrowDown, Crown } from 'lucide-react';

interface Props {
  crossline: TeamMemberCard[];
  upline: {
    l1: TeamMemberCard | null;
    l2: TeamMemberCard | null;
    l3: TeamMemberCard | null;
    clubAdmin: TeamMemberCard | null;
  };
  downline: { l1: TeamMemberCard[]; l2: TeamMemberCard[]; l3: TeamMemberCard[] };
  managers: { id: string; name: string; memberId: string; teamRole: string }[];
  currentL1ManagerId: string | null;
}

type Tab = 'team' | 'upline' | 'downline';

function MemberRow({
  member,
  highlight = false,
  levelLabel,
}: {
  member: TeamMemberCard;
  highlight?: boolean;
  levelLabel?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3',
        highlight && 'border-amber-300 bg-amber-50/60'
      )}
    >
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage src={member.logoUrl ?? undefined} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {getInitials(member.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold truncate">{member.name}</span>
          {levelLabel && (
            <Badge variant="outline" className="text-[10px]">
              {levelLabel}
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {member.memberId} · {TEAM_ROLE_LABELS[member.teamRole]}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </a>
          )}
          {member.phone && (
            <a
              href={`tel:${member.phone}`}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              Call
            </a>
          )}
          {member.publicSlug && (
            <Link
              href={`/p/${member.publicSlug}`}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Info
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export function TeamExplorer({ crossline, upline, downline, managers, currentL1ManagerId }: Props) {
  const [tab, setTab] = useState<Tab>('upline');

  const tabs: { key: Tab; label: string; icon: typeof Users; count: number }[] = [
    { key: 'team', label: 'My Team', icon: Users, count: crossline.length },
    {
      key: 'upline',
      label: 'My Upline',
      icon: ArrowUp,
      count: [upline.l1, upline.l2, upline.l3, upline.clubAdmin].filter(Boolean).length,
    },
    {
      key: 'downline',
      label: 'My Downline',
      icon: ArrowDown,
      count: downline.l1.length + downline.l2.length + downline.l3.length,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Three buttons */}
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg border p-3 transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'hover:border-primary/40 hover:bg-muted'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-semibold">{t.label}</span>
              <span className={cn('text-xs', active ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                {t.count} {t.count === 1 ? 'member' : 'members'}
              </span>
            </button>
          );
        })}
      </div>

      {/* My Team — same L-1 manager */}
      {tab === 'team' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Team</CardTitle>
            <p className="text-sm text-muted-foreground">
              Everyone who shares your L-1 Manager. Reach out and grow together.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {crossline.length === 0 ? (
              <EmptyState>
                You don&apos;t have teammates under your L-1 Manager yet — or you report
                directly to the club. As your manager&apos;s team grows, they&apos;ll appear here.
              </EmptyState>
            ) : (
              crossline.map((m) => <MemberRow key={m.id} member={m} />)
            )}
          </CardContent>
        </Card>
      )}

      {/* My Upline */}
      {tab === 'upline' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Upline</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your sponsor (L-1 Manager) and the leaders above you.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {upline.l1 ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">
                  Your Sponsor · L-1 Manager
                </p>
                <MemberRow member={upline.l1} highlight levelLabel="L-1" />
              </div>
            ) : (
              <EmptyState>
                You don&apos;t have an L-1 Manager yet — you report directly to the club.
                Pick a manager below.
              </EmptyState>
            )}

            {(upline.l2 || upline.l3 || upline.clubAdmin) && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Higher up
                </p>
                {upline.l2 && <MemberRow member={upline.l2} levelLabel="L-2" />}
                {upline.l3 && <MemberRow member={upline.l3} levelLabel="L-3" />}
                {upline.clubAdmin && (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <Crown className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold">{upline.clubAdmin.name}</span>
                      <div className="text-xs text-muted-foreground">
                        {upline.clubAdmin.memberId} · Club Admin
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Change my L-1 Manager</p>
              <ChangeManagerForm managers={managers} currentL1ManagerId={currentL1ManagerId} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Downline */}
      {tab === 'downline' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Downline</CardTitle>
            <p className="text-sm text-muted-foreground">
              Everyone you manage — your direct (L-1) team is most important, then L-2 and L-3.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {downline.l1.length === 0 ? (
              <EmptyState>
                You have no downline yet. As members join under you, they&apos;ll show up here.
              </EmptyState>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Your direct team · L-1 ({downline.l1.length})
                  </p>
                  {downline.l1.map((m) => (
                    <MemberRow key={m.id} member={m} highlight levelLabel="L-1" />
                  ))}
                </div>
                {downline.l2.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      L-2 ({downline.l2.length})
                    </p>
                    {downline.l2.map((m) => (
                      <MemberRow key={m.id} member={m} levelLabel="L-2" />
                    ))}
                  </div>
                )}
                {downline.l3.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      L-3 ({downline.l3.length})
                    </p>
                    {downline.l3.map((m) => (
                      <MemberRow key={m.id} member={m} levelLabel="L-3" />
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

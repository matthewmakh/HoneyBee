import { requireReferrerAccess } from '@/lib/auth';
import Link from 'next/link';
import {
  getMemberCard,
  getCrossline,
  getUplineCards,
  getDownlineCards,
  listManagersAndAbove,
} from '@/lib/services/teams';
import { prisma } from '@/lib/db';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Card,
  CardContent,
} from '@/components/ui';
import { BackButton } from '@/components/back-button';
import { getInitials } from '@/lib/utils';
import { TEAM_ROLE_LABELS } from '@/lib/types';
import { TeamExplorer } from './team-explorer';
import { Mail, Phone, ExternalLink, UserCheck } from 'lucide-react';

export default async function TeamPage() {
  const user = await requireReferrerAccess();

  const [me, crossline, upline, downline, managers, companyMeta] = await Promise.all([
    getMemberCard(user.companyId),
    getCrossline(user.companyId),
    getUplineCards(user.companyId),
    getDownlineCards(user.companyId),
    listManagersAndAbove(),
    prisma.company.findUnique({
      where: { id: user.companyId },
      select: { l1ManagerCompanyId: true },
    }),
  ]);

  const managerOptions = managers
    .filter((m) => m.id !== user.companyId)
    .map((m) => ({
      id: m.id,
      name: m.name,
      memberId: m.memberId,
      teamRole: TEAM_ROLE_LABELS[m.teamRole],
    }));

  const sponsor = upline.l1;

  return (
    <div className="space-y-6 max-w-4xl">
      <BackButton href="/dashboard/referrer" label="Back to dashboard" />

      {/* Prominent identity header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-4 ring-amber-400/40 shrink-0">
              <AvatarImage src={me?.logoUrl ?? undefined} />
              <AvatarFallback className="bg-amber-400 text-slate-900 text-2xl font-bold">
                {getInitials(me?.name ?? user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-white">
              <h1 className="text-2xl md:text-3xl font-bold truncate">{me?.name}</h1>
              <p className="text-sm text-slate-300">{user.name}</p>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <Badge className="bg-amber-400 text-slate-900 hover:bg-amber-400">
                  {me ? TEAM_ROLE_LABELS[me.teamRole] : 'Member'}
                </Badge>
                <span className="text-xs font-mono text-slate-300">{me?.memberId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsor / L-1 Manager line */}
        <CardContent className="py-4">
          {sponsor ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Your Sponsor · L-1 Manager
                  </p>
                  <p className="font-semibold">{sponsor.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {sponsor.memberId} · {TEAM_ROLE_LABELS[sponsor.teamRole]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {sponsor.email && (
                  <a href={`mailto:${sponsor.email}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                    <Mail className="h-4 w-4" /> Email
                  </a>
                )}
                {sponsor.phone && (
                  <a href={`tel:${sponsor.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                    <Phone className="h-4 w-4" /> Call
                  </a>
                )}
                {sponsor.publicSlug && (
                  <Link href={`/p/${sponsor.publicSlug}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                    <ExternalLink className="h-4 w-4" /> Learn more
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                You report directly to the club. Choose an L-1 Manager under{' '}
                <span className="font-medium">My Upline</span> below.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <TeamExplorer
        crossline={crossline}
        upline={upline}
        downline={downline}
        managers={managerOptions}
        currentL1ManagerId={companyMeta?.l1ManagerCompanyId ?? null}
      />
    </div>
  );
}

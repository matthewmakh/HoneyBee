import { requireReferrerAccess } from '@/lib/auth';
import {
  getUplineCompanies,
  getDownlineTree,
  listManagersAndAbove,
  getContactsForCompanies,
} from '@/lib/services/teams';
import { prisma } from '@/lib/db';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/ui';
import { BackButton } from '@/components/back-button';
import { TEAM_ROLE_LABELS } from '@/lib/types';
import { TeamTree } from '@/components/team-tree';
import { ChangeManagerForm } from './change-manager-form';
import { Mail, Phone } from 'lucide-react';

export default async function TeamPage() {
  const user = await requireReferrerAccess();

  const [me, upline, tree, managers] = await Promise.all([
    prisma.company.findUnique({
      where: { id: user.companyId },
      select: {
        id: true,
        name: true,
        memberId: true,
        teamRole: true,
        l1ManagerCompanyId: true,
      },
    }),
    getUplineCompanies(user.companyId),
    getDownlineTree(user.companyId, 3),
    listManagersAndAbove(),
  ]);

  const uplineContacts = await getContactsForCompanies(upline.map((u) => u.id));

  const managerOptions = managers
    .filter((m) => m.id !== user.companyId)
    .map((m) => ({
      id: m.id,
      name: m.name,
      memberId: m.memberId,
      teamRole: TEAM_ROLE_LABELS[m.teamRole],
    }));

  return (
    <div className="space-y-6 max-w-4xl">
      <BackButton href="/dashboard/referrer" label="Back to dashboard" />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Team</h1>
        <p className="text-sm text-muted-foreground">
          See your upline and your Bee Team downline, contact anyone directly, and
          change your L-1 Manager.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>You</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium">{me?.name}</p>
            <p className="text-xs text-muted-foreground">{me?.memberId}</p>
          </div>
          {me && (
            <Badge variant="outline">{TEAM_ROLE_LABELS[me.teamRole]}</Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upline</CardTitle>
          <CardDescription>Your managers and club admin.</CardDescription>
        </CardHeader>
        <CardContent>
          {upline.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No upline yet. Set your L-1 Manager below.
            </p>
          ) : (
            <ol className="space-y-2">
              {upline.map((u, i) => {
                const contact = uplineContacts.get(u.id);
                return (
                  <li
                    key={u.id}
                    className="flex items-center justify-between border rounded-md p-3 gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Level {i + 1}
                      </div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.memberId}</div>
                      {contact && (
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              {contact.email}
                            </a>
                          )}
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone}`}
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              {contact.phone}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {TEAM_ROLE_LABELS[u.teamRole]}
                    </Badge>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Bee Team / Downline</CardTitle>
          <CardDescription>
            {tree.directDownline.length === 0
              ? 'You have no direct downline yet.'
              : 'Members directly or indirectly managed by you (up to 3 levels).'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tree.directDownline.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              As members join under you, they&apos;ll appear here.
            </p>
          ) : (
            <TeamTree node={tree} showContact />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change my L-1 Manager</CardTitle>
          <CardDescription>
            Pick a new direct manager from the list of managers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangeManagerForm
            managers={managerOptions}
            currentL1ManagerId={me?.l1ManagerCompanyId ?? null}
          />
        </CardContent>
      </Card>
    </div>
  );
}

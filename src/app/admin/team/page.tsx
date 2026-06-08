import { requireSuperAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getDownlineTree, listManagersAndAbove } from '@/lib/services/teams';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/ui';
import { TEAM_ROLE_LABELS } from '@/lib/types';
import { TeamTree } from '@/components/team-tree';
import { AssignManagerForm } from './assign-manager-form';
import { UserX } from 'lucide-react';

export default async function AdminTeamPage() {
  await requireSuperAdmin();

  // Find the CLUB_ADMIN root(s). If none, show orphan view.
  const admins = await prisma.company.findMany({
    where: { teamRole: 'CLUB_ADMIN' },
    select: { id: true, name: true, memberId: true, teamRole: true },
    orderBy: { name: 'asc' },
  });

  const [trees, managers] = await Promise.all([
    Promise.all(admins.map((a) => getDownlineTree(a.id, 6))),
    listManagersAndAbove(),
  ]);

  const managerOptions = managers.map((m) => ({
    id: m.id,
    name: m.name,
    memberId: m.memberId,
    teamRole: TEAM_ROLE_LABELS[m.teamRole],
  }));

  const orphans = await prisma.company.findMany({
    where: {
      l1ManagerCompanyId: null,
      teamRole: { notIn: ['CLUB_ADMIN', 'PROVIDER'] },
    },
    select: {
      id: true,
      name: true,
      memberId: true,
      teamRole: true,
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground">
          Full MLM tree. Assign managers to unassigned members below.
        </p>
      </div>

      {/* Unassigned members first so admins can act on them right away. */}
      <Card className={orphans.length > 0 ? 'border-amber-300' : undefined}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-amber-600" />
            Unassigned members
          </CardTitle>
          <CardDescription>
            Members with no L-1 Manager report directly to the club until one is
            assigned. {orphans.length} member{orphans.length !== 1 ? 's' : ''} need a
            manager.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {orphans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Every member currently has a manager. 🎉
            </p>
          ) : (
            orphans.map((o) => (
              <div
                key={o.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border rounded-md p-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{o.name}</span>
                  <span className="text-xs text-muted-foreground">{o.memberId}</span>
                  <Badge variant="outline">{TEAM_ROLE_LABELS[o.teamRole]}</Badge>
                </div>
                <AssignManagerForm memberCompanyId={o.id} managers={managerOptions} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {trees.map((t) => (
        <Card key={t.id}>
          <CardHeader>
            <CardTitle>{t.name}</CardTitle>
            <CardDescription>{t.memberId} · Club Admin root</CardDescription>
          </CardHeader>
          <CardContent>
            <TeamTree node={t} showContact />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

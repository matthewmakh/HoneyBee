import { requireSuperAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getDownlineTree } from '@/lib/services/teams';
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

export default async function AdminTeamPage() {
  await requireSuperAdmin();

  // Find the CLUB_ADMIN root(s). If none, show orphan view.
  const admins = await prisma.company.findMany({
    where: { teamRole: 'CLUB_ADMIN' },
    select: { id: true, name: true, memberId: true, teamRole: true },
    orderBy: { name: 'asc' },
  });

  const trees = await Promise.all(admins.map((a) => getDownlineTree(a.id, 6)));

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
          Full MLM tree. Move members via the member&apos;s referrer team page.
        </p>
      </div>

      {trees.map((t) => (
        <Card key={t.id}>
          <CardHeader>
            <CardTitle>{t.name}</CardTitle>
            <CardDescription>{t.memberId} · Club Admin root</CardDescription>
          </CardHeader>
          <CardContent>
            <TeamTree node={t} />
          </CardContent>
        </Card>
      ))}

      {orphans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned members</CardTitle>
            <CardDescription>Members with no L-1 Manager set.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {orphans.map((o) => (
              <div
                key={o.id}
                className="flex justify-between items-center border rounded-md p-2 text-sm"
              >
                <div>
                  <span className="font-medium">{o.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{o.memberId}</span>
                </div>
                <Badge variant="outline">{TEAM_ROLE_LABELS[o.teamRole]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

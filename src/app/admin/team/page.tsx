import { requireSuperAdmin } from '@/lib/auth';
import { getAdminUsers } from '@/lib/services/team';
import { TeamList } from './team-list';

export const metadata = { title: 'Admin Team' };

export default async function TeamPage() {
  const actor = await requireSuperAdmin();
  const admins = await getAdminUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Team</h1>
        <p className="text-muted-foreground">
          Accounts with full platform access — approvals, payouts, and every company record.
        </p>
      </div>

      <TeamList
        admins={admins.map((admin) => ({
          ...admin,
          lastActiveAt: admin.lastActiveAt?.toISOString() ?? null,
          createdAt: admin.createdAt.toISOString(),
        }))}
        currentUserId={actor.id}
      />
    </div>
  );
}

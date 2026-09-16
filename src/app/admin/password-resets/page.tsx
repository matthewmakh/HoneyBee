import { requireClubAdmin } from '@/lib/auth';
import { listOpenResetRequests } from '@/lib/services/password-reset';
import { ResetManager } from './reset-manager';

export default async function PasswordResetsPage() {
  await requireClubAdmin();

  const requests = await listOpenResetRequests();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Password Resets</h1>
        <p className="text-sm text-muted-foreground">
          Help members back into their accounts. There&apos;s no automated email
          yet, so you deliver the reset link yourself.
        </p>
      </div>

      <ResetManager
        requests={requests.map((r) => ({
          token: r.token,
          createdAt: r.createdAt.toISOString(),
          expiresAt: r.expiresAt.toISOString(),
          userName: r.userName,
          email: r.email,
          companyName: r.companyName,
          memberId: r.memberId,
        }))}
      />
    </div>
  );
}

import { requireClubAdmin } from '@/lib/auth';
import { getPendingWithdrawalRequests } from '@/lib/services/finance';
import { WithdrawalsList } from './withdrawals-list';

export default async function AdminWithdrawalsPage() {
  await requireClubAdmin();

  const requests = await getPendingWithdrawalRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Withdrawal Requests</h1>
        <p className="text-muted-foreground">
          Review and process referrer cash withdrawal requests.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{requests.length} pending</span>
      </div>

      <WithdrawalsList requests={requests} />
    </div>
  );
}

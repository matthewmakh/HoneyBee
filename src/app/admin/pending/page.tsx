import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getLeadsAwaitingConfirmation } from '@/lib/services/leads';
import { PendingDealsList } from './pending-deals-list';
import { serializeDecimal } from '@/lib/utils';

export default async function PendingDealsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    redirect('/login');
  }

  const leads = await getLeadsAwaitingConfirmation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pending Confirmations</h1>
        <p className="text-muted-foreground">
          Review completed jobs and confirm to release commissions
        </p>
      </div>

      <PendingDealsList leads={serializeDecimal(leads)} />
    </div>
  );
}

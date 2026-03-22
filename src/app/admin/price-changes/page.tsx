import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getPendingPriceChangeRequests } from '@/lib/services/leads';
import { PriceChangesList } from './price-changes-list';
import { serializeDecimal } from '@/lib/utils';
import type { PriceChangeRequestWithLead } from '@/lib/types';

export default async function PriceChangesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    redirect('/login');
  }

  const requests = await getPendingPriceChangeRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Price Change Requests</h1>
        <p className="text-muted-foreground">
          Review and approve or reject provider price change requests
        </p>
      </div>

      <PriceChangesList requests={serializeDecimal(requests) as PriceChangeRequestWithLead[]} />
    </div>
  );
}

import { requireClubAdmin } from '@/lib/auth';
import { getGlobalPayouts } from '@/lib/services/payouts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { PAYOUT_LINE_LABELS } from '@/lib/types';
import { PayoutsList } from './payouts-list';

export default async function AdminPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireClubAdmin();
  const params = await searchParams;
  const status = (params.status ?? 'AVAILABLE') as
    | 'AVAILABLE'
    | 'PENDING_COMPLETION'
    | 'PAID';

  const rows = await getGlobalPayouts(status);

  const shaped = rows.map((r) => ({
    id: r.id,
    leadId: r.leadId,
    lineType: r.lineType,
    lineLabel: PAYOUT_LINE_LABELS[r.lineType],
    amount: Number(r.amount),
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    beneficiaryName: r.beneficiaryCompany?.name ?? '—',
    beneficiaryMemberId: r.beneficiaryCompany?.memberId ?? '—',
    providerName: r.lead.providerCompany?.name ?? '—',
    homeownerName: r.lead.homeownerName,
  }));

  const total = shaped.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Payouts</h1>
        <p className="text-sm text-muted-foreground">
          Global 12-line payout ledger. Mark available lines as paid when
          settled off-platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter by status</CardTitle>
          <CardDescription>
            Showing {shaped.length} rows · total ${total.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PayoutsList rows={shaped} currentStatus={status} />
        </CardContent>
      </Card>
    </div>
  );
}

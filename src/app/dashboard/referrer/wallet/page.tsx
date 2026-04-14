import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCompanyBalances, getCompanyWithdrawalRequests } from '@/lib/services/finance';
import { getPayoutsForBeneficiary, getPayoutSummary } from '@/lib/services/payouts';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { WithdrawalDialog } from './withdrawal-dialog';
import { Clock, CheckCircle, XCircle, Wallet, CircleDollarSign, Sparkles } from 'lucide-react';
import type { PayoutLineRow, PayoutStatus } from '@/lib/types';
import { payoutStatusColor } from '@/lib/types';

const WITHDRAWAL_STATUS_LABELS = {
  PENDING: 'Pending',
  COMPLETED: 'Paid',
  REJECTED: 'Rejected',
} as const;

const WITHDRAWAL_STATUS_VARIANTS = {
  PENDING: 'outline',
  COMPLETED: 'default',
  REJECTED: 'destructive',
} as const;

const PAYOUT_STATUS_LABEL: Record<PayoutStatus, string> = {
  AVAILABLE: 'Available',
  PENDING_COMPLETION: 'Pending completion',
  PAID: 'Paid',
};

function colorClass(status: PayoutStatus): string {
  const c = payoutStatusColor(status);
  if (c === 'green') return 'text-green-700';
  if (c === 'black') return 'text-foreground';
  return 'text-muted-foreground';
}

export default async function WalletPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (!session.user.company.canUseReferrerPortal && session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  const [balances, summary, rows, withdrawals] = await Promise.all([
    getCompanyBalances(session.user.companyId),
    getPayoutSummary(session.user.companyId),
    getPayoutsForBeneficiary(session.user.companyId),
    getCompanyWithdrawalRequests(session.user.companyId),
  ]);

  // Group rows by lead for a "per-job 12-line breakdown" view
  const byLead = new Map<string, PayoutLineRow[]>();
  for (const r of rows) {
    const list = byLead.get(r.leadId) ?? [];
    list.push(r);
    byLead.set(r.leadId, list);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">
            Your 12-line referral payouts, grouped by job.
          </p>
        </div>
        <WithdrawalDialog cashBalance={balances.cashBalance} />
      </div>

      {/* Summary cards: green / grey / black */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available (green)</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(summary.green)}
            </div>
            <p className="text-xs text-muted-foreground">Ready to withdraw.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending (grey)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {formatCurrency(summary.grey)}
            </div>
            <p className="text-xs text-muted-foreground">Jobs not yet confirmed.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid YTD</CardTitle>
            <Wallet className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.ytdBlack)}</div>
            <p className="text-xs text-muted-foreground">This calendar year.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lifetime total</CardTitle>
            <Sparkles className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.lifetime)}</div>
            <p className="text-xs text-muted-foreground">All-time, all statuses.</p>
          </CardContent>
        </Card>
      </div>

      {/* 12-line breakdown per job */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Payout lines by job</h2>
        {byLead.size === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No payout lines yet. Your first completed referral will populate this list.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {[...byLead.entries()].map(([leadId, lines]) => {
              const total = lines.reduce((s, l) => s + l.amount, 0);
              return (
                <Card key={leadId}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-baseline">
                      <CardTitle className="text-base">Lead {leadId.slice(-6)}</CardTitle>
                      <span className="text-sm font-semibold">
                        {formatCurrency(total)}
                      </span>
                    </div>
                    <CardDescription>
                      {lines.length} payout lines for this referral
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <table className="w-full text-sm">
                      <tbody>
                        {lines.map((l) => (
                          <tr key={l.id} className="border-t">
                            <td className="py-1.5 pr-4">{l.label}</td>
                            <td className={`py-1.5 pr-4 text-xs ${colorClass(l.status)}`}>
                              {PAYOUT_STATUS_LABEL[l.status]}
                            </td>
                            <td
                              className={`py-1.5 text-right font-medium ${colorClass(l.status)}`}
                            >
                              {formatCurrency(l.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdrawals (unchanged) */}
      {withdrawals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Withdrawal Requests</h2>
          <div className="rounded-lg border divide-y">
            {withdrawals.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {req.status === 'COMPLETED' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  ) : req.status === 'REJECTED' ? (
                    <XCircle className="h-5 w-5 text-destructive shrink-0" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">
                      {formatCurrency(Number(req.amount))} withdrawal
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(req.createdAt).toLocaleDateString()}
                      {req.notes && ` · ${req.notes}`}
                    </p>
                  </div>
                </div>
                <Badge variant={WITHDRAWAL_STATUS_VARIANTS[req.status]}>
                  {WITHDRAWAL_STATUS_LABELS[req.status]}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

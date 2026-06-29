import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCompanyBalances, getCompanyWithdrawalRequests } from '@/lib/services/finance';
import { getPayoutSummary, getLeadSplits, getEarningsByCategory } from '@/lib/services/payouts';
import { Badge, Card, CardContent } from '@/components/ui';
import { BackButton } from '@/components/back-button';
import { JobSplitList } from '@/components/job-split-list';
import { formatCurrency } from '@/lib/utils';
import { WithdrawalDialog } from './withdrawal-dialog';
import { Clock, CheckCircle, XCircle, Wallet, Sparkles, Zap, Info } from 'lucide-react';
import { PAYOUT_CATEGORY_ORDER } from '@/lib/types';

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

export default async function WalletPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (!session.user.company.canUseReferrerPortal && session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  const companyId = session.user.companyId;
  const [balances, summary, splits, byCategory, withdrawals] = await Promise.all([
    getCompanyBalances(companyId),
    getPayoutSummary(companyId),
    getLeadSplits(companyId, 'referrer'),
    getEarningsByCategory(companyId),
    getCompanyWithdrawalRequests(companyId),
  ]);

  const categoryRows = PAYOUT_CATEGORY_ORDER.map((category) => ({
    category,
    ...(byCategory.get(category) ?? { available: 0, pending: 0, total: 0 }),
  })).filter((r) => r.total > 0);

  return (
    <div className="space-y-8">
      <BackButton href="/dashboard/referrer" label="Back to dashboard" />

      {/* Hero */}
      <Card className="overflow-hidden border-0">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-7 text-white">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <p className="text-sm text-slate-300 flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Wallet
              </p>
              <p className="mt-1 text-4xl font-bold text-amber-400">
                {formatCurrency(summary.green)}
              </p>
              <p className="text-sm text-slate-300">available to withdraw now</p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-slate-400">Pending</p>
                <p className="text-xl font-semibold">{formatCurrency(summary.grey)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Paid YTD</p>
                <p className="text-xl font-semibold">{formatCurrency(summary.ytdBlack)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Lifetime
                </p>
                <p className="text-xl font-semibold">{formatCurrency(summary.lifetime)}</p>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <WithdrawalDialog cashBalance={balances.cashBalance} />
          </div>
        </div>
      </Card>

      {/* Cash payout note */}
      <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
        <Zap className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          <span className="font-semibold">Cash commissions are paid within 24 hours</span> of
          the club receiving them. Every other split accrues in your wallet and is shown below.
        </p>
      </div>

      {/* Earnings by split */}
      {categoryRows.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Your earnings by split</h2>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 px-4 font-medium">Split</th>
                    <th className="py-2 px-4 font-medium text-right">Available</th>
                    <th className="py-2 px-4 font-medium text-right">Pending</th>
                    <th className="py-2 px-4 font-medium text-right">Lifetime</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryRows.map((r) => (
                    <tr key={r.category} className="border-b last:border-0">
                      <td className="py-2 px-4 font-medium">{r.category}</td>
                      <td className="py-2 px-4 text-right text-green-700">{formatCurrency(r.available)}</td>
                      <td className="py-2 px-4 text-right text-muted-foreground">{formatCurrency(r.pending)}</td>
                      <td className="py-2 px-4 text-right font-semibold">{formatCurrency(r.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full split list per referral */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">All commission splits</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            Every split for each referral — your earnings are highlighted; splits you&apos;re
            not eligible for are greyed out.
          </p>
        </div>
        {splits.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No commission splits yet. Once an A-Team accepts one of your referrals, the
              full breakdown shows up here.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {splits.map((split) => (
              <JobSplitList key={split.leadId} split={split} viewerCompanyId={companyId} />
            ))}
          </div>
        )}
      </div>

      {/* Withdrawals */}
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
                    <p className="font-medium">{formatCurrency(Number(req.amount))} withdrawal</p>
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

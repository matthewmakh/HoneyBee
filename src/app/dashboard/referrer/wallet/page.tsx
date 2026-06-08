import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCompanyBalances, getCompanyWithdrawalRequests } from '@/lib/services/finance';
import { getPayoutSummary, getLeadSplits, getEarningsByCategory } from '@/lib/services/payouts';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { BackButton } from '@/components/back-button';
import { CommissionSplitCard } from '@/components/commission-split';
import { formatCurrency } from '@/lib/utils';
import { WithdrawalDialog } from './withdrawal-dialog';
import { Clock, CheckCircle, XCircle, Wallet, CircleDollarSign, Sparkles } from 'lucide-react';
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

  const [balances, summary, splits, byCategory, withdrawals] = await Promise.all([
    getCompanyBalances(session.user.companyId),
    getPayoutSummary(session.user.companyId),
    getLeadSplits(session.user.companyId, 'referrer'),
    getEarningsByCategory(session.user.companyId),
    getCompanyWithdrawalRequests(session.user.companyId),
  ]);

  const categoryRows = PAYOUT_CATEGORY_ORDER.map((category) => ({
    category,
    ...(byCategory.get(category) ?? { available: 0, pending: 0, total: 0 }),
  })).filter((r) => r.total > 0);

  return (
    <div className="space-y-8">
      <BackButton href="/dashboard/referrer" label="Back to dashboard" />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">
            Your earnings, the commission splits, and where every penny of each
            referral goes.
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

      {/* Your earnings, separated by commission-split category */}
      {categoryRows.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Your earnings by split</h2>
          <p className="text-sm text-muted-foreground">
            Every commission split you personally benefit from — your direct
            referrals, any management overrides, lifetime sponsor, and pool bonuses.
          </p>
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
                      <td className="py-2 px-4">{r.category}</td>
                      <td className="py-2 px-4 text-right text-green-700">
                        {formatCurrency(r.available)}
                      </td>
                      <td className="py-2 px-4 text-right text-muted-foreground">
                        {formatCurrency(r.pending)}
                      </td>
                      <td className="py-2 px-4 text-right font-medium">
                        {formatCurrency(r.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full split per referral — "where every penny went" */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Where every penny goes</h2>
          <p className="text-sm text-muted-foreground">
            The complete commission split for each of your referrals — to you, your
            management team, the club, member benefits, and the platform.
          </p>
        </div>
        {splits.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No commission splits yet. Once an A-Team accepts one of your referrals,
              the full breakdown shows up here.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {splits.map((split) => (
              <CommissionSplitCard
                key={split.leadId}
                split={split}
                subtitle={`Worked by ${split.providerName} · #${split.leadId.slice(-6)}`}
              />
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

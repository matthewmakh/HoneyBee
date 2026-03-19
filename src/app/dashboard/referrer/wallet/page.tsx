import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCompanyBalances, getCompanyTransactionHistory } from '@/lib/services/finance';
import { getCompanyWithdrawalRequests } from '@/lib/services/finance';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { WithdrawalDialog } from './withdrawal-dialog';
import { DollarSign, Gift, Clock, CheckCircle, XCircle } from 'lucide-react';

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

  const [balances, transactions, withdrawals] = await Promise.all([
    getCompanyBalances(session.user.companyId),
    getCompanyTransactionHistory(session.user.companyId, 50),
    getCompanyWithdrawalRequests(session.user.companyId),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">Your earnings and withdrawal history</p>
        </div>
        <WithdrawalDialog cashBalance={balances.cashBalance} />
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(balances.cashBalance)}</div>
            <p className="text-xs text-muted-foreground mt-1">Available for withdrawal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benefits Balance</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(balances.benefitsBalance)}</div>
            <p className="text-xs text-muted-foreground mt-1">Use in the Benefits Marketplace</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal History */}
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

      {/* Transaction History */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Earnings will appear here once your referrals are completed and confirmed.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border divide-y">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {tx.type === 'CASH' ? (
                    <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Gift className="h-4 w-4 text-amber-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {tx.type === 'CASH' ? 'Cash Credit' : 'Benefits Credit'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.lead.homeownerName} · {tx.lead.category}
                      {tx.lead.providerCompany && ` · ${tx.lead.providerCompany.name}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-green-700">+{formatCurrency(Number(tx.amount))}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

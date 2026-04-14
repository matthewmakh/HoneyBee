import { requireProviderAccess } from '@/lib/auth';
import { getProviderOwed } from '@/lib/services/payouts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TrendingUp, DollarSign, Wallet } from 'lucide-react';

export default async function ProviderWalletPage() {
  const user = await requireProviderAccess();
  const owed = await getProviderOwed(user.companyId);

  const roiPct = Math.round(owed.roi * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Wallet &amp; ROI</h1>
        <p className="text-sm text-muted-foreground">
          Track commissions you owe on referrer-closed jobs and your return on investment.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Owed</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(owed.owedBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Total commission owed across all completed deals.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Referral Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(owed.totalJobValueFromReferrals)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gross job value from Honeybee referrals.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roiPct}%</div>
            <p className="text-xs text-muted-foreground">
              (Job value − commission) ÷ commission paid
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission charges</CardTitle>
          <CardDescription>Every completed job and the commission recorded against you.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {owed.charges.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No completed referrals yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Homeowner</TableHead>
                  <TableHead>Referrer</TableHead>
                  <TableHead className="text-right">Job Value</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {owed.charges.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{formatDate(c.createdAt)}</TableCell>
                    <TableCell>{c.lead.homeownerName}</TableCell>
                    <TableCell>{c.lead.referrerCompany?.name ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(c.lead.reportedJobValue ?? 0))}
                    </TableCell>
                    <TableCell className="text-right text-red-700">
                      {formatCurrency(Number(c.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

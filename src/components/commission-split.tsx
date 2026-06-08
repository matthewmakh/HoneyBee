import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import {
  PAYOUT_CATEGORY_ORDER,
  payoutStatusColor,
  type PayoutStatus,
} from '@/lib/types';
import type { LeadSplit } from '@/lib/services/payouts';

const STATUS_LABEL: Record<PayoutStatus, string> = {
  AVAILABLE: 'Available',
  PENDING_COMPLETION: 'Pending',
  PAID: 'Paid',
};

function statusClass(status: PayoutStatus): string {
  const c = payoutStatusColor(status);
  if (c === 'green') return 'text-green-700';
  if (c === 'black') return 'text-foreground';
  return 'text-muted-foreground';
}

/**
 * Renders the full "where every penny went" split for a single lead, grouped by
 * category (to the referrer, management, club, benefits, platform...).
 */
export function CommissionSplitCard({
  split,
  subtitle,
}: {
  split: LeadSplit;
  subtitle?: string;
}) {
  // Group lines by their category, preserving the canonical order.
  const byCategory = PAYOUT_CATEGORY_ORDER.map((category) => ({
    category,
    lines: split.lines.filter((l) => l.category === category),
    subtotal: split.lines
      .filter((l) => l.category === category)
      .reduce((s, l) => s + l.amount, 0),
  })).filter((g) => g.lines.length > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle className="text-base">{split.homeownerName}</CardTitle>
          <span className="text-sm font-semibold">{formatCurrency(split.totalCommission)}</span>
        </div>
        <CardDescription>
          {subtitle ?? `Referral #${split.leadId.slice(-6)}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <table className="w-full text-sm">
          <tbody>
            {byCategory.map((group) => (
              <CategoryRows
                key={group.category}
                category={group.category}
                subtotal={group.subtotal}
                lines={group.lines}
              />
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function CategoryRows({
  category,
  subtotal,
  lines,
}: {
  category: string;
  subtotal: number;
  lines: LeadSplit['lines'];
}) {
  return (
    <>
      <tr className="border-t bg-muted/40">
        <td className="py-1.5 pl-2 pr-4 font-medium" colSpan={2}>
          {category}
        </td>
        <td className="py-1.5 pr-2 text-right font-medium">{formatCurrency(subtotal)}</td>
      </tr>
      {lines.map((l) => (
        <tr key={l.id} className="border-t">
          <td className="py-1.5 pl-6 pr-4 text-muted-foreground">
            {l.label}
            {l.beneficiaryName ? ` · ${l.beneficiaryName}` : ''}
          </td>
          <td className={`py-1.5 pr-4 text-xs ${statusClass(l.status)}`}>
            {STATUS_LABEL[l.status]}
          </td>
          <td className={`py-1.5 pr-2 text-right ${statusClass(l.status)}`}>
            {formatCurrency(l.amount)}
          </td>
        </tr>
      ))}
    </>
  );
}

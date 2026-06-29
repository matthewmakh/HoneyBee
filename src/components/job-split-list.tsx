import { Card, CardContent, CardHeader } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';
import { payoutStatusColor, type PayoutStatus } from '@/lib/types';
import type { LeadSplit } from '@/lib/services/payouts';
import { Clock, CheckCircle2, Wallet, Zap } from 'lucide-react';

function StatusPill({ status }: { status: PayoutStatus }) {
  const color = payoutStatusColor(status);
  if (color === 'green') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
        <CheckCircle2 className="h-3 w-3" /> Available
      </span>
    );
  }
  if (color === 'black') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">
        <Wallet className="h-3 w-3" /> Paid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
      <Clock className="h-3 w-3" /> Pending
    </span>
  );
}

/**
 * A clean, full list of every commission split for one job. Lines the viewer
 * earns are highlighted; lines they're not eligible for are greyed. The cash
 * (direct referrer) line is flagged as paid within 24 hours.
 */
export function JobSplitList({
  split,
  viewerCompanyId,
}: {
  split: LeadSplit;
  viewerCompanyId: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 bg-muted/40 py-3">
        <div>
          <p className="font-semibold">{split.homeownerName}</p>
          <p className="text-xs text-muted-foreground">
            {split.providerName} · referred by {split.referrerName} · #{split.leadId.slice(-6)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total commission</p>
          <p className="text-lg font-bold">{formatCurrency(split.totalCommission)}</p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {split.lines.map((line) => {
            const isMine = !!line.beneficiaryCompanyId && line.beneficiaryCompanyId === viewerCompanyId;
            const isCash = line.lineType === 'DIRECT_REFERRER';
            const recipient = line.beneficiaryName ?? line.category;
            return (
              <li
                key={line.id}
                className={cn(
                  'flex items-center justify-between gap-3 px-4 py-2.5',
                  isMine ? 'bg-amber-50/70' : 'opacity-60'
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('font-medium truncate', !isMine && 'text-muted-foreground')}>
                      {recipient}
                    </span>
                    {isMine && (
                      <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-slate-900">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {line.label}
                    {isMine && isCash && (
                      <span className="ml-1 inline-flex items-center gap-0.5 text-green-700 font-medium">
                        <Zap className="h-3 w-3" /> Cash · paid within 24 hrs
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusPill status={line.status} />
                  <span
                    className={cn(
                      'w-20 text-right font-semibold tabular-nums',
                      !isMine && 'text-muted-foreground font-normal'
                    )}
                  >
                    {formatCurrency(line.amount)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
